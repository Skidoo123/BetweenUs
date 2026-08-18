import { NextResponse } from "next/server";
import { ServerDB } from "@/lib/serverDb";

function generateInviteCode() {
  const words = ["LOVE", "PAIR", "BOND", "SOUL", "MINT", "SYNC", "GLOW", "VIBE"];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomDigits = Math.floor(10 + Math.random() * 90); // 10 to 99
  return `BU-${randomWord}-${randomDigits}`;
}

export async function POST(req) {
  try {
    const { relationshipMode, creatorId } = await req.json();
    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }
    
    let code = generateInviteCode();
    let attempts = 0;
    while (ServerDB.findSpaceByCode(code) && attempts < 100) {
      code = generateInviteCode();
      attempts++;
    }
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
