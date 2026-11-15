import { redirect } from "next/navigation";

// Account details now live under Settings.
export default function AccountsPage() {
  redirect("/settings?tab=account");
}
