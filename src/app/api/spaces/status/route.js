import { NextResponse } from "next/server";
import { ServerDB } from "@/lib/serverDb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");

    if (!spaceId) {
      return NextResponse.json({ error: "Missing spaceId" }, { status: 400 });
    }

    const space = ServerDB.findSpaceById(spaceId);
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      status: space.status,
      partnerId: space.partnerId,
      space
    });
  } catch (error) {
    console.error("Status check API Error:", error);
    return NextResponse.json({ error: "Failed to fetch space status" }, { status: 500 });
  }
}
