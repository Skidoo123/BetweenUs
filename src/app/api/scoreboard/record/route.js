import { NextResponse } from "next/server";
import { ServerDB } from "@/lib/serverDb";

export async function POST(req) {
  try {
    const { coupleId, gameType, winnerId, isDraw } = await req.json();
    
    if (!coupleId || !gameType) {
      return NextResponse.json({ error: "Missing coupleId or gameType" }, { status: 400 });
    }

    const session = {
      id: "gs_" + Math.random().toString(36).substr(2, 9),
      coupleId,
      gameType,
      winnerId: isDraw ? null : (winnerId || null),
      isDraw: !!isDraw,
      createdAt: new Date().toISOString()
    };

    ServerDB.saveGameSession(session);

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("Scoreboard Record API Error:", error);
    return NextResponse.json({ error: "Failed to record game session" }, { status: 500 });
  }
}
