import React from "react";
import { SHU } from "../theme";

// アークリアクター状の回転リング
const ArcRing = ({ size = 26, active = true }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ filter: active ? "drop-shadow(0 0 4px " + SHU + ")" : "none" }}>
    <circle cx="20" cy="20" r="18" fill="none" stroke={SHU} strokeWidth="0.8" opacity="0.25" />
    <g className="hud-spin">
      <circle cx="20" cy="20" r="18" fill="none" stroke={SHU} strokeWidth="1.4"
        strokeDasharray="16 8 4 8" strokeLinecap="round" opacity={active ? 0.9 : 0.3} />
    </g>
    <g className="hud-spin-rev">
      <circle cx="20" cy="20" r="12" fill="none" stroke={SHU} strokeWidth="0.8"
        strokeDasharray="3 6" opacity={active ? 0.7 : 0.25} />
    </g>
    <circle cx="20" cy="20" r="5" fill={SHU} opacity={active ? 0.95 : 0.3} className={active ? "hud-pulse" : ""} />
  </svg>
);

export default ArcRing;
