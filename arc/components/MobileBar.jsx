import React from "react";
import { INK, INK_SOFT, SHU, TEXT_DIM, TEXT_ON_INK, GLOW, MONO } from "../theme";
import { EMPLOYEES } from "../data";
import ArcRing from "./ArcRing";

// モバイル用：上部の社員チップバー
const MobileBar = ({ activeId, onSelect, clock }) => (
  <div className="shrink-0" style={{ background: INK }}>
    <div className="flex items-baseline justify-between px-4 pt-3 pb-1">
      <span className="flex items-center gap-2.5">
        <ArcRing size={20} />
        <span className="text-sm font-semibold" style={{ color: TEXT_ON_INK, letterSpacing: "0.26em", textShadow: GLOW(SHU, 3) }}>ARC</span>
      </span>
      <span className="text-[10px]" style={{ color: TEXT_DIM, fontFamily: MONO }}>{clock.toLocaleTimeString("ja-JP", { hour12: false })}</span>
    </div>
    <div className="flex gap-2 overflow-x-auto px-3 pb-3 pt-1" style={{ WebkitOverflowScrolling: "touch" }}>
      {EMPLOYEES.map((emp) => {
        const isActive = emp.id === activeId;
        return (
          <button
            key={emp.id}
            onClick={() => onSelect(emp.id)}
            className="shrink-0 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: isActive ? SHU : "transparent",
              color: isActive ? INK : TEXT_DIM,
              border: "1px solid " + (isActive ? SHU : INK_SOFT),
              boxShadow: isActive ? GLOW(SHU, 6) : "none",
            }}
          >
            {emp.num} {emp.name}
          </button>
        );
      })}
    </div>
  </div>
);

export default MobileBar;
