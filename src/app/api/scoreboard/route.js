import { NextResponse } from "next/server";
import { ServerDB } from "@/lib/serverDb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");
    const userId = searchParams.get("userId");

    if (!spaceId) {
      return NextResponse.json({ error: "Missing spaceId" }, { status: 400 });
    }

    const sessions = ServerDB.getGameSessions(spaceId);

    const gamesList = [
      { gameId: "link_four", name: "Link Four", icon: "grid_on", color: "#E58B58" },
      { gameId: "word_duel", name: "Word Duel", icon: "translate", color: "#6C8EEF" },
      { gameId: "spotted", name: "Spotted", icon: "visibility", color: "#A78BFA" },
      { gameId: "memory", name: "Memory Match", icon: "psychology", color: "#34D399" }
    ];

    // Aggregate scores
    const gameScores = gamesList.map(game => {
      const gameSessions = sessions.filter(s => s.gameType === game.gameId);
      
      let userScore = 0;
      let partnerScore = 0;
      let draws = 0;

      gameSessions.forEach(s => {
        if (s.isDraw) {
          draws++;
        } else if (userId && s.winnerId === userId) {
          userScore++;
        } else {
          // If a winner exists and it's not the user, it is the partner
          partnerScore++;
        }
      });

      return {
        ...game,
        userScore,
        partnerScore,
        draws
      };
    });

    const recentSessions = sessions.slice(-5).reverse().map(s => ({
      id: s.id,
      gameType: s.gameType,
      winnerId: s.winnerId,
      isDraw: s.isDraw,
      createdAt: s.createdAt
    }));

    return NextResponse.json({ gameScores, recentSessions });
  } catch (error) {
    console.error("Scoreboard GET API Error:", error);
    return NextResponse.json({ error: "Failed to fetch scoreboard stats" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { coupleId } = await req.json();
    
    if (!coupleId) {
      return NextResponse.json({ error: "Missing coupleId" }, { status: 400 });
    }

    ServerDB.resetGameSessions(coupleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Scoreboard Reset API Error:", error);
    return NextResponse.json({ error: "Failed to reset scoreboard" }, { status: 500 });
  }
}
