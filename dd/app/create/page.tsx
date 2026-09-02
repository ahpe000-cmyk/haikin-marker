"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import type { DateExperience, Post, Reproduction } from "@/types";
import { useAppState } from "@/lib/store";
import { getAllDates, getDate, getPost } from "@/lib/selectors";
import { DEMO_USER_ID } from "@/data/mock";
import { generateId, photo } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/states";
import {
  AskDateStep,
  AskReproduceStep,
  CaptionStep,
  DateDataStep,
  MediaStep,
  PreviewStep,
  ReproductionDetailStep,
  type ChangedStopDraft,
  type DraftDate,
} from "@/components/create/steps";

type StepId =
  | "media"
  | "caption"
  | "askDate"
  | "dateData"
  | "askRepro"
  | "reproDetail"
  | "preview";

/** SCREEN 09: Create Post — media-first, date info optional. */
function CreatePostFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, ready, dispatch } = useAppState();
  const toast = useToast();

  const reproduceParam = searchParams.get("reproduce");

  const [media, setMedia] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [withDate, setWithDate] = useState<boolean | null>(null);
  const [draftDate, setDraftDate] = useState<DraftDate>({
    title: "",
    area: "銀座",
    scene: "casual",
    budgetMin: 3000,
    budgetMax: 5000,
    durationMinutes: 180,
    stops: [],
    tips: "",
  });
  const [originalDateId, setOriginalDateId] = useState<string | null>(
    reproduceParam
  );
  const [changedStops, setChangedStops] = useState<ChangedStopDraft[] | null>(null);
  const [rating, setRating] = useState(5);
  const [stepIndex, setStepIndex] = useState(0);

  const originalDate = originalDateId ? getDate(state, originalDateId) : undefined;

  // Initialize changed-stops drafts from the original date's timeline
  const effectiveChangedStops: ChangedStopDraft[] = useMemo(() => {
    if (changedStops) return changedStops;
    if (!originalDate) return [];
    return originalDate.timeline.map((s) => ({
      stopId: s.id,
      label: `${s.category}：${s.placeName}`,
      changed: false,
      note: "",
    }));
  }, [changedStops, originalDate]);

  const isReproduction = originalDateId !== null;

  const steps: StepId[] = useMemo(() => {
    if (isReproduction) return ["media", "caption", "reproDetail", "preview"];
    const base: StepId[] = ["media", "caption", "askDate"];
    if (withDate === true) base.push("dateData");
    if (withDate !== null) base.push("askRepro");
    base.push("preview");
    return base;
  }, [isReproduction, withDate]);

  if (!ready) return <LoadingState variant="list" />;

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const canProceed = (() => {
    switch (step) {
      case "media":
        return media.length >= 1;
      case "caption":
        return caption.trim().length > 0;
      case "dateData":
        return draftDate.title.trim().length > 0;
      case "reproDetail":
        return rating >= 1;
      default:
        return true;
    }
  })();

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    // Stepping back over decision points reopens them
    const prev = steps[stepIndex - 1];
    if (prev === "askDate" || prev === "dateData") setWithDate(null);
    setStepIndex((i) => i - 1);
  };

  const submit = () => {
    const now = new Date().toISOString();
    const postId = generateId("p");
    const hasDate = !isReproduction && withDate === true && draftDate.title.trim();

    let createdDate: DateExperience | undefined;
    if (hasDate) {
      const dateId = generateId("d");
      createdDate = {
        id: dateId,
        postId,
        title: draftDate.title.trim(),
        area: draftDate.area,
        budgetMin: draftDate.budgetMin,
        budgetMax: Math.max(draftDate.budgetMin, draftDate.budgetMax),
        durationMinutes:
          draftDate.stops.length > 0 ? draftDate.stops.length * 60 : 120,
        scene: draftDate.scene,
        tags: [],
        timeline: draftDate.stops
          .filter((s) => s.placeName.trim())
          .map((s, i) => ({
            id: `${dateId}-s${i + 1}`,
            order: i + 1,
            time: s.time || "--:--",
            placeName: s.placeName.trim(),
            area: draftDate.area,
            category: s.category.trim() || "スポット",
            durationMinutes: 60,
            estimatedCost: s.estimatedCost,
            description: "",
            image: photo(`${dateId}-s${i + 1}`, 640, 480),
          })),
        tips: draftDate.tips
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        rating: 0,
        reviewCount: 0,
        saveCount: 0,
        reproductionCount: 0,
      };
    }

    let reproduction: Reproduction | undefined;
    if (isReproduction && originalDate) {
      reproduction = {
        id: generateId("r"),
        originalDateId: originalDate.id,
        originalPostId: originalDate.postId,
        reproductionPostId: postId,
        reproducerId: DEMO_USER_ID,
        reproducerType: "individual",
        changedStops: effectiveChangedStops.map((cs) => ({
          stopId: cs.stopId,
          changed: cs.changed,
          note: cs.changed ? cs.note || "変更あり" : "Same",
        })),
        comment: caption.trim(),
        rating,
        createdAt: now,
      };
    }

    const post: Post = {
      id: postId,
      authorId: DEMO_USER_ID,
      authorType: "individual",
      type: isReproduction ? "reproduction" : hasDate ? "date" : "normal",
      caption: caption.trim(),
      media: media.map((url, i) => ({
        id: `${postId}-m${i + 1}`,
        type: "image",
        url,
        alt: `投稿写真 ${i + 1}`,
      })),
      location: location.trim() || undefined,
      dateId: isReproduction ? originalDate?.id : createdDate?.id,
      originalDateId: isReproduction ? originalDate?.id : undefined,
      originalPostId: isReproduction ? originalDate?.postId : undefined,
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
      reproductionsCount: 0,
      isLiked: false,
      isSaved: false,
      createdAt: now,
    };

    dispatch({ type: "CREATE_POST", post, date: createdDate, reproduction });
    toast("投稿しました");
    router.push("/");
  };

  const reproCandidates = getAllDates(state)
    .filter((d) => {
      const p = getPost(state, d.postId);
      return p?.authorId !== DEMO_USER_ID;
    })
    .slice(0, 12);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-2 py-2.5 backdrop-blur">
        <button
          type="button"
          aria-label="戻る"
          onClick={goBack}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </button>
        <h1 className="text-base font-semibold">
          {isReproduction ? "再現を投稿" : "新規投稿"}
        </h1>
        <button
          type="button"
          aria-label="投稿をやめる"
          onClick={() => router.push("/")}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
        >
          <X className="h-6 w-6" aria-hidden />
        </button>
      </header>

      {/* step progress */}
      <div className="flex gap-1 px-4 pt-3" aria-hidden>
        {steps.map((s, i) => (
          <span
            key={s}
            className={`h-1 flex-1 rounded-full ${i <= stepIndex ? "bg-ink" : "bg-ink/10"}`}
          />
        ))}
      </div>

      <div className="px-4 pb-32 pt-5">
        {step === "media" && (
          <MediaStep
            selected={media}
            onToggle={(url) =>
              setMedia((prev) =>
                prev.includes(url)
                  ? prev.filter((u) => u !== url)
                  : prev.length >= 10
                    ? prev
                    : [...prev, url]
              )
            }
          />
        )}
        {step === "caption" && (
          <CaptionStep
            caption={caption}
            location={location}
            onCaption={setCaption}
            onLocation={setLocation}
          />
        )}
        {step === "askDate" && (
          <AskDateStep
            onYes={() => {
              setWithDate(true);
              goNext();
            }}
            onSkip={() => {
              setWithDate(false);
              goNext();
            }}
          />
        )}
        {step === "dateData" && <DateDataStep draft={draftDate} onChange={setDraftDate} />}
        {step === "askRepro" && (
          <AskReproduceStep
            candidates={reproCandidates}
            onSelect={(dateId) => {
              setOriginalDateId(dateId);
              setChangedStops(null);
              // switching to reproduction mode: jump to reproDetail step
              setStepIndex(2);
            }}
            onNo={goNext}
          />
        )}
        {step === "reproDetail" && originalDate && (
          <ReproductionDetailStep
            originalTitle={originalDate.title}
            changedStops={effectiveChangedStops}
            rating={rating}
            onToggleStop={(stopId) =>
              setChangedStops(
                effectiveChangedStops.map((cs) =>
                  cs.stopId === stopId ? { ...cs, changed: !cs.changed } : cs
                )
              )
            }
            onNote={(stopId, note) =>
              setChangedStops(
                effectiveChangedStops.map((cs) =>
                  cs.stopId === stopId ? { ...cs, note } : cs
                )
              )
            }
            onRating={setRating}
          />
        )}
        {step === "preview" && (
          <PreviewStep
            media={media}
            caption={caption}
            location={location}
            dateTitle={withDate === true ? draftDate.title : undefined}
            originalTitle={originalDate?.title}
          />
        )}
      </div>

      {step !== "askDate" && step !== "askRepro" && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-app border-t border-line bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          {step === "preview" ? (
            <Button variant="accent" size="lg" className="w-full" onClick={submit}>
              投稿する
            </Button>
          ) : (
            <Button size="lg" className="w-full" disabled={!canProceed} onClick={goNext}>
              次へ
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<LoadingState variant="list" />}>
      <CreatePostFlow />
    </Suspense>
  );
}
