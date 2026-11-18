import type { Metadata } from "next";
import TabApp from "@/components/dine/TabApp";

export const metadata: Metadata = {
  title: "Order on a friend's tab",
  description: "You were invited to order from the menu. Your dishes go on your host's bill.",
  // Every link belongs to one booking; there is nothing here for search engines.
  robots: { index: false, follow: false },
};

/** The page a shared tab link opens. */
export default async function SharedTabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <TabApp code={decodeURIComponent(code)} />;
}
