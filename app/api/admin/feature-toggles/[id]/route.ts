import { NextResponse } from "next/server";

// GET request handler
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // aapka existing GET logic yahan rahega
  return NextResponse.json({ message: `Feature toggle ${params.id}` });
}

// PATCH request handler
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  // aapka existing PATCH logic yahan rahega
  return NextResponse.json({ success: true });
}

// DELETE request handler
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // aapka existing DELETE logic yahan rahega
  return NextResponse.json({ success: true });
}
