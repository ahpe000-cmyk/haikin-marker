import React from "react";
import { SHU } from "../theme";

// アークリアクター状の回転リング（目盛リング＋周回衛星ドット付き）
const ArcRing = ({ size = 26, active = true }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ filter: active ? "drop-shadow(0 0 4px " + SHU + ")" : "none" }}>
    <circle cx="20" cy="20" r="18" fill="none" stroke={SHU} strokeWidth="0.8" opacity="0.25" />
    {/* 外周の目盛（30°刻み） */}
    <g opacity={active ? 0.55 : 0.2}>
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1="20" y1="1.6" x2="20" y2="4.2" stroke={SHU} strokeWidth="0.7" transform={"rotate(" + (i * 30) + " 20 20)"} />
      ))}
    </g>
    <g className="hud-spin">
      <circle cx="20" cy="20" r="18" fill="none" stroke={SHU} strokeWidth="1.4"
        strokeDasharray="16 8 4 8" strokeLinecap="round" opacity={active ? 0.9 : 0.3} />
      <circle cx="20" cy="2" r="1.3" fill={SHU} opacity={active ? 0.9 : 0.3} />
    </g>
    <g className="hud-spin-rev">
      <circle cx="20" cy="20" r="12" fill="none" stroke={SHU} strokeWidth="0.8"
        strokeDasharray="3 6" opacity={active ? 0.7 : 0.25} />
    </g>
    {/* 十字クロスヘア */}
    <g opacity={active ? 0.4 : 0.15}>
      <line x1="20" y1="12" x2="20" y2="15" stroke={SHU} strokeWidth="0.6" />
      <line x1="20" y1="25" x2="20" y2="28" stroke={SHU} strokeWidth="0.6" />
      <line x1="12" y1="20" x2="15" y2="20" stroke={SHU} strokeWidth="0.6" />
      <line x1="25" y1="20" x2="28" y2="20" stroke={SHU} strokeWidth="0.6" />
    </g>
    <circle cx="20" cy="20" r="5" fill={SHU} opacity={active ? 0.95 : 0.3} className={active ? "hud-pulse" : ""} />
  </svg>
);

export default ArcRing;
