export function Tag({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-[var(--dd-charcoal)]">
      #{label}
    </span>
  );
}
