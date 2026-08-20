"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Category,
  ChoiceId,
  Question,
  QuizSession,
  SessionKind,
  Step,
} from "@/lib/domain/types";
import {
  applyCompletedSession,
  completeSession,
  createSession,
  scoreAnswer,
} from "@/lib/quiz/session";
import { updateProgress } from "@/lib/storage/progress-store";
import { useIsClient } from "@/lib/storage/use-progress";
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from "@/lib/storage/active-session";
import { getJstDateKey } from "@/lib/time/jst";
import { track } from "@/lib/analytics/track";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ChoiceButton, type ChoiceVisualState } from "./ChoiceButton";
import { AnswerFeedback } from "./AnswerFeedback";

export function QuizRunner({
  questions,
  kind,
  category,
  step,
}: {
  questions: Question[];
  kind: SessionKind;
  category?: Category;
  step?: Step;
}) {
  const router = useRouter();
  const isClient = useIsClient();

  // Resume an in-flight session for the same quiz on the same JST day,
  // otherwise start fresh. Computed once per mount on the client.
  const initialSession = useMemo<QuizSession | null>(() => {
    if (!isClient) return null;
    const dateKey = getJstDateKey();
    const stored = loadActiveSession();
    const questionIds = questions.map((q) => q.id);
    const resumable =
      stored &&
      !stored.completedAt &&
      stored.kind === kind &&
      stored.category === category &&
      stored.step === step &&
      stored.dateKey === dateKey &&
      stored.questionIds.length === questionIds.length &&
      stored.questionIds.every((id) => questionIds.includes(id)) &&
      stored.answers.length < stored.questionIds.length;
    if (resumable && stored) return stored;
    return createSession({ kind, questions, dateKey, category, step });
    // The question set is fixed for the lifetime of this runner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  const [sessionOverride, setSessionOverride] = useState<QuizSession | null>(
    null,
  );
  const session = sessionOverride ?? initialSession;

  const [cursor, setCursor] = useState<{
    index: number;
    selected: ChoiceId | null;
  } | null>(null);
  const index = cursor?.index ?? initialSession?.answers.length ?? 0;
  const selected = cursor?.selected ?? null;

  const startTracked = useRef(false);
  useEffect(() => {
    if (!initialSession || startTracked.current) return;
    startTracked.current = true;
    saveActiveSession(initialSession);
    if (kind === "daily") track("daily_quiz_start", { category });
    else if (kind === "review") track("review_start", {});
    else track("quiz_start", { category, step });
  }, [initialSession, kind, category, step]);

  const orderedQuestions = useMemo(() => {
    if (!session) return questions;
    return session.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => q !== undefined);
  }, [session, questions]);

  const question = orderedQuestions[index];
  const locked = selected !== null;

  const handleSelect = useCallback(
    (choiceId: ChoiceId) => {
      if (!session || !question || selected !== null) return;
      const answer = scoreAnswer(question, choiceId);
      const updated = { ...session, answers: [...session.answers, answer] };
      setSessionOverride(updated);
      setCursor({ index, selected: choiceId });
      saveActiveSession(updated);
      track("question_answered", {
        category: question.category,
        questionId: question.id,
        sessionId: session.id,
        step,
      });
    },
    [session, question, selected, index, step],
  );

  const handleNext = useCallback(() => {
    if (!session) return;
    if (index + 1 < orderedQuestions.length) {
      setCursor({ index: index + 1, selected: null });
      return;
    }
    const completed = completeSession(session);
    updateProgress((progress) => applyCompletedSession(progress, completed));
    clearActiveSession();
    track("quiz_complete", { category, sessionId: completed.id, step });
    if (kind === "review") track("review_complete", { sessionId: completed.id });
    router.push(`/result/${completed.id}`);
  }, [session, index, orderedQuestions.length, category, step, kind, router]);

  if (!session || !question) {
    return (
      <p className="py-8 text-center text-muted" role="status">
        読み込み中…
      </p>
    );
  }

  const answerId =
    question.mode === "single_correct"
      ? question.correctChoiceId
      : question.recommendedChoiceId;
  const isCorrect = selected !== null && selected === answerId;
  const isLast = index + 1 >= orderedQuestions.length;

  const choiceState = (choiceId: ChoiceId): ChoiceVisualState => {
    if (!locked) return "default";
    if (choiceId === selected) {
      return isCorrect ? "selected-correct" : "selected-wrong";
    }
    if (choiceId === answerId) return "revealed-answer";
    return "dimmed";
  };

  const choiceStatusLabel = (choiceId: ChoiceId): string | undefined => {
    if (!locked) return undefined;
    const answerLabel =
      question.mode === "single_correct" ? "正解" : "おすすめ";
    if (choiceId === selected) {
      return isCorrect ? answerLabel : "あなたの選択";
    }
    if (choiceId === answerId) return answerLabel;
    return undefined;
  };

  return (
    <div>
      <div className="mb-4">
        <p className="mb-2 text-sm font-semibold text-muted">
          {index + 1} / {orderedQuestions.length}
        </p>
        <ProgressBar
          value={index + (locked ? 1 : 0)}
          max={orderedQuestions.length}
          label={`進行状況 ${index + 1} / ${orderedQuestions.length}`}
        />
      </div>

      <h1 className="text-lg font-bold leading-relaxed">{question.prompt}</h1>

      <div className="mt-4 space-y-3" role="group" aria-label="選択肢">
        {question.choices.map((choice) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            state={choiceState(choice.id)}
            locked={locked}
            statusLabel={choiceStatusLabel(choice.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {locked && selected ? (
        <>
          <AnswerFeedback
            question={question}
            selectedChoiceId={selected}
            isCorrect={isCorrect}
          />
          <div className="mt-4">
            <Button onClick={handleNext} className="w-full">
              {isLast ? "結果を見る" : "次の問題"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
