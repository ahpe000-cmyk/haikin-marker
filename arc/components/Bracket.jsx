import React from "react";
import { SHU } from "../theme";

// 角が切れたHUDブラケット枠
const Bracket = ({ children, style = {}, on = true }) => (
  <div style={{ position: "relative", ...style }}>
    {on && [
      { top: -1, left: -1, bt: 1, bl: 1 },
      { top: -1, right: -1, bt: 1, br: 1 },
      { bottom: -1, left: -1, bb: 1, bl: 1 },
      { bottom: -1, right: -1, bb: 1, br: 1 },
    ].map((p, i) => (
      <span key={i} style={{
        position: "absolute", width: 9, height: 9, pointerEvents: "none",
        top: p.top, left: p.left, right: p.right, bottom: p.bottom,
        borderTop: p.bt ? "1.5px solid " + SHU : "none",
        borderBottom: p.bb ? "1.5px solid " + SHU : "none",
        borderLeft: p.bl ? "1.5px solid " + SHU : "none",
        borderRight: p.br ? "1.5px solid " + SHU : "none",
      }} />
    ))}
    {children}
  </div>
);

export default Bracket;
