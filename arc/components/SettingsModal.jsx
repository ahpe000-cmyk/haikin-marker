import React from "react";
import { INK, INK_SOFT, PAPER, CARD, SHU, TEXT_DARK, TEXT_DIM, GLOW } from "../theme";
import Bracket from "./Bracket";

// 設定モーダル：憲章と契約書（Web環境ではAPIキー設定・共有脳の手動貼り付けも）
const SettingsModal = ({ active, activeId, charter, setCharter, prompts, setPrompts, showApiKey, apiKey, setApiKey, workspaceId, setWorkspaceId, initialBrainText, onClose, onSave, isMobile }) => {
  // 共有脳の手動貼り付け（モーダルを開くたびに現在の共有脳で初期化）
  const [brainText, setBrainText] = React.useState(initialBrainText || "");
  return (
  <div className={"fixed inset-0 z-50 flex items-center justify-center " + (isMobile ? "p-2" : "p-6")} style={{ background: "rgba(3,6,12,0.78)", backdropFilter: "blur(4px)" }}>
    <Bracket style={{ width: "100%", maxWidth: "48rem", maxHeight: "100%" }}><div className="w-full max-h-full overflow-y-auto cut" style={{ background: CARD, border: "1px solid " + SHU + "33", boxShadow: "0 0 40px " + SHU + "1A" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid " + INK_SOFT }}>
        <div className="font-bold">共通憲章 と {active.num}{active.name} の雇用契約書</div>
        <button onClick={onClose} className="text-sm px-2" style={{ color: TEXT_DIM }}>閉じる</button>
      </div>
      <div className="px-6 py-4">
        {showApiKey && (
          <>
            <div className="text-xs font-semibold mb-1" style={{ color: TEXT_DIM }}>Anthropic APIキー（Web版のみ・このブラウザ内にのみ保存）</div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              className="w-full px-4 py-2.5 text-xs outline-none cut-sm"
              style={{ background: PAPER, border: "1px solid " + SHU + "33", color: TEXT_DARK, fontFamily: "inherit" }}
            />
            <div className="text-xs mt-1 mb-3" style={{ color: TEXT_DIM }}>
              ※ キーは console.anthropic.com で発行できます。このページのlocalStorageにのみ保存され、Anthropic API以外には送信されません。共有PCでは保存しないでください。
            </div>
            <div className="text-xs font-semibold mb-1" style={{ color: TEXT_DIM }}>ワークスペースID（ID連携型キーの場合のみ必須）</div>
            <input
              type="text"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="wrkspc_…"
              autoComplete="off"
              className="w-full px-4 py-2.5 text-xs outline-none cut-sm"
              style={{ background: PAPER, border: "1px solid " + SHU + "33", color: TEXT_DARK, fontFamily: "inherit" }}
            />
            <div className="text-xs mt-1 mb-4" style={{ color: TEXT_DIM }}>
              ※ 「anthropic-workspace-id is required」というエラーが出る場合に設定します。console.anthropic.com → Settings → Workspaces で対象ワークスペースのIDをコピーしてください。
            </div>
            <div className="text-xs font-semibold mb-1" style={{ color: TEXT_DIM }}>共有脳（Notion「AHPE共有ボード」の内容を手動貼り付け）</div>
            <textarea
              value={brainText}
              onChange={(e) => setBrainText(e.target.value)}
              rows={7}
              placeholder="NotionのAHPE共有ボードを開き、内容を全選択してここに貼り付ける"
              className="w-full px-4 py-3 text-xs leading-relaxed outline-none resize-y cut-sm"
              style={{ background: PAPER, border: "1px solid " + INK_SOFT, color: TEXT_DARK, fontFamily: "inherit" }}
            />
            <div className="text-xs mt-1 mb-4" style={{ color: TEXT_DIM }}>
              ※ WEB版ではNotion認証が使えないため「共有脳を同期」の代わりにここへ貼り付けます。保存すると全社員がこの内容を共有脳として参照します。空にして保存すると未同期に戻ります。
            </div>
          </>
        )}
        <div className="text-xs font-semibold mb-1" style={{ color: TEXT_DIM }}>共通憲章（全社員に適用・第1〜9条）</div>
        <textarea
          value={charter}
          onChange={(e) => setCharter(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 text-xs leading-relaxed outline-none resize-y cut-sm"
          style={{ background: PAPER, border: "1px solid " + INK_SOFT, color: TEXT_DARK, fontFamily: "inherit" }}
        />
        <div className="text-xs font-semibold mb-1 mt-4" style={{ color: TEXT_DIM }}>{active.num}{active.name} の個別契約書（システムプロンプト）</div>
        <textarea
          value={prompts[activeId] || ""}
          onChange={(e) => setPrompts((prev) => ({ ...prev, [activeId]: e.target.value }))}
          rows={7}
          className="w-full px-4 py-3 text-xs leading-relaxed outline-none resize-y cut-sm"
          style={{ background: PAPER, border: "1px solid " + INK_SOFT, color: TEXT_DARK, fontFamily: "inherit" }}
        />
        <div className="text-xs mt-2" style={{ color: TEXT_DIM }}>
          ※ 実際の雇用契約書（Notion等にある正式版）をここに貼り付けると、その社員として正確に稼働します。保存内容はこのアプリ内に永続化されます。
        </div>
      </div>
      <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: "1px solid " + INK_SOFT }}>
        <button onClick={onClose} className="px-4 py-2 text-sm cut-sm" style={{ background: "transparent", color: TEXT_DIM, border: "1px solid " + INK_SOFT }}>キャンセル</button>
        <button onClick={() => onSave(showApiKey ? brainText : undefined)} className="px-5 py-2 text-sm font-semibold cut-sm" style={{ background: SHU, color: INK, filter: "drop-shadow(0 0 6px " + SHU + "88)", letterSpacing: "0.06em" }}>保存</button>
      </div>
    </div></Bracket>
  </div>
  );
};

export default SettingsModal;
