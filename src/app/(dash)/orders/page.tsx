import { Suspense } from "react";
import Container from "@/components/pages/orderline/Container";

export const metadata = { title: "Live orders" };

export default function OrderPage() {
  // The page reads ?tab= from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <Container />
    </Suspense>
  );
}
