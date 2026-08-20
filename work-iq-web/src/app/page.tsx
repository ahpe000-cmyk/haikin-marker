import { HomeScreen } from "@/components/home/HomeScreen";
import { loadCurrentAffairsBatches } from "@/lib/content/load";
import { hasFreshCurrentAffairs } from "@/lib/quiz/current-affairs";
import { getJstDateKey } from "@/lib/time/jst";

// Freshness depends on the JST date at request time.
export const dynamic = "force-dynamic";

export default function HomePage() {
  const hasFreshNews = hasFreshCurrentAffairs(
    loadCurrentAffairsBatches(),
    getJstDateKey(),
  );
  return <HomeScreen hasFreshNews={hasFreshNews} />;
}
