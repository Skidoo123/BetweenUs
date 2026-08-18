import { NextResponse } from "next/server";
import { ServerDB } from "@/lib/serverDb";

export async function POST(req) {
  try {
    const { code, joinerId } = await req.json();
    if (!code || !joinerId) {
      return NextResponse.json({ error: "Code and joinerId are required" }, { status: 400 });
    }

    const space = ServerDB.findSpaceByCode(code);
    if (!space) {
      return NextResponse.json({ error: "Invite code not found." }, { status: 404 });
    }
    if (space.isUsed || space.partnerId) {
      return NextResponse.json({ error: "This invite code has already been used." }, { status: 400 });
    }
    if (new Date(space.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This invite code has expired." }, { status: 400 });
    }
    if (space.creatorId === joinerId) {
      return NextResponse.json({ error: "You cannot join your own space!" }, { status: 400 });
    }

    space.partnerId = joinerId;
    space.status = "active";
    space.streakDays = 1;
    space.isUsed = true;
    space.lastActivityDate = new Date().toISOString();

    ServerDB.saveSpace(space);

    return NextResponse.json({ success: true, space });
  } catch (error) {
    console.error("Join API Error:", error);
    return NextResponse.json({ error: "Failed to join space" }, { status: 500 });
  }
}
