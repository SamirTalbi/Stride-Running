import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import * as cheerio from "cheerio";

type ExtractedProduct = {
  url: string;
  name: string | null;
  brand: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  sku: string | null;
  images: string[];
  colors: string[];
  sizes: string[];
  source: "json-ld" | "opengraph" | "mixed";
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return await res.text();
}

function parseJsonLd($: cheerio.CheerioAPI): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      // ignore malformed JSON
    }
  });
  return blocks;
}

function findProductNode(blocks: Record<string, unknown>[]): Record<string, unknown> | null {
  for (const b of blocks) {
    const type = b["@type"];
    if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) return b;
    const graph = b["@graph"];
    if (Array.isArray(graph)) {
      const hit = findProductNode(graph as Record<string, unknown>[]);
      if (hit) return hit;
    }
  }
  return null;
}

function asString(v: unknown): string | null {
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  return null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.,-]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function flattenImages(v: unknown): string[] {
  if (!v) return [];
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(flattenImages);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.url === "string") return [o.url];
    if (typeof o.contentUrl === "string") return [o.contentUrl];
  }
  return [];
}

function extractFromJsonLd(node: Record<string, unknown>): Partial<ExtractedProduct> {
  const offer = (() => {
    const o = node.offers;
    if (!o) return null;
    if (Array.isArray(o)) return (o[0] as Record<string, unknown>) ?? null;
    return o as Record<string, unknown>;
  })();

  const brandNode = node.brand;
  const brand =
    typeof brandNode === "string"
      ? brandNode
      : brandNode && typeof brandNode === "object"
        ? asString((brandNode as Record<string, unknown>).name)
        : null;

  const colorNode = node.color;
  const colors: string[] = Array.isArray(colorNode)
    ? colorNode.map(asString).filter((s): s is string => !!s)
    : typeof colorNode === "string"
      ? [colorNode]
      : [];

  return {
    name: asString(node.name),
    brand,
    description: asString(node.description),
    sku: asString(node.sku ?? node.mpn),
    price: offer ? asNumber(offer.price) : null,
    currency: offer ? asString(offer.priceCurrency) : null,
    images: flattenImages(node.image),
    colors,
    sizes: [],
  };
}

function extractFromOpenGraph($: cheerio.CheerioAPI): Partial<ExtractedProduct> {
  const og = (prop: string) => $(`meta[property="${prop}"]`).attr("content")?.trim() || null;
  const meta = (name: string) => $(`meta[name="${name}"]`).attr("content")?.trim() || null;
  const images: string[] = [];
  $('meta[property="og:image"]').each((_, el) => {
    const c = $(el).attr("content");
    if (c) images.push(c);
  });
  return {
    name: og("og:title") ?? meta("title") ?? ($("title").first().text().trim() || null),
    description: og("og:description") ?? meta("description"),
    price: asNumber(og("product:price:amount") ?? og("og:price:amount")),
    currency: og("product:price:currency") ?? og("og:price:currency"),
    brand: og("product:brand") ?? null,
    images,
    colors: [],
    sizes: [],
    sku: null,
  };
}

const IMAGE_BLOCKLIST = /(logo|sprite|icon|favicon|placeholder|tracking|pixel|spacer|loader|spinner|avatar)/i;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|avif)(\?|$)/i;

function bestFromSrcset(srcset: string): string | null {
  const candidates = srcset
    .split(",")
    .map((s) => s.trim())
    .map((part) => {
      const [url, w] = part.split(/\s+/);
      const width = w ? parseInt(w.replace(/[^\d]/g, ""), 10) : 0;
      return { url, width: Number.isFinite(width) ? width : 0 };
    })
    .filter((c) => c.url);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.width - a.width);
  return candidates[0].url;
}

function normalizeUrl(raw: string, base: string): string | null {
  try {
    if (raw.startsWith("//")) return `https:${raw}`;
    return new URL(raw, base).toString();
  } catch {
    return null;
  }
}

function extractFallbackImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const found = new Set<string>();
  const add = (raw?: string | null) => {
    if (!raw) return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (IMAGE_BLOCKLIST.test(trimmed)) return;
    if (!IMAGE_EXT_RE.test(trimmed) && !/cdn|image|media|product/i.test(trimmed)) return;
    const norm = normalizeUrl(trimmed, baseUrl);
    if (norm) found.add(norm);
  };

  // Preload hints — usually only the hero/gallery images are preloaded
  $('link[rel="preload"][as="image"]').each((_, el) => {
    add($(el).attr("href"));
    const imagesrcset = $(el).attr("imagesrcset");
    if (imagesrcset) add(bestFromSrcset(imagesrcset));
  });

  $('meta[name="twitter:image"], meta[name="twitter:image:src"]').each((_, el) => {
    add($(el).attr("content"));
  });

  return Array.from(found);
}

function cleanProductName(name: string | null, brand: string | null): string | null {
  if (!name) return name;
  let n = name.trim();
  // Strip everything after a site-style separator (pipe, middot, bullet, em/en dash)
  n = n.replace(/\s*[|·•—–]\s*.+$/u, "").trim();
  // Strip leading brand name if present (case-insensitive, with optional separator)
  if (brand) {
    const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    n = n.replace(new RegExp(`^${escaped}\\s*[:\\-–—|]?\\s*`, "i"), "").trim();
  }
  // Drop trailing words like "for Men", "Men's", "Women's", "Unisex"
  n = n.replace(/\s+(for\s+)?(men|women|unisex|kids?)('s)?$/i, "").trim();
  return n || name;
}

function dedupeByPattern(urls: string[]): string[] {
  const seen = new Map<string, string>();
  for (const u of urls) {
    const key = u
      .replace(/[?&](w|h|width|height|quality|q|f_auto|c_lpad|c_pad|t_default|sw|sh|q_\d+|w_\d+|h_\d+)=[^&]*/gi, "")
      .replace(/\/(w|h|q)_\d+[/_,]/gi, "/")
      .replace(/_\d+x\d+(?=\.[a-z]+(\?|$))/i, "");
    if (!seen.has(key)) seen.set(key, u);
  }
  return Array.from(seen.values());
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
    }

    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const ld = parseJsonLd($);
    const productNode = findProductNode(ld);
    const fromLd = productNode ? extractFromJsonLd(productNode) : {};
    const fromOg = extractFromOpenGraph($);

    // Strict priority: JSON-LD images are authoritative for THIS product.
    // Only fall back to OG/preload if JSON-LD has none.
    const ldImages = fromLd.images ?? [];
    const allImages = ldImages.length > 0
      ? dedupeByPattern(dedupe(ldImages))
      : dedupeByPattern(dedupe([...(fromOg.images ?? []), ...extractFallbackImages($, url)]));

    const rawName = fromLd.name ?? fromOg.name ?? null;
    const brandValue = fromLd.brand ?? fromOg.brand ?? null;
    const merged: ExtractedProduct = {
      url,
      name: cleanProductName(rawName, brandValue),
      brand: brandValue,
      description: fromLd.description ?? fromOg.description ?? null,
      price: fromLd.price ?? fromOg.price ?? null,
      currency: fromLd.currency ?? fromOg.currency ?? null,
      sku: fromLd.sku ?? null,
      images: allImages.slice(0, 12),
      colors: fromLd.colors ?? [],
      sizes: fromLd.sizes ?? [],
      source: productNode && fromOg.name ? "mixed" : productNode ? "json-ld" : "opengraph",
    };

    if (!merged.name && merged.images.length === 0) {
      return NextResponse.json(
        { error: "Could not extract product data from this URL" },
        { status: 422 }
      );
    }

    return NextResponse.json({ data: merged });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
