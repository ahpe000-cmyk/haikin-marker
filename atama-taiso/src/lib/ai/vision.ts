import Anthropic from "@anthropic-ai/sdk";

/**
 * 食事写真のAI判定（サーバー専用・CLAUDE.md §6）。
 * - 画像はメモリ上の base64 のまま Anthropic API へ渡すだけ。
 *   ディスク・Storage・ログには一切書かない（このファイルに fs / console 出力を足さないこと）
 * - APIキーはサーバー環境変数 ANTHROPIC_API_KEY のみ
 * - 判定できない時は null を返し、画面側は「何を食べましたか?」と聞くだけにする
 */

export type MealJudgement = {
  dish_name: string;
  ingredients: string[];
  confidence: number;
};

/** confidence がこの値未満なら判定結果を出さない（仮の閾値。docs/DECISIONS.md 参照） */
export const CONFIDENCE_MIN = 0.6;

const PROMPT =
  "この写真は食事の写真です。日本の家庭料理・外食を想定し、料理名を日本語で1つ、" +
  "主な食材を最大5つ挙げてください。判定にどのくらい自信があるかを 0〜1 の confidence で示してください。" +
  '出力は次のJSONのみ。他の文章は一切書かないこと: {"dish_name": "料理名", "ingredients": ["食材1"], "confidence": 0.9}';

export async function judgeMealImage(
  base64Jpeg: string
): Promise<MealJudgement | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Jpeg,
              },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const jsonText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonText) as Partial<MealJudgement>;

    if (typeof parsed.dish_name !== "string" || !parsed.dish_name.trim()) {
      return null;
    }
    const confidence =
      typeof parsed.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0;
    const ingredients = Array.isArray(parsed.ingredients)
      ? parsed.ingredients
          .filter((s): s is string => typeof s === "string")
          .slice(0, 5)
      : [];
    return { dish_name: parsed.dish_name.trim(), ingredients, confidence };
  } catch {
    // 失敗の詳細は本人に見せず、画面側で「何を食べましたか?」に切り替える
    return null;
  }
}
