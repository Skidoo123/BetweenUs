import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/lib/serverDb.json');

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { spaces: [], gameSessions: [] };
    }
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!data.spaces) data.spaces = [];
    if (!data.gameSessions) data.gameSessions = [];
    return data;
  } catch (e) {
    return { spaces: [], gameSessions: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(e);
  }
}

export const ServerDB = {
  getSpaces() {
    return readDb().spaces;
  },
  
  saveSpace(space) {
    const db = readDb();
    const index = db.spaces.findIndex(s => s.id === space.id);
    if (index > -1) {
      db.spaces[index] = space;
    } else {
      db.spaces.push(space);
    }
    writeDb(db);
  },

  findSpaceByCode(code) {
    const normalized = code.replace(/[^A-Z0-9]/g, "").toUpperCase();
    return this.getSpaces().find(s => {
      const sNormalized = s.code.replace(/[^A-Z0-9]/g, "").toUpperCase();
      return sNormalized === normalized;
    });
  },

  findSpaceById(id) {
    return this.getSpaces().find(s => s.id === id);
  },

  getGameSessions(coupleId) {
    return readDb().gameSessions.filter(gs => gs.coupleId === coupleId);
  },

  saveGameSession(session) {
    const db = readDb();
    db.gameSessions.push({
      id: session.id || "gs_" + Math.random().toString(36).substr(2, 9),
      coupleId: session.coupleId,
      gameType: session.gameType,
      winnerId: session.winnerId || null,
      isDraw: !!session.isDraw,
      createdAt: session.createdAt || new Date().toISOString()
    });
    writeDb(db);
  },

  resetGameSessions(coupleId) {
    const db = readDb();
    db.gameSessions = db.gameSessions.filter(gs => gs.coupleId !== coupleId);
    writeDb(db);
  }
};
