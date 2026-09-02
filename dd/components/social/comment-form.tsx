"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useAppState } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { DEMO_USER_ID } from "@/data/mock";
import { generateId } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function CommentForm({ postId }: { postId: string }) {
  const { dispatch } = useAppState();
  const toast = useToast();
  const [text, setText] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch({
      type: "ADD_COMMENT",
      comment: {
        id: generateId("cm"),
        postId,
        authorId: DEMO_USER_ID,
        text: trimmed,
        createdAt: new Date().toISOString(),
      },
    });
    setText("");
    toast("コメントを投稿しました");
  };

  return (
    <form
      onSubmit={submit}
      className="sticky bottom-14 flex items-center gap-2 border-t border-line bg-white px-4 py-3"
    >
      <label htmlFor={`comment-${postId}`} className="sr-only">
        コメントを書く
      </label>
      <Input
        id={`comment-${postId}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="コメントを書く…"
        maxLength={300}
      />
      <button
        type="submit"
        aria-label="コメントを送信"
        disabled={!text.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white disabled:opacity-40"
      >
        <Send className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
