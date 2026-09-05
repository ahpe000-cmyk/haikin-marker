import Link from "next/link";
import SetupPending from "@/components/SetupPending";
import MojiSize from "@/components/MojiSize";
import { getCurrentAppUser, isSupabaseConfigured } from "@/lib/supabase/server";
import { setShareWithWatcher } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!isSupabaseConfigured()) return <SetupPending />;
  const user = await getCurrentAppUser();
  if (!user) return <SetupPending />;

  const shareOn = user.share_with_watcher;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold">せってい</h1>

      <section className="card flex flex-col gap-3">
        <p className="font-bold">文字の大きさ</p>
        <MojiSize />
      </section>

      {user.role === "senior" && (
        <section className="card flex flex-col gap-3">
          <p className="font-bold">記録を お子さんにも 見せますか?</p>
          <p className="text-sm text-[#8a6d3b]">
            いまは「{shareOn ? "見せる" : "見せない"}」に なっています。
            いつでも 変えられます。
          </p>
          <form
            action={async () => {
              "use server";
              await setShareWithWatcher(!shareOn);
            }}
          >
            <button type="submit" className="btn btn-secondary w-full">
              {shareOn ? "見せないに 変える" : "見せるに 変える"}
            </button>
          </form>
        </section>
      )}

      <Link href="/" className="btn btn-primary mt-auto">
        もどる
      </Link>
    </div>
  );
}
