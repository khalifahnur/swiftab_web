import type { TableCode } from "@/types/api";

/**
 * The link a table's QR code opens. It is built on the site the dashboard is
 * served from, which is the same app that hosts the guest page.
 */
export function tableQrUrl(restaurantId: string, table: Pick<TableCode, "id" | "code">, origin?: string): string {
  const base = (origin ?? (typeof window !== "undefined" ? window.location.origin : "https://www.swiftab.co.ke")).replace(/\/$/, "");
  return `${base}/t/${restaurantId}/${encodeURIComponent(table.id)}?c=${encodeURIComponent(table.code)}`;
}

const esc = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export interface PrintableCard {
  restaurantName: string;
  tableName: string;
  floorName: string;
  /** The QR code as SVG markup. */
  svg: string;
}

/**
 * Opens the browser's print dialog with one table card per page section:
 * restaurant name, the code, the table and a line telling guests what to do.
 * Several cards are laid out two to a row on A4.
 */
export function printCards(cards: PrintableCard[]): boolean {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  const body = cards
    .map(
      (c) => `
      <section class="card">
        <p class="kicker">Scan to order</p>
        <h1>${esc(c.restaurantName)}</h1>
        <div class="qr">${c.svg}</div>
        <p class="table">Table ${esc(c.tableName)}</p>
        ${c.floorName ? `<p class="floor">${esc(c.floorName)}</p>` : ""}
        <p class="hint">Point your phone camera at the code to check in, see the menu and order from your table.</p>
        <p class="brand">Powered by Swiftab</p>
      </section>`,
    )
    .join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Table QR codes</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif; color: #0f1f1d; }
    .grid { display: grid; grid-template-columns: ${cards.length > 1 ? "1fr 1fr" : "1fr"}; gap: 10mm; justify-items: center; }
    .card { width: ${cards.length > 1 ? "85mm" : "110mm"}; border: 1px solid #d6e2df; border-radius: 6mm; padding: 8mm 7mm 6mm; text-align: center; break-inside: avoid; page-break-inside: avoid; }
    .kicker { margin: 0; font-size: 9pt; letter-spacing: .18em; text-transform: uppercase; color: #008080; font-weight: 700; }
    h1 { margin: 2mm 0 5mm; font-size: ${cards.length > 1 ? "15pt" : "19pt"}; line-height: 1.2; }
    .qr svg { width: ${cards.length > 1 ? "52mm" : "70mm"}; height: auto; }
    .table { margin: 4mm 0 0; font-size: ${cards.length > 1 ? "18pt" : "24pt"}; font-weight: 800; }
    .floor { margin: 1mm 0 0; font-size: 10pt; color: #5b6b68; }
    .hint { margin: 4mm auto 0; max-width: 70mm; font-size: 9pt; line-height: 1.45; color: #44524f; }
    .brand { margin: 4mm 0 0; font-size: 7.5pt; color: #8a9794; }
  </style></head><body><div class="grid">${body}</div>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 250); };<\/script>
  </body></html>`);
  win.document.close();
  return true;
}

/** Draws an SVG QR code onto a canvas and returns it as a PNG file. */
export async function svgToPng(svg: SVGSVGElement, size: number, fileName: string): Promise<File> {
  const markup = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
    const pad = Math.round(size * 0.08);
    const canvas = document.createElement("canvas");
    canvas.width = size + pad * 2;
    canvas.height = size + pad * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, pad, pad, size, size);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png"))), "image/png"));
    return new File([blob], fileName, { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const qrFileName = (restaurantName: string, tableName: string) =>
  `${`${restaurantName}-table-${tableName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-qr.png`;
