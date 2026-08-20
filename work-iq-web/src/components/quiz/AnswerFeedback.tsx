"use client";

import type { ChoiceId, Question } from "@/lib/domain/types";

export function AnswerFeedback({
  question,
  selectedChoiceId,
  isCorrect,
}: {
  question: Question;
  selectedChoiceId: ChoiceId;
  isCorrect: boolean;
}) {
  const answerId =
    question.mode === "single_correct"
      ? question.correctChoiceId
      : question.recommendedChoiceId;
  const answerLabel =
    question.mode === "single_correct" ? "正解" : "おすすめの判断";

  return (
    <div
      aria-live="polite"
      className="mt-4 rounded-2xl border border-line bg-surface p-4"
    >
      <p
        className={`text-base font-bold ${
          isCorrect ? "text-success" : "text-danger"
        }`}
      >
        {isCorrect
          ? question.mode === "single_correct"
            ? "正解！"
            : "おすすめの判断と一致！"
          : question.mode === "single_correct"
            ? "不正解"
            : "別の判断がおすすめ"}
      </p>
      <p className="mt-1 text-sm text-muted">
        {answerLabel}: {answerId?.toUpperCase()} ／ あなたの選択:{" "}
        {selectedChoiceId.toUpperCase()}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed">{question.explanation}</p>

      {!isCorrect && (
        <div className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
          <p>
            <span className="font-semibold">あなたの選択（{selectedChoiceId.toUpperCase()}）:</span>{" "}
            {question.choiceExplanations[selectedChoiceId]}
          </p>
          {answerId ? (
            <p>
              <span className="font-semibold">{answerLabel}（{answerId.toUpperCase()}）:</span>{" "}
              {question.choiceExplanations[answerId]}
            </p>
          ) : null}
        </div>
      )}

      {question.term ? (
        <div className="mt-3 rounded-xl bg-accent-soft p-3 text-sm">
          <p className="font-bold text-accent-strong">{question.term.label}</p>
          {question.term.expansion ? (
            <p className="mt-0.5 text-muted">{question.term.expansion}</p>
          ) : null}
          <p className="mt-1">{question.term.plainDefinition}</p>
          {question.term.goodUsage ? (
            <p className="mt-1">
              <span className="font-semibold">使い方:</span>{" "}
              {question.term.goodUsage}
            </p>
          ) : null}
          {question.term.badUsage ? (
            <p className="mt-1">
              <span className="font-semibold">避けたい使い方:</span>{" "}
              {question.term.badUsage}
            </p>
          ) : null}
        </div>
      ) : null}

      {question.source ? (
        <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
          出典:{" "}
          <a
            href={question.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            {question.source.title}
          </a>{" "}
          （{question.source.publishedAt}公開・{question.source.checkedAt.slice(0, 10)}確認）
        </p>
      ) : null}
    </div>
  );
}
