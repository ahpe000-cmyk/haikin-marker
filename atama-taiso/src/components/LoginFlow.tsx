"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { bindLogin } from "@/app/hajimeru/actions";

type Person = { id: string; display_name: string; role: string };

/**
 * はじめる画面（4桁のあいことば方式・docs/DECISIONS.md 14-1）。
 * 1度あいことばが通れば端末に記憶され、次回からこの画面は出ない。
 */
export default function LoginFlow({ people }: { people: Person[] }) {
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [digits, setDigits] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (code: string) => {
    if (!person || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      }
      const result = await bindLogin(person.id, code);
      if (result.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      setMessage(result.message ?? "もういちど おためしください。");
    } catch {
      setMessage("うまく つながりませんでした。もういちど おためしください。");
    } finally {
      setDigits("");
      setBusy(false);
    }
  };

  if (!person) {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <h1 className="text-2xl font-bold text-center">頭の体操</h1>
        <p className="text-center text-xl">あなたは どなたですか?</p>
        <div className="flex flex-col gap-4">
          {people
            .filter((p) => p.role === "senior")
            .map((p) => (
              <button
                key={p.id}
                className="btn btn-primary py-5 text-2xl"
                onClick={() => setPerson(p)}
              >
                {p.display_name}
              </button>
            ))}
        </div>
        <div className="mt-auto flex justify-center">
          {people
            .filter((p) => p.role === "watcher")
            .map((p) => (
              <button
                key={p.id}
                className="btn btn-quiet w-auto"
                onClick={() => setPerson(p)}
              >
                {p.display_name}の方は こちら
              </button>
            ))}
        </div>
      </div>
    );
  }

  const press = (n: string) => {
    if (busy || digits.length >= 4) return;
    const next = digits + n;
    setDigits(next);
    if (next.length === 4) void submit(next);
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <p className="text-center text-xl font-bold">
        {person.display_name}ですね。
        <br />
        あいことば（すうじ4つ）を おしてください
      </p>

      <div className="flex justify-center gap-3" aria-label="いれた数">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="flex h-14 w-14 items-center justify-center rounded-xl border-[3px] border-[#e5d5b8] bg-white text-2xl font-bold"
          >
            {digits[i] ? "●" : ""}
          </span>
        ))}
      </div>

      {message && (
        <p className="text-center font-bold text-[#a05252]">{message}</p>
      )}
      {busy && <p className="text-center">たしかめています…</p>}

      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button key={n} className="btn btn-secondary text-2xl" onClick={() => press(n)}>
            {n}
          </button>
        ))}
        <button
          className="btn btn-quiet"
          onClick={() => {
            setPerson(null);
            setDigits("");
            setMessage("");
          }}
        >
          もどる
        </button>
        <button className="btn btn-secondary text-2xl" onClick={() => press("0")}>
          0
        </button>
        <button className="btn btn-quiet" onClick={() => setDigits(digits.slice(0, -1))}>
          けす
        </button>
      </div>
    </div>
  );
}
