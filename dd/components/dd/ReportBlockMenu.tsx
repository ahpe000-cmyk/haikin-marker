"use client";

import { useState } from "react";
import { EllipsisVertical, Flag, ShieldBan } from "lucide-react";
import { ConfirmDialog } from "@/components/dd/ConfirmDialog";
import { useToast } from "@/components/dd/Toast";

type PendingAction = "report" | "block" | null;

// 通報・ブロックのUIのみ（デモ：サーバー処理なし）
export function ReportBlockMenu({ targetName }: { targetName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const { showToast } = useToast();

  const confirm = () => {
    showToast(
      pending === "report"
        ? "通報を受け付けました（デモ）"
        : "ブロックしました（デモ）",
    );
    setPending(null);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="その他のメニュー"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 hover:bg-neutral-100"
      >
        <EllipsisVertical className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border border-[var(--dd-line)] bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPending("report");
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-neutral-50"
            >
              <Flag className="h-4 w-4" aria-hidden />
              通報する
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPending("block");
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-neutral-50"
            >
              <ShieldBan className="h-4 w-4" aria-hidden />
              ブロックする
            </button>
          </div>
        </>
      )}
      <ConfirmDialog
        open={pending !== null}
        title={pending === "report" ? "通報しますか？" : "ブロックしますか？"}
        description={
          pending === "report"
            ? `「${targetName}」を運営に通報します。デモのため実際の送信は行われません。`
            : `「${targetName}」をブロックします。デモのため実際の処理は行われません。`
        }
        confirmLabel={pending === "report" ? "通報する" : "ブロックする"}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
