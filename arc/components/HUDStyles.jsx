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
    @keyframes sweepline { 0% { left:-34% } 100% { left:100% } }
    @keyframes eqbar { 0%,100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
    @keyframes caretblink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }
    @keyframes bootbar { from { width:0 } to { width:100% } }
    @keyframes bootline { from { opacity:0; transform: translateY(4px) } to { opacity:1; transform: none } }
    .hud-spin { animation: hudspin 14s linear infinite; transform-origin: 50% 50% }
    .hud-spin-rev { animation: hudspinrev 22s linear infinite; transform-origin: 50% 50% }
    .hud-pulse { animation: hudpulse 2.4s ease-in-out infinite }
    .hud-flicker { animation: flicker 7s linear infinite }
    .hud-scan { position:absolute; left:0; right:0; height:2px; pointer-events:none;
      background: linear-gradient(90deg, transparent, ${SHU}22, transparent); animation: scan 9s linear infinite }
    .hud-grid { background-image:
      radial-gradient(1100px 700px at 62% 38%, rgba(79,216,255,0.07), transparent 62%),
      radial-gradient(700px 500px at 18% 85%, rgba(79,216,255,0.05), transparent 60%),
      linear-gradient(${SHU}10 1px, transparent 1px),
      linear-gradient(90deg, ${SHU}10 1px, transparent 1px),
      linear-gradient(${SHU}07 1px, transparent 1px),
      linear-gradient(90deg, ${SHU}07 1px, transparent 1px);
      background-size: auto, auto, 176px 176px, 176px 176px, 44px 44px, 44px 44px }
    /* CRTスキャンライン＋ビネットの全画面オーバーレイ */
    .hud-crt { position:fixed; inset:0; pointer-events:none; z-index:40;
      background:
        radial-gradient(120% 120% at 50% 45%, transparent 62%, rgba(2,4,9,.55) 100%),
        repeating-linear-gradient(0deg, rgba(0,0,0,.13) 0 1px, transparent 1px 3px) }
    /* チャンファー（角切り）— 左上と右下を落とすSF定番シェイプ */
    .cut { clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px) }
    .cut-sm { clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px) }
    /* ヘッダー下端などを走る光のライン */
    .hud-sweepline { position:absolute; left:-34%; bottom:0; height:1px; width:34%; pointer-events:none;
      background: linear-gradient(90deg, transparent, ${SHU}AA, transparent); animation: sweepline 5s linear infinite }
    /* 処理中のEQバー */
    .hud-eq { display:flex; align-items:flex-end; gap:2px; height:12px }
    .hud-eq span { width:3px; height:100%; background:${SHU}; transform-origin:bottom;
      box-shadow:0 0 6px ${SHU}; animation: eqbar 1.1s ease-in-out infinite }
    .hud-eq span:nth-child(2) { animation-delay:.15s }
    .hud-eq span:nth-child(3) { animation-delay:.3s }
    .hud-eq span:nth-child(4) { animation-delay:.45s }
    .hud-eq span:nth-child(5) { animation-delay:.6s }
    /* 点滅カーソル */
    .hud-caret { display:inline-block; width:7px; height:11px; background:${SHU};
      box-shadow:0 0 6px ${SHU}; animation: caretblink 1.1s steps(1) infinite; vertical-align:-1px }
    /* ブートシーケンス */
    .boot-line { opacity:0; animation: bootline .4s ease forwards }
    .boot-bar { height:100%; animation: bootbar 1.6s ease-out forwards }
    ::-webkit-scrollbar { width: 6px; height: 6px }
    ::-webkit-scrollbar-thumb { background: ${INK_SOFT}; border-radius: 3px }
    ::-webkit-scrollbar-track { background: transparent }
  `}</style>
);

export default HUDStyles;
