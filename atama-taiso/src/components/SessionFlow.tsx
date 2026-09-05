"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MemoryQuiz, QuizQuestion } from "@/types/db";
import { formatJa } from "@/lib/date";
import {
  completeSession,
  finishQuiz,
  recordQuizAnswer,
  saveDinnerMemory,
  saveEffortNote,
  saveMemoryQuizResult,
} from "@/app/session/actions";

type Step =
  | "quiz"
  | "quizResult"
  | "memory"
  | "dinner1"
  | "dinner2"
  | "effort"
  | "done";

type Props = {
  sessionId: string;
  questions: QuizQuestion[];
  memoryQuiz: MemoryQuiz | null;
  today: string;
  yesterday: string;
  dayBefore: string;
};

/** 毎朝のルーティン（CLAUDE.md §3 の [2]〜[7] を1画面ずつ） */
export default function SessionFlow({
  sessionId,
  questions,
  memoryQuiz,
  yesterday,
  dayBefore,
}: Props) {
  const [step, setStep] = useState<Step>(
    questions.length > 0 ? "quiz" : memoryQuiz ? "memory" : "dinner1"
  );
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [memPicked, setMemPicked] = useState<number | null>(null);
  const [memCorrect, setMemCorrect] = useState<boolean | null>(null);
  const [dinner1, setDinner1] = useState("");
  const [dinner2, setDinner2] = useState("");
  const [savedDinner1, setSavedDinner1] = useState<string | null>(null);
  const [savedDinner2, setSavedDinner2] = useState<string | null>(null);
  const [effort, setEffort] = useState("");
  const [savedEffort, setSavedEffort] = useState<string | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const afterQuiz = () => setStep(memoryQuiz ? "memory" : "dinner1");

  // おわり画面に入ったら完了を記録（二重実行してもサーバー側で壊れない）
  const completedRef = useRef(false);
  useEffect(() => {
    if (step === "done" && !completedRef.current) {
      completedRef.current = true;
      completeSession(sessionId).catch(() => {});
    }
  }, [step, sessionId]);

  /* ---------- [2] クイズ 5問 ---------- */
  if (step === "quiz") {
    const q = questions[qIndex];
    const answered = picked != null;
    const isCorrect = answered && picked === q.answer_index;
    return (
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-[#8a6d3b]">
          クイズ {qIndex + 1}問め（ぜんぶで{questions.length}問）
        </p>
        <p className="text-xl font-bold leading-relaxed">{q.question}</p>
        <div className="flex flex-col gap-3">
          {q.choices.map((c, i) => {
            let cls = "btn btn-choice";
            if (answered && i === q.answer_index) cls += " btn-choice-correct";
            else if (answered && i === picked) cls += " btn-choice-wrong";
            return (
              <button
                key={i}
                className={cls}
                disabled={answered}
                onClick={() => {
                  setPicked(i);
                  const ok = i === q.answer_index;
                  if (ok) setCorrectCount((n) => n + 1);
                  recordQuizAnswer(sessionId, q.id, ok).catch(() => {});
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="card">
            <p className="font-bold">
              {isCorrect ? "正解です！" : `こたえは「${q.choices[q.answer_index]}」でした`}
            </p>
            {q.explanation && <p className="mt-2">{q.explanation}</p>}
          </div>
        )}
        <div className="mt-auto flex flex-col gap-3">
          {answered && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setPicked(null);
                if (qIndex + 1 < questions.length) {
                  setQIndex(qIndex + 1);
                } else {
                  setQuizDone(true);
                  finishQuiz(sessionId, correctCount).catch(() => {});
                  setStep("quizResult");
                }
              }}
            >
              つぎへ
            </button>
          )}
          <button className="btn btn-quiet" onClick={afterQuiz}>
            あとで
          </button>
        </div>
      </div>
    );
  }

  /* ---------- クイズ結果 ---------- */
  if (step === "quizResult") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <p className="text-3xl font-bold">
          {questions.length}問中 {correctCount}問 正解！
        </p>
        <p>よく できました。</p>
        <button className="btn btn-primary" onClick={afterQuiz}>
          つぎへ
        </button>
      </div>
    );
  }

  /* ---------- [3] 記憶クイズ（データが足りる日だけ） ---------- */
  if (step === "memory" && memoryQuiz) {
    const answered = memPicked != null;
    return (
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-[#8a6d3b]">おもいだしクイズ</p>
        <p className="text-xl font-bold leading-relaxed">
          {memoryQuiz.question}
        </p>
        <div className="flex flex-col gap-3">
          {memoryQuiz.choices.map((c, i) => {
            let cls = "btn btn-choice";
            if (answered && i === memoryQuiz.answerIndex)
              cls += " btn-choice-correct";
            else if (answered && i === memPicked) cls += " btn-choice-wrong";
            return (
              <button
                key={i}
                className={cls}
                disabled={answered}
                onClick={() => {
                  setMemPicked(i);
                  const ok = i === memoryQuiz.answerIndex;
                  setMemCorrect(ok);
                  saveMemoryQuizResult(sessionId, ok).catch(() => {});
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="card">
            <p className="font-bold">
              {memCorrect
                ? "正解です！よく おぼえていましたね"
                : `こたえは「${memoryQuiz.choices[memoryQuiz.answerIndex]}」でした`}
            </p>
          </div>
        )}
        <div className="mt-auto flex flex-col gap-3">
          {answered && (
            <button className="btn btn-primary" onClick={() => setStep("dinner1")}>
              つぎへ
            </button>
          )}
          <button className="btn btn-quiet" onClick={() => setStep("dinner1")}>
            あとで
          </button>
        </div>
      </div>
    );
  }

  /* ---------- [4][5] きのう・おとといの夕飯 ---------- */
  if (step === "dinner1" || step === "dinner2") {
    const isFirst = step === "dinner1";
    const date = isFirst ? yesterday : dayBefore;
    const value = isFirst ? dinner1 : dinner2;
    const setValue = isFirst ? setDinner1 : setDinner2;
    const next = () => setStep(isFirst ? "dinner2" : "effort");
    const save = () => {
      const v = value.trim();
      if (v) {
        saveDinnerMemory(date, v).catch(() => {});
        if (isFirst) setSavedDinner1(v);
        else setSavedDinner2(v);
      }
      next();
    };
    return (
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-[#8a6d3b]">おもいだしてみましょう</p>
        <p className="text-xl font-bold leading-relaxed">
          {isFirst ? "きのう" : "おととい"}（{formatJa(date)}）の
          夕ごはんは 何でしたか?
        </p>
        <textarea
          className="input-big"
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="れい：カレーライス"
        />
        <p className="text-sm text-[#8a6d3b]">
          キーボードのマイクのボタンで、声でも入力できます
        </p>
        <div className="mt-auto flex flex-col gap-3">
          <button className="btn btn-primary" onClick={save}>
            おくる
          </button>
          <button className="btn btn-secondary" onClick={next}>
            おぼえていない
          </button>
          <button className="btn btn-quiet" onClick={next}>
            あとで
          </button>
        </div>
      </div>
    );
  }

  /* ---------- [6] きょう頑張ること ---------- */
  if (step === "effort") {
    const save = () => {
      const v = effort.trim();
      if (v) {
        saveEffortNote(sessionId, v).catch(() => {});
        setSavedEffort(v);
      }
      setStep("done");
    };
    return (
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-[#8a6d3b]">さいごの ひとつです</p>
        <p className="text-xl font-bold leading-relaxed">
          きょう 頑張ることを ひとこと どうぞ
        </p>
        <textarea
          className="input-big"
          rows={3}
          value={effort}
          onChange={(e) => setEffort(e.target.value)}
          placeholder="れい：さんぽに いく"
        />
        <div className="mt-auto flex flex-col gap-3">
          <button className="btn btn-primary" onClick={save}>
            おくる
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("done")}>
            あとで
          </button>
        </div>
      </div>
    );
  }

  /* ---------- [7] おわり画面 ---------- */
  return (
    <div className="flex flex-1 flex-col gap-5">
      <h1 className="text-2xl font-bold">おつかれさまでした</h1>
      <p>きょうの 頭の体操は これで おわりです。</p>
      <div className="card flex flex-col gap-3">
        <p className="font-bold">きょうの記録</p>
        <p>
          クイズ：
          {quizDone
            ? `${questions.length}問中 ${correctCount}問 正解`
            : "きょうは やっていません"}
        </p>
        {memCorrect != null && (
          <p>おもいだしクイズ：{memCorrect ? "正解" : "ざんねん"}</p>
        )}
        {savedDinner1 && <p>きのうの夕ごはん：{savedDinner1}</p>}
        {savedDinner2 && <p>おとといの夕ごはん：{savedDinner2}</p>}
        {savedEffort && <p>きょう頑張ること：{savedEffort}</p>}
      </div>
      <Link href="/" className="btn btn-primary">
        おわる
      </Link>
    </div>
  );
}
