"use client";

import { useState } from "react";
import Link from "next/link";
import { saveDiary } from "@/app/diary/actions";

type Props = {
  initialDone: string;
  initialNotDone: string;
  initialTomorrow: string;
  monthAgoDate: string; // 「1ヶ月前の自分」ボタンの行き先
};

export default function DiaryForm({
  initialDone,
  initialNotDone,
  initialTomorrow,
  monthAgoDate,
}: Props) {
  const [done, setDone] = useState(initialDone);
  const [notDone, setNotDone] = useState(initialNotDone);
  const [tomorrow, setTomorrow] = useState(initialTomorrow);
  const [savedMessage, setSavedMessage] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold">きょうの日記</h1>
      <p className="text-sm text-[#8a6d3b]">
        書けるところだけで だいじょうぶです
      </p>

      <label className="font-bold" htmlFor="diary-done">
        できたこと
      </label>
      <textarea
        id="diary-done"
        className="input-big"
        rows={2}
        value={done}
        onChange={(e) => setDone(e.target.value)}
      />

      <label className="font-bold" htmlFor="diary-notdone">
        できなかったこと
      </label>
      <textarea
        id="diary-notdone"
        className="input-big"
        rows={2}
        value={notDone}
        onChange={(e) => setNotDone(e.target.value)}
      />

      <label className="font-bold" htmlFor="diary-tomorrow">
        あした やりたいこと
      </label>
      <textarea
        id="diary-tomorrow"
        className="input-big"
        rows={2}
        value={tomorrow}
        onChange={(e) => setTomorrow(e.target.value)}
      />

      {savedMessage && (
        <p className="text-center font-bold text-[#4c9a3d]">のこしました</p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <button
          className="btn btn-primary"
          onClick={async () => {
            await saveDiary(done, notDone, tomorrow).catch(() => {});
            setSavedMessage(true);
          }}
        >
          のこす
        </button>
        <Link href={`/diary/${monthAgoDate}`} className="btn btn-secondary">
          1ヶ月前の自分
        </Link>
        <Link href="/history" className="btn btn-secondary">
          まえの日記をさがす
        </Link>
        <Link href="/" className="btn btn-quiet">
          もどる
        </Link>
      </div>
    </div>
  );
}
