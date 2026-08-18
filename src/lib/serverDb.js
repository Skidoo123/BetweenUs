import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/lib/serverDb.json');

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { spaces: [] };
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return { spaces: [] };
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
  }
};
