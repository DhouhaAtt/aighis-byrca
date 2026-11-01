import { NextResponse } from "next/server";

import { isAdmin, unauthorized } from "../../../lib/requireAdmin";

function providerUrl(): string | null {
  const url = process.env.RECOLOR_SEGMENTATION_URL?.trim();
  return url || null;
}

export async function GET() {
  return NextResponse.json({ configured: Boolean(providerUrl()) });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();

  const endpoint = providerUrl();
  if (!endpoint) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  try {
    const body = (await request.json()) as { imageUrl?: unknown };
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const absoluteImageUrl = imageUrl.startsWith("/")
      ? new URL(imageUrl, request.url).toString()
      : imageUrl;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.RECOLOR_SEGMENTATION_KEY
            ? { Authorization: `Bearer ${process.env.RECOLOR_SEGMENTATION_KEY}` }
            : {}),
        },
        body: JSON.stringify({
          image_url: absoluteImageUrl,
          model: process.env.RECOLOR_SEGMENTATION_MODEL || "sam2",
          output: "png-alpha",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Segmentation provider returned ${response.status}` },
          { status: 502 }
        );
      }

      const data = (await response.json()) as {
        maskDataUrl?: unknown;
        mask?: unknown;
        confidence?: unknown;
        sourceColor?: unknown;
        width?: unknown;
        height?: unknown;
      };

      const maskDataUrl =
        typeof data.maskDataUrl === "string"
          ? data.maskDataUrl
          : typeof data.mask === "string"
            ? data.mask
            : null;

      if (!maskDataUrl || !maskDataUrl.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "Segmentation provider did not return a PNG mask" },
          { status: 502 }
        );
      }

      return NextResponse.json({
        configured: true,
        engine: "ai",
        maskDataUrl,
        confidence:
          typeof data.confidence === "number" && Number.isFinite(data.confidence)
            ? data.confidence
            : 0.85,
        sourceColor: typeof data.sourceColor === "string" ? data.sourceColor : null,
        width: typeof data.width === "number" ? data.width : undefined,
        height: typeof data.height === "number" ? data.height : undefined,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Segmentation provider timed out"
        : "Segmentation request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
