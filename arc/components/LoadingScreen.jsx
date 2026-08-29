import React from "react";
import { INK, INK_SOFT, SHU, TEXT_DIM, GLOW, MONO } from "../theme";
import HUDStyles from "./HUDStyles";
import ArcRing from "./ArcRing";

const BOOT_LINES = [
  "CORE MEMORY ............... OK",
  "EMPLOYEE REGISTRY [10] .... OK",
  "SHARED BRAIN LINK ......... STANDBY",
  "HUD RENDER ................ OK",
];

// 起動時ロード画面（ブートシーケンス）
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: INK }}>
    <HUDStyles />
    <ArcRing size={64} />
    <div style={{ color: SHU, letterSpacing: "0.42em", fontFamily: MONO, textShadow: GLOW(SHU, 6) }} className="text-sm hud-flicker">A R C</div>
    <div style={{ color: TEXT_DIM, letterSpacing: "0.18em", fontFamily: MONO }} className="text-[10px]">AHPE AI SYSTEM — INITIALIZING…</div>
    <div className="flex flex-col gap-1 mt-1" style={{ minHeight: 60 }}>
      {BOOT_LINES.map((l, i) => (
        <div key={i} className="boot-line text-[10px]" style={{ color: TEXT_DIM, fontFamily: MONO, letterSpacing: "0.08em", animationDelay: (0.18 * i) + "s" }}>{l}</div>
      ))}
    </div>
    <div style={{ width: 220, height: 2, background: INK_SOFT }}>
      <div className="boot-bar" style={{ background: SHU, boxShadow: GLOW(SHU, 4) }} />
    </div>
  </div>
);

export default LoadingScreen;
