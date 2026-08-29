import React from "react";
import { INK_SOFT, CARD, SHU, SHU_DIM, TEXT_DARK, TEXT_DIM, GLOW, MONO } from "../theme";
import ArcRing from "./ArcRing";
import Bracket from "./Bracket";

// チャット本文（待機画面・メッセージ・処理中インジケータ）
const MessageList = ({ active, messages, loading, scrollRef, isMobile }) => (
  <div ref={scrollRef} className={"flex-1 overflow-y-auto py-5 " + (isMobile ? "px-3" : "px-6")}>
    {messages.length === 0 && !loading && (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <Bracket style={{ padding: 20 }}>
          <ArcRing size={82} />
        </Bracket>
        <div className="text-[10px] mt-5 mb-2" style={{ color: SHU, fontFamily: MONO, letterSpacing: "0.28em", textShadow: GLOW(SHU, 4) }}>STANDBY</div>
        <div className="text-sm font-medium mb-2" style={{ color: TEXT_DARK }}>{active.num} {active.name}</div>
        <div className="text-[11px] max-w-xs leading-relaxed" style={{ color: TEXT_DIM }}>
          指示を入力すると業務を開始します。憲章第2条により、この社員は忖度しません。
        </div>
        <div className="text-[9px] mt-4" style={{ color: TEXT_DIM, fontFamily: MONO, letterSpacing: "0.14em" }}>
          AWAITING DIRECTIVE <span className="hud-caret" style={{ marginLeft: 4 }} />
        </div>
      </div>
    )}

    {messages.map((m, i) => (
      <div key={i} className={"flex mb-4 " + (m.role === "user" ? "justify-end" : "justify-start")}>
        {m.role === "assistant" && (
          <div className="w-7 h-7 mr-2.5 shrink-0 flex items-center justify-center text-[11px]" style={{ background: "transparent", color: SHU, border: "1px solid " + SHU + "55", fontFamily: MONO, boxShadow: "inset 0 0 10px " + SHU + "22" }}>
            {active.num}
          </div>
        )}
        <div
          className="max-w-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap cut-sm"
          style={m.role === "user"
            ? { background: SHU + "1A", color: TEXT_DARK, borderRight: "2px solid " + SHU, border: "1px solid " + SHU + "44" }
            : { background: CARD, border: "1px solid " + INK_SOFT, borderLeft: "2px solid " + SHU + "88", color: TEXT_DARK }}
        >
          {m.content}
          {m.meta && <div className="mt-2.5 pt-2.5 text-[10px]" style={{ borderTop: "1px solid " + INK_SOFT, color: SHU_DIM, fontFamily: MONO, letterSpacing: "0.06em" }}>▸ {m.meta}</div>}
        </div>
      </div>
    ))}

    {loading && (
      <div className="flex justify-start mb-4">
        <div className="w-7 h-7 mr-2.5 shrink-0 flex items-center justify-center" style={{ border: "1px solid " + SHU + "55" }}><ArcRing size={18} /></div>
        <div className="px-4 py-3 text-xs flex items-center gap-2.5 relative overflow-hidden cut-sm" style={{ background: CARD, border: "1px solid " + SHU + "33", color: SHU_DIM, fontFamily: MONO, letterSpacing: "0.1em" }}>
          <span className="hud-scan"></span>
          <span className="hud-eq"><span /><span /><span /><span /><span /></span>
          PROCESSING… {active.name}
        </div>
      </div>
    )}
  </div>
);

export default MessageList;
