import React from "react";
import { INK, SHU, TEXT_DIM, GLOW, MONO } from "../theme";
import HUDStyles from "./HUDStyles";
import ArcRing from "./ArcRing";

// 起動時ロード画面
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: INK }}>
    <HUDStyles />
    <ArcRing size={64} />
    <div style={{ color: SHU, letterSpacing: "0.42em", fontFamily: MONO, textShadow: GLOW(SHU, 6) }} className="text-sm hud-flicker">A R C</div>
    <div style={{ color: TEXT_DIM, letterSpacing: "0.18em", fontFamily: MONO }} className="text-[10px]">AHPE AI SYSTEM — INITIALIZING…</div>
  </div>
);

export default LoadingScreen;
