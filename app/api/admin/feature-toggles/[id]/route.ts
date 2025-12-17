import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ NEW: params must be awaited
    const { id } = await context.params;

    const body = await request.json();

    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid 'enabled' value" },
        { status: 400 }
      );
    }

    const updatedToggle = await prisma.featureToggle.update({
      where: { id },
      data: {
        enabled: body.enabled
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedToggle
    });
  } catch (error: any) {
    console.error("Feature toggle PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message ?? "Failed to update feature toggle"
      },
      { status: 500 }
    );
  }
}
