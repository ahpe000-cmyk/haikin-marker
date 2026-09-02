import { redirect } from "next/navigation";

/** /home is an alias of the root home feed. */
export default function HomeAlias() {
  redirect("/");
}
