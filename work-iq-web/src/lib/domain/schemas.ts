import { z } from "zod";

export const choiceIdSchema = z.enum(["a", "b", "c", "d"]);

export const categorySchema = z.enum([
  "business_terms",
  "judgment",
  "risk",
  "current_affairs",
]);

export const questionModeSchema = z.enum(["single_correct", "best_answer"]);

export const choiceSchema = z.object({
  id: choiceIdSchema,
  text: z.string().min(1),
});

const fourUniqueChoices = z
  .array(choiceSchema)
  .length(4, "選択肢はちょうど4つ必要です")
  .refine(
    (choices) => new Set(choices.map((c) => c.id)).size === 4,
    "選択肢IDはa/b/c/dを1つずつ使ってください",
  );

const jstDateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD形式で指定してください");

export const sourceInfoSchema = z.object({
  title: z.string().min(1),
  url: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), "出典URLはHTTPS必須です"),
  publishedAt: jstDateKeySchema,
  eventDate: jstDateKeySchema.optional(),
  checkedAt: z.string().min(1),
});

export const termInfoSchema = z.object({
  label: z.string().min(1),
  expansion: z.string().min(1).optional(),
  plainDefinition: z.string().min(1),
  goodUsage: z.string().min(1).optional(),
  badUsage: z.string().min(1).optional(),
});

export const choiceExplanationsSchema = z.object({
  a: z.string().min(1),
  b: z.string().min(1),
  c: z.string().min(1),
  d: z.string().min(1),
});

export const questionSchema = z
  .object({
    id: z.string().min(1),
    category: categorySchema,
    level: z.literal("beginner"),
    step: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]).optional(),
    mode: questionModeSchema,
    prompt: z.string().min(1),
    choices: fourUniqueChoices,
    correctChoiceId: choiceIdSchema.optional(),
    recommendedChoiceId: choiceIdSchema.optional(),
    explanation: z.string().min(1),
    choiceExplanations: choiceExplanationsSchema,
    tags: z.array(z.string().min(1)),
    term: termInfoSchema.optional(),
    source: sourceInfoSchema.optional(),
  })
  .superRefine((question, ctx) => {
    if (question.mode === "single_correct" && !question.correctChoiceId) {
      ctx.addIssue({
        code: "custom",
        path: ["correctChoiceId"],
        message: "single_correctにはcorrectChoiceIdが必要です",
      });
    }
    if (question.mode === "best_answer" && !question.recommendedChoiceId) {
      ctx.addIssue({
        code: "custom",
        path: ["recommendedChoiceId"],
        message: "best_answerにはrecommendedChoiceIdが必要です",
      });
    }
    if (question.category === "current_affairs" && !question.source) {
      ctx.addIssue({
        code: "custom",
        path: ["source"],
        message: "時事問題にはsource(出典)が必要です",
      });
    }
  });

export const questionListSchema = z.array(questionSchema);

export const dailyPollSchema = z
  .object({
    id: z.string().min(1),
    date: jstDateKeySchema,
    prompt: z.string().min(1),
    choices: fourUniqueChoices,
    tags: z.array(z.string().min(1)),
    thinkingPoints: z.array(z.string().min(1)).min(1),
    ctaHint: z.enum(["honne", "befoaf", "none"]).optional(),
  })
  .strict();

export const dailyPollListSchema = z.array(dailyPollSchema);

export const currentAffairsBatchSchema = z.object({
  batchDate: jstDateKeySchema,
  questions: z.array(questionSchema).min(1),
});
