import React from "react";
import { INK, INK_SOFT, CARD, SHU, TEXT_DARK, TEXT_DIM, GLOW } from "../theme";

// 入力欄＋Notion/Web検索トグル
const InputBar = ({ active, input, setInput, onKey, onSend, loading, notionOn, setNotionOn, webOn, setWebOn, isMobile }) => (
  <div className={"py-4 shrink-0 " + (isMobile ? "px-3" : "px-6")} style={{ background: CARD, borderTop: "1px solid " + INK_SOFT }}>
    <div className="flex items-end gap-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        rows={2}
        placeholder={isMobile ? active.num + active.name + "への指示" : active.num + active.name + "への指示（Enterで送信 / Shift+Enterで改行）"}
        className="flex-1 resize-none px-4 py-3 text-sm outline-none"
        style={{ background: "rgba(79,216,255,0.04)", border: "1px solid " + SHU + "33", color: TEXT_DARK }}
      />
      <button
        onClick={onSend}
        disabled={loading || !input.trim()}
        className={"text-sm font-semibold shrink-0 py-3 transition-all " + (isMobile ? "px-4" : "px-6")}
        style={{
          background: loading || !input.trim() ? "transparent" : SHU,
          color: loading || !input.trim() ? TEXT_DIM : INK,
          border: "1px solid " + (loading || !input.trim() ? INK_SOFT : SHU),
          boxShadow: loading || !input.trim() ? "none" : GLOW(SHU, 8),
          letterSpacing: "0.1em",
        }}
      >
        指示
      </button>
    </div>
    <label className="flex items-center gap-2 mt-2 text-xs cursor-pointer select-none" style={{ color: TEXT_DIM }}>
      <input type="checkbox" checked={notionOn} onChange={(e) => setNotionOn(e.target.checked)} style={{ accentColor: SHU }} />
      {isMobile ? "Notionツール（キュー・共有脳の読み書き）" : "この社員にNotionツールを持たせる（応答内でNotionの検索・読み書きが可能になります／応答は遅くなります）"}
    </label>
    <label className="flex items-center gap-2 mt-1 text-xs cursor-pointer select-none" style={{ color: TEXT_DIM }}>
      <input type="checkbox" checked={webOn} onChange={(e) => setWebOn(e.target.checked)} style={{ accentColor: SHU }} />
      {isMobile ? "Web検索（企業調査）" : "この社員にWeb検索を持たせる（企業調査・最新情報の取得が可能になります／応答は遅くなります）"}
    </label>
  </div>
);

export default InputBar;
