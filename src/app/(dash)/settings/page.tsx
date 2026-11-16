import { Suspense } from "react";
import Container from "@/components/pages/settings/Container";

export const metadata = { title: "Settings" };

export default function SettingPage() {
  // The page reads ?tab= from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <Container />
    </Suspense>
  );
}
