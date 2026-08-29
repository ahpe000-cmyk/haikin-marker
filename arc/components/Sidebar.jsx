import React from "react";
import { INK, INK_SOFT, SHU, SHU_DIM, KARASHI, ALERT, TEXT_DARK, TEXT_DIM, TEXT_ON_INK, GLOW, MONO } from "../theme";
import { EMPLOYEES } from "../data";
import ArcRing from "./ArcRing";

// 左：出退勤札ボード（社員名簿）※PC時のみ
const Sidebar = ({ activeId, onSelect, chats, clock, brain }) => (
  <aside className="flex flex-col w-64 shrink-0" style={{ background: INK }}>
    <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid " + INK_SOFT }}>
      <div className="flex items-center gap-3">
        <ArcRing size={30} />
        <div>
          <div className="text-lg font-semibold leading-none" style={{ color: TEXT_ON_INK, letterSpacing: "0.3em", textShadow: GLOW(SHU, 4) }}>ARC</div>
          <div className="text-[9px] mt-1.5" style={{ color: SHU_DIM, fontFamily: MONO, letterSpacing: "0.14em" }}>AHPE AI SYSTEM</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px]" style={{ fontFamily: MONO, color: TEXT_DIM }}>
        <span>{clock.toLocaleTimeString("ja-JP", { hour12: false })}</span>
        <span style={{ color: brain ? SHU : ALERT }}>{brain ? "LINK ●" : "LINK ○"}</span>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto py-3">
      {EMPLOYEES.map((emp) => {
        const isActive = emp.id === activeId;
        const count = (chats[emp.id] || []).length;
        return (
          <button
            key={emp.id}
            onClick={() => onSelect(emp.id)}
            className="w-full text-left px-3 py-2.5 mb-1 mx-2 flex items-center gap-3 transition-all"
            style={{
              width: "calc(100% - 16px)",
              background: isActive ? "linear-gradient(90deg," + SHU + "18, transparent)" : "transparent",
              color: isActive ? TEXT_DARK : TEXT_DIM,
              borderLeft: isActive ? "2px solid " + SHU : "2px solid transparent",
              boxShadow: isActive ? "inset 0 0 22px " + SHU + "12" : "none",
            }}
          >
            <span
              className="text-[11px] w-6 h-6 shrink-0 flex items-center justify-center"
              style={{
                fontFamily: MONO,
                background: isActive ? SHU : "transparent",
                color: isActive ? INK : TEXT_DIM,
                border: "1px solid " + (isActive ? SHU : INK_SOFT),
                boxShadow: isActive ? GLOW(SHU, 5) : "none",
              }}
            >{emp.num}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-medium truncate" style={{ color: isActive ? SHU : "#8FA8C0", textShadow: isActive ? GLOW(SHU, 2) : "none" }}>{emp.name}</span>
              <span className="block text-[10px] truncate" style={{ color: TEXT_DIM, fontFamily: MONO }}>{emp.role}</span>
            </span>
            {count > 0 && (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: KARASHI, boxShadow: GLOW(KARASHI, 4) }} title="対話履歴あり"></span>
            )}
          </button>
        );
      })}
    </nav>

    <div className="px-5 py-3 text-[10px]" style={{ borderTop: "1px solid " + INK_SOFT, color: TEXT_DIM, fontFamily: MONO, letterSpacing: "0.08em" }}>
      OPERATOR: 花園まい ／ CREW 3 + AI 10
    </div>
  </aside>
);

export default Sidebar;
