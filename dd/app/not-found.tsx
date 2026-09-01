import { AppShell } from "@/components/dd/AppShell";
import { ErrorState } from "@/components/dd/States";

export default function NotFound() {
  return (
    <AppShell>
      <ErrorState />
    </AppShell>
  );
}
