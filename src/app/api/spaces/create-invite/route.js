import { NextResponse } from "next/server";
import { ServerDB } from "@/lib/serverDb";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusing 0/O or 1/I
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BU-${result.slice(0, 4)}-${result.slice(4)}`;
}

export async function POST(req) {
  try {
    const { relationshipMode, creatorId } = await req.json();
    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }
    
    const code = generateInviteCode();
    const newSpace = {
      id: "s_" + Math.random().toString(36).substr(2, 9),
      code,
      creatorId,
      partnerId: null,
      status: "pending",
      relationshipMode,
      streakDays: 0,
      lastActivityDate: new Date().toISOString(),
      name: relationshipMode.toUpperCase() + " Space",
      isUsed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    ServerDB.saveSpace(newSpace);

    return NextResponse.json({ success: true, space: newSpace });
  } catch (error) {
    console.error("Create Invite API Error:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
