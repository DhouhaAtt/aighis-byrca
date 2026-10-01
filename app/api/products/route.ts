import { NextResponse } from "next/server";
import { productRepository } from "../../lib/repositories/product.repository";
import { isAdmin, unauthorized } from "../../lib/requireAdmin";
import { variantRepository } from "../../lib/repositories/variant.repository";
import {
  isValidProductPayload,
  toCreateProductInput,
  toVariantInputs,
} from "../../lib/productPayload";
import { parseColors, parseSizes, DEFAULT_VARIANT_COLOR, DEFAULT_VARIANT_SIZE } from "../../lib/productJson";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    const products = await productRepository.findAll();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

function defaultVariants(
  sizes: unknown,
  colors: unknown
): { size: string; color: string; hex: string | null; stock: number }[] {
  const sizeList = parseSizes(typeof sizes === "string" ? sizes : JSON.stringify(sizes ?? []));
  const colorList = parseColors(
    typeof colors === "string" ? colors : JSON.stringify(colors ?? [])
  );

  if (sizeList.length === 0 && colorList.length === 0) return [];

  const sizes_ = sizeList.length > 0 ? sizeList : [DEFAULT_VARIANT_SIZE];
  const colors_ =
    colorList.length > 0
      ? colorList
      : [{ name: DEFAULT_VARIANT_COLOR, hex: null }];

  return sizes_.flatMap((size) =>
    colors_.map((color) => ({ size, color: color.name, hex: color.hex ?? null, stock: 0 }))
  );
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const body = await request.json();
    if (!isValidProductPayload(body)) {
      return NextResponse.json(
        { error: "Name, price, and image are required" },
        { status: 400 }
      );
    }
    const product = await productRepository.create(toCreateProductInput(body));

    const variants = toVariantInputs(body);
    if (variants) {
      await variantRepository.sync(product.id, variants);
    } else {
      await variantRepository.sync(
        product.id,
        defaultVariants(body.sizes, body.colors)
      );
    }

    const full = await productRepository.findById(product.id);
    return NextResponse.json(full, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}