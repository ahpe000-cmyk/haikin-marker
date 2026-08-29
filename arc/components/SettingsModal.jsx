import React from "react";
import { INK, INK_SOFT, PAPER, CARD, SHU, TEXT_DARK, TEXT_DIM, GLOW } from "../theme";
import Bracket from "./Bracket";

// 設定モーダル：憲章と契約書
const SettingsModal = ({ active, activeId, charter, setCharter, prompts, setPrompts, onClose, onSave, isMobile }) => (
  <div className={"fixed inset-0 z-50 flex items-center justify-center " + (isMobile ? "p-2" : "p-6")} style={{ background: "rgba(3,6,12,0.78)", backdropFilter: "blur(4px)" }}>
    <Bracket style={{ width: "100%", maxWidth: "48rem", maxHeight: "100%" }}><div className="w-full max-h-full overflow-y-auto cut" style={{ background: CARD, border: "1px solid " + SHU + "33", boxShadow: "0 0 40px " + SHU + "1A" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid " + INK_SOFT }}>
        <div className="font-bold">共通憲章 と {active.num}{active.name} の雇用契約書</div>
        <button onClick={onClose} className="text-sm px-2" style={{ color: TEXT_DIM }}>閉じる</button>
      </div>
      <div className="px-6 py-4">
        <div className="text-xs font-semibold mb-1" style={{ color: TEXT_DIM }}>共通憲章（全社員に適用・第1〜9条）</div>
        <textarea
          value={charter}
          onChange={(e) => setCharter(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 text-xs leading-relaxed outline-none resize-y cut-sm"
          style={{ background: PAPER, border: "1px solid " + INK_SOFT, color: TEXT_DARK, fontFamily: "inherit" }}
        />
        <div className="text-xs font-semibold mb-1 mt-4" style={{ color: TEXT_DIM }}>{active.num}{active.name} の個別契約書（システムプロンプト）</div>
        <textarea
          value={prompts[activeId] || ""}
          onChange={(e) => setPrompts((prev) => ({ ...prev, [activeId]: e.target.value }))}
          rows={7}
          className="w-full px-4 py-3 text-xs leading-relaxed outline-none resize-y cut-sm"
          style={{ background: PAPER, border: "1px solid " + INK_SOFT, color: TEXT_DARK, fontFamily: "inherit" }}
        />
        <div className="text-xs mt-2" style={{ color: TEXT_DIM }}>
          ※ 実際の雇用契約書（Notion等にある正式版）をここに貼り付けると、その社員として正確に稼働します。保存内容はこのアプリ内に永続化されます。
        </div>
      </div>
      <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: "1px solid " + INK_SOFT }}>
        <button onClick={onClose} className="px-4 py-2 text-sm cut-sm" style={{ background: "transparent", color: TEXT_DIM, border: "1px solid " + INK_SOFT }}>キャンセル</button>
        <button onClick={onSave} className="px-5 py-2 text-sm font-semibold cut-sm" style={{ background: SHU, color: INK, filter: "drop-shadow(0 0 6px " + SHU + "88)", letterSpacing: "0.06em" }}>保存</button>
      </div>
    </div></Bracket>
  </div>
);

export default SettingsModal;
