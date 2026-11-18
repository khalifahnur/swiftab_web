import type { Metadata } from "next";
import DineApp from "@/components/dine/DineApp";

export const metadata: Metadata = {
  title: "Order at your table",
  description: "Check in at your table, browse the menu and order from your phone.",
  // Each link is tied to one table; there is nothing here for search engines.
  robots: { index: false, follow: false },
};

/** The page a table's QR code opens. */
export default async function TablePage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantId: string; tableId: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { restaurantId, tableId } = await params;
  const { c } = await searchParams;
  return <DineApp restaurantId={restaurantId} tableId={decodeURIComponent(tableId)} code={c ?? ""} />;
}
