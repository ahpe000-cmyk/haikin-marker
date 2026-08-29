import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// ARC（アーク）— AHPE AI社員 統括システム
// 藍染×朱印。出退勤札ボード風の社員名簿を左に、執務室（チャット）を中央に。
// 永続化: window.storage / AI: Anthropic API / 共有脳: Notion MCP
// ※ claude.aiアーティファクト環境専用（詳細はREADME.md）
// ============================================================

import { PAPER, TEXT_DARK, ALERT } from "./arc/theme";
import { EMPLOYEES, DEFAULT_CHARTER, DEFAULT_PROMPTS, NOTION_MCP } from "./arc/data";
import { sGet, sSet } from "./arc/storage";
import { postMessages, extractText, extractToolCalls } from "./arc/api";
import HUDStyles from "./arc/components/HUDStyles";
import LoadingScreen from "./arc/components/LoadingScreen";
import Sidebar from "./arc/components/Sidebar";
import MobileBar from "./arc/components/MobileBar";
import ChatHeader from "./arc/components/ChatHeader";
import MessageList from "./arc/components/MessageList";
import InputBar from "./arc/components/InputBar";
import SettingsModal from "./arc/components/SettingsModal";

export default function AHPEHeadquarters() {
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState("jarvis");
  const [charter, setCharter] = useState(DEFAULT_CHARTER);
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);
  const [chats, setChats] = useState({});           // {id: [{role, content, meta?}]}
  const [brain, setBrain] = useState(null);         // {content, updatedAt}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [brainLoading, setBrainLoading] = useState(false);
  const [notionOn, setNotionOn] = useState(false);  // 送信時にNotionツールを持たせるか
  const [webOn, setWebOn] = useState(false);        // 送信時にWeb検索を持たせるか
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const [clock, setClock] = useState(new Date());
  const scrollRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const active = EMPLOYEES.find((e) => e.id === activeId);
  const activeChat = chats[activeId] || [];

  // ---------- 起動時ロード ----------
  useEffect(() => {
    (async () => {
      const c = await sGet("ahpe-charter", DEFAULT_CHARTER);
      const p = await sGet("ahpe-prompts", DEFAULT_PROMPTS);
      const b = await sGet("ahpe-brain", null);
      const loaded = {};
      for (const emp of EMPLOYEES) {
        loaded[emp.id] = await sGet("ahpe-chat-" + emp.id, []);
      }
      setCharter(c);
      setPrompts({ ...DEFAULT_PROMPTS, ...p });
      setBrain(b);
      setChats(loaded);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chats, activeId, loading]);

  // ---------- システムプロンプト組み立て（憲章＋契約書＋共有脳） ----------
  const buildSystem = useCallback((empId) => {
    const emp = EMPLOYEES.find((e) => e.id === empId);
    const parts = [
      charter,
      "",
      "【あなたの雇用契約書】",
      "肩書: AHPE " + emp.num + emp.name + "（" + emp.role + "）",
      prompts[empId] || "",
      "",
      "【共通憲章 第9条・AHPE共有ボード（共有脳）】",
    ];
    if (brain && brain.content) {
      parts.push("最終同期: " + brain.updatedAt);
      parts.push(brain.content);
    } else {
      parts.push("（未同期。ヘッダーの「共有脳を同期」で読み込まれます。同期前である旨を必要に応じて代表に伝えること）");
    }
    parts.push("");
    parts.push("応答は日本語。憲章に従い、忖度せず、簡潔に。");
    return parts.join("\n");
  }, [charter, prompts, brain]);

  // ---------- 送信 ----------
  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError("");
    setInput("");
    setLoading(true);

    const history = (chats[activeId] || []).map((m) => ({ role: m.role, content: m.content }));
    const newUserMsg = { role: "user", content: text };
    const optimistic = [...(chats[activeId] || []), newUserMsg];
    setChats((prev) => ({ ...prev, [activeId]: optimistic }));

    try {
      const body = {
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: buildSystem(activeId),
        messages: [...history, newUserMsg],
      };
      if (notionOn) body.mcp_servers = NOTION_MCP;
      if (webOn) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

      const data = await postMessages(body);

      const answer = extractText(data) || "（応答テキストなし）";
      const tools = extractToolCalls(data);
      const asstMsg = { role: "assistant", content: answer, meta: tools.length ? "Notion操作: " + tools.join(", ") : null };
      const updated = [...optimistic, asstMsg];
      setChats((prev) => ({ ...prev, [activeId]: updated }));
      await sSet("ahpe-chat-" + activeId, updated);
    } catch (e) {
      setError("送信に失敗しました: " + e.message + " — もう一度お試しください。");
      setChats((prev) => ({ ...prev, [activeId]: optimistic }));
      await sSet("ahpe-chat-" + activeId, optimistic);
    } finally {
      setLoading(false);
    }
  };

  // ---------- 共有脳（Notion共有ボード）の同期 ----------
  const syncBrain = async () => {
    if (brainLoading) return;
    setError("");
    setBrainLoading(true);
    try {
      const data = await postMessages({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content:
              "Notionワークスペースで「AHPE共有ボード（AI社員の共有脳）」というページを検索して開いてください。その内容を【KPI実績】【決定事項ログ】【未解決の論点】【社員別最新状況】【稼働中Makeシナリオ】【預かり資産】【固定情報】の全セクションについて、数値・日付・固有名詞を一切省略も改変もせずに、箇条書きで密度高く整理して出力してください。前置き・後書き・感想は一切不要です。ページが見つからない場合は「NOT_FOUND」とだけ返してください。",
          },
        ],
        mcp_servers: NOTION_MCP,
      });
      const text = extractText(data);
      if (!text || text.includes("NOT_FOUND")) {
        throw new Error("「AHPE共有ボード」がNotionで見つかりませんでした。ページ名をご確認ください。");
      }
      const b = { content: text, updatedAt: new Date().toLocaleString("ja-JP") };
      setBrain(b);
      await sSet("ahpe-brain", b);
    } catch (e) {
      setError("共有脳の同期に失敗しました: " + e.message);
    } finally {
      setBrainLoading(false);
    }
  };

  const clearChat = async () => {
    setChats((prev) => ({ ...prev, [activeId]: [] }));
    await sSet("ahpe-chat-" + activeId, []);
  };

  const saveSettings = async () => {
    await sSet("ahpe-charter", charter);
    await sSet("ahpe-prompts", prompts);
    setSettingsOpen(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <div className={(isMobile ? "flex flex-col" : "flex") + " h-screen w-full overflow-hidden hud-grid"} style={{ background: PAPER, color: TEXT_DARK, fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif" }}>
      <HUDStyles />
      <div className="hud-crt" />

      {/* 左：出退勤札ボード（社員名簿）※PC時のみ */}
      {!isMobile && (
        <Sidebar activeId={activeId} onSelect={setActiveId} chats={chats} clock={clock} brain={brain} />
      )}

      {/* モバイル用：上部の社員チップバー */}
      {isMobile && (
        <MobileBar activeId={activeId} onSelect={setActiveId} clock={clock} />
      )}

      {/* 中央：執務室 */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          active={active}
          brain={brain}
          brainLoading={brainLoading}
          onSyncBrain={syncBrain}
          onOpenSettings={() => setSettingsOpen(true)}
          onClearChat={clearChat}
          isMobile={isMobile}
        />

        {/* エラー帯 */}
        {error && (
          <div className="px-6 py-2 text-xs" style={{ background: "rgba(255,90,95,0.12)", color: ALERT, borderBottom: "1px solid rgba(255,90,95,0.25)" }}>
            {error}
          </div>
        )}

        <MessageList
          active={active}
          messages={activeChat}
          loading={loading}
          scrollRef={scrollRef}
          isMobile={isMobile}
        />

        <InputBar
          active={active}
          input={input}
          setInput={setInput}
          onKey={onKey}
          onSend={send}
          loading={loading}
          notionOn={notionOn}
          setNotionOn={setNotionOn}
          webOn={webOn}
          setWebOn={setWebOn}
          isMobile={isMobile}
        />
      </main>

      {/* 設定モーダル：憲章と契約書 */}
      {settingsOpen && (
        <SettingsModal
          active={active}
          activeId={activeId}
          charter={charter}
          setCharter={setCharter}
          prompts={prompts}
          setPrompts={setPrompts}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
