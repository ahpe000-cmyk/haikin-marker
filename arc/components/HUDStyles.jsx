import React from "react";
import { SHU, INK_SOFT } from "../theme";

// ---------- J.A.R.V.I.S. HUD パーツ ----------
const HUDStyles = () => (
  <style>{`
    @keyframes hudspin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    @keyframes hudspinrev { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
    @keyframes hudpulse { 0%,100% { opacity:.35 } 50% { opacity:1 } }
    @keyframes scan { 0% { transform: translateY(-100%) } 100% { transform: translateY(2400%) } }
    @keyframes flicker { 0%,100% { opacity:1 } 92% { opacity:1 } 94% { opacity:.6 } 96% { opacity:1 } }
    .hud-spin { animation: hudspin 14s linear infinite; transform-origin: 50% 50% }
    .hud-spin-rev { animation: hudspinrev 22s linear infinite; transform-origin: 50% 50% }
    .hud-pulse { animation: hudpulse 2.4s ease-in-out infinite }
    .hud-flicker { animation: flicker 7s linear infinite }
    .hud-scan { position:absolute; left:0; right:0; height:2px; pointer-events:none;
      background: linear-gradient(90deg, transparent, ${SHU}22, transparent); animation: scan 9s linear infinite }
    .hud-grid { background-image:
      linear-gradient(${SHU}0A 1px, transparent 1px),
      linear-gradient(90deg, ${SHU}0A 1px, transparent 1px);
      background-size: 44px 44px }
    ::-webkit-scrollbar { width: 6px; height: 6px }
    ::-webkit-scrollbar-thumb { background: ${INK_SOFT}; border-radius: 3px }
    ::-webkit-scrollbar-track { background: transparent }
  `}</style>
);

export default HUDStyles;
