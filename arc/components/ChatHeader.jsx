import React from "react";
import { INK, INK_SOFT, CARD, SHU, SHU_DIM, ALERT, TEXT_DIM, GLOW, MONO } from "../theme";

// 執務室ヘッダー
const ChatHeader = ({ active, brain, brainLoading, onSyncBrain, onOpenSettings, onClearChat, isMobile }) => (
  <header className={"flex items-center shrink-0 " + (isMobile ? "gap-2 px-3 py-2.5" : "gap-3 px-6 py-3")} style={{ background: CARD, borderBottom: "1px solid " + INK_SOFT }}>
    <div className="flex-1 min-w-0">
      <div className={"font-semibold truncate " + (isMobile ? "text-sm" : "text-[15px]")} style={{ color: SHU, textShadow: GLOW(SHU, 2), letterSpacing: "0.04em" }}>{active.num} {active.name}{!isMobile && <span className="font-normal text-[12px]" style={{ color: TEXT_DIM, textShadow: "none", fontFamily: MONO }}>　{active.role}</span>}</div>
      <div className="text-[10px] truncate flex items-center gap-1.5 mt-1" style={{ color: brain ? SHU_DIM : ALERT, fontFamily: MONO, letterSpacing: "0.08em" }}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0 hud-pulse" style={{ background: brain ? SHU : ALERT, boxShadow: GLOW(brain ? SHU : ALERT, 4) }}></span>
        SHARED BRAIN {brain ? (isMobile ? "SYNCED" : "SYNCED " + brain.updatedAt) : (isMobile ? "OFFLINE" : "OFFLINE — 第9条のため同期を推奨")}
      </div>
    </div>
    <button
      onClick={onSyncBrain}
      disabled={brainLoading}
      className="px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
      style={{ background: brainLoading ? INK_SOFT : SHU, color: brainLoading ? TEXT_DIM : INK, boxShadow: brainLoading ? "none" : GLOW(SHU, 6), letterSpacing: "0.04em" }}
    >
      {brainLoading ? "同期中…" : (isMobile ? "同期" : "共有脳を同期")}
    </button>
    <button
      onClick={onOpenSettings}
      className="px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-all"
      style={{ background: "transparent", color: SHU_DIM, border: "1px solid " + SHU + "44" }}
    >
      {isMobile ? "契約書" : "契約書・憲章"}
    </button>
    <button
      onClick={onClearChat}
      className="px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-all"
      style={{ background: "transparent", color: TEXT_DIM, border: "1px solid " + INK_SOFT }}
    >
      {isMobile ? "クリア" : "履歴クリア"}
    </button>
  </header>
);

export default ChatHeader;
