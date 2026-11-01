export type RecolorEngine = "ai" | "local" | "manual";

export interface RecolorMaskProfile {
  sourceImage: string;
  maskImage: string;
  engine: RecolorEngine;
  confidence: number;
  sourceColor?: string | null;
  width?: number;
  height?: number;
  createdAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function parseRecolorMask(
  value: string | null | undefined
): RecolorMaskProfile | null {
  if (!value) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;
  if (typeof parsed.sourceImage !== "string" || typeof parsed.maskImage !== "string") {
    return null;
  }

  const engine =
    parsed.engine === "ai" || parsed.engine === "manual" ? parsed.engine : "local";

  return {
    sourceImage: parsed.sourceImage,
    maskImage: parsed.maskImage,
    engine,
    confidence:
      typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0,
    sourceColor: typeof parsed.sourceColor === "string" ? parsed.sourceColor : null,
    width: typeof parsed.width === "number" ? parsed.width : undefined,
    height: typeof parsed.height === "number" ? parsed.height : undefined,
    createdAt:
      typeof parsed.createdAt === "string"
        ? parsed.createdAt
        : new Date(0).toISOString(),
  };
}

export function serializeRecolorMask(profile: RecolorMaskProfile | null): string | null {
  if (!profile) return null;
  return JSON.stringify(profile);
}

export function isRecolorMaskProfile(value: unknown): value is RecolorMaskProfile {
  return (
    isRecord(value) &&
    typeof value.sourceImage === "string" &&
    typeof value.maskImage === "string"
  );
}
