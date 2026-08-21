import { DEFAULT_QUESTIONS, DEFAULT_CHALLENGES } from './data';

// Helper to check if window is defined (SSR safety in Next.js)
const isBrowser = typeof window !== 'undefined';

export const DB = {
  KEYS: {
    USERS: "bu_users",
    SPACES: "bu_spaces",
    ANSWERS: "bu_answers",
    CHALLENGES: "bu_challenges",
    CHATS: "bu_chats",
    MEMORIES: "bu_memories",
    ACTIVE_USER: "bu_active_user_id",
    SEED_DONE: "bu_seed_completed_v1",
    CUSTOM_QUESTIONS: "bu_custom_questions",
    LOVE_LETTERS: "bu_love_letters",
    DRAWINGS: "bu_drawings",
    DATE_PLANS: "bu_date_plans",
    TOUCH_PINGS: "bu_touch_pings",
    DIARY: "bu_diary_entries",
    GAME_SCORES: "bu_game_scores"
  },

  get(key) {
    if (!isBrowser) return [];
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  },

  set(key, val) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(val));
    // Trigger storage event manually to notify other open tabs
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(val) }));
  },

  init() {
    if (!isBrowser) return;
    if (localStorage.getItem(this.KEYS.SEED_DONE)) return;

    // Seed Initial Users & Spaces (Alice & Bob default demo space)
    const demoUserA = {
      id: "u_alice",
      email: "alice@example.com",
      password: "password",
      name: "Alice",
      avatarColor: "#ff5a79",
      mood: "😊",
      moodLabel: "Great",
      moodTime: new Date().toISOString()
    };

    const demoUserB = {
      id: "u_bob",
      email: "bob@example.com",
      password: "password",
      name: "Bob",
      avatarColor: "#8a4fff",
      mood: "🙂",
      moodLabel: "Good",
      moodTime: new Date().toISOString()
    };

    const demoSpace = {
      id: "s_demo",
      code: "BU-LOVE-77",
      creatorId: "u_alice",
      partnerId: "u_bob",
      status: "active",
      relationshipMode: "couple",
      streakDays: 12,
      lastActivityDate: new Date().toISOString(),
      name: "Alice & Bob"
    };

    demoUserA.currentSpaceId = "s_demo";
    demoUserB.currentSpaceId = "s_demo";

    this.set(this.KEYS.USERS, [demoUserA, demoUserB]);
    this.set(this.KEYS.SPACES, [demoSpace]);

    const initialAnswers = [
      {
        spaceId: "s_demo",
        questionId: "q_1",
        answers: {
          u_alice: { text: "When you brought me coffee at work without me asking!", timestamp: new Date().toISOString() },
          u_bob: { text: "When you helped me clean up after that big dinner party.", timestamp: new Date().toISOString() }
        }
      },
      {
        spaceId: "s_demo",
        questionId: "q_2",
        answers: {
          u_alice: { text: "I really want to go on a weekend camping trip.", timestamp: new Date().toISOString() }
        }
      }
    ];
    this.set(this.KEYS.ANSWERS, initialAnswers);

    const initialChallenges = [
      {
        spaceId: "s_demo",
        challengeId: "c_1",
        completions: {
          u_alice: new Date().toISOString(),
          u_bob: new Date().toISOString()
        }
      },
      {
        spaceId: "s_demo",
        challengeId: "c_2",
        completions: {
          u_alice: new Date().toISOString()
        }
      }
    ];
    this.set(this.KEYS.CHALLENGES, initialChallenges);

    const initialChats = [
      {
        spaceId: "s_demo",
        senderId: "u_alice",
        text: "Hey! Happy anniversary of our streak 🔥",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        spaceId: "s_demo",
        senderId: "u_bob",
        text: "Aww thank you! Looking forward to answering today's question.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ];
    this.set(this.KEYS.CHATS, initialChats);

    const initialMemories = [
      {
        id: "m_1",
        spaceId: "s_demo",
        type: "milestone",
        title: "Started our BetweenUs journey!",
        detail: "Created our private space BU-LOVE-77 and committed to growing closer every day.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
      },
      {
        id: "m_2",
        spaceId: "s_demo",
        type: "question",
        title: "What made us happy",
        detail: "Alice: 'When you brought me coffee at work.'\nBob: 'When you helped me clean up after dinner.'",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];
    this.set(this.KEYS.MEMORIES, initialMemories);

    const initialLetters = [
      {
        id: "l_1",
        spaceId: "s_demo",
        senderId: "u_bob",
        senderName: "Bob",
        message: "Hey Alice, just wanted to write a quick note to say how grateful I am for our space together. Seeing your daily updates always brightens my day! ❤️",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        sealed: false
      }
    ];
    this.set(this.KEYS.LOVE_LETTERS, initialLetters);

    const initialDrawings = [
      {
        spaceId: "s_demo",
        drawingDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='40' stroke='orange' stroke-width='4' fill='none'/></svg>",
        senderId: "u_alice",
        timestamp: new Date().toISOString()
      }
    ];
    this.set(this.KEYS.DRAWINGS, initialDrawings);

    const initialDates = [
      {
        id: "d_1",
        spaceId: "s_demo",
        title: "Cozy Picnic in the Park",
        dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
        location: "Central Gardens",
        description: "Let's pack some cheese, fruit, and sandwiches. I'll bring the blanket and some vinyl speakers!",
        bucketList: [
          { id: 1, text: "Try the bakery's sourdough bread", done: true },
          { id: 2, text: "Take a polaroid photo together", done: false },
          { id: 3, text: "Watch the sunset from the hill", done: false }
        ]
      }
    ];
    this.set(this.KEYS.DATE_PLANS, initialDates);
    this.set(this.KEYS.TOUCH_PINGS, []);

    const initialDiary = [
      {
        id: "diary_1",
        spaceId: "s_demo",
        userId: "u_alice",
        title: "Bob's Favorite Coffee Order ☕",
        content: "Bob mentioned he loves Oat Milk Lattes with exactly half a pump of vanilla syrup. Needs to be extra hot! Keep this in mind for surprise morning deliveries.",
        category: "Remember",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
      },
      {
        id: "diary_2",
        spaceId: "s_demo",
        userId: "u_alice",
        title: "Sunset Walk Surprise 🌅",
        content: "We walked near the lake and he drops hints about wanting to visit that new botanical museum. Let's schedule it for next week's date!",
        category: "Hints",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString().split('T')[0],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ];
    this.set(this.KEYS.DIARY, initialDiary);

    const initialScores = [
      { gameId: "link_four", name: "Link Four", icon: "grid_on", color: "#E58B58", userScore: 3, partnerScore: 2, draws: 1 },
      { gameId: "word_duel", name: "Word Duel", icon: "translate", color: "#6C8EEF", userScore: 4, partnerScore: 4, draws: 2 },
      { gameId: "spotted", name: "Spotted", icon: "visibility", color: "#A78BFA", userScore: 1, partnerScore: 2, draws: 0 },
      { gameId: "memory", name: "Memory Match", icon: "psychology", color: "#34D399", userScore: 0, partnerScore: 0, draws: 0 }
    ];
    this.set(this.KEYS.GAME_SCORES, initialScores);

    localStorage.setItem(this.KEYS.ACTIVE_USER, "u_alice");
    localStorage.setItem(this.KEYS.SEED_DONE, "true");
  },

  // Questions Manager
  getAllQuestions() {
    const customQs = this.get(this.KEYS.CUSTOM_QUESTIONS);
    return [...DEFAULT_QUESTIONS, ...customQs];
  },

  addCustomQuestion(text, category, modes) {
    const customQs = this.get(this.KEYS.CUSTOM_QUESTIONS);
    const newQ = {
      id: "q_custom_" + Math.random().toString(36).substr(2, 5),
      text,
      category,
      modes
    };
    customQs.push(newQ);
    this.set(this.KEYS.CUSTOM_QUESTIONS, customQs);
    return newQ;
  },

  deleteCustomQuestion(questionId) {
    const customQs = this.get(this.KEYS.CUSTOM_QUESTIONS);
    const filtered = customQs.filter(q => q.id !== questionId);
    this.set(this.KEYS.CUSTOM_QUESTIONS, filtered);
  },

  register(email, password, name, avatarColor) {
    const users = this.get(this.KEYS.USERS);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered!");
    }
    const newUser = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password,
      name,
      avatarColor: avatarColor || "#ff5a79",
      mood: "🙂",
      moodLabel: "Good",
      moodTime: new Date().toISOString()
    };
    users.push(newUser);
    this.set(this.KEYS.USERS, users);
    return newUser;
  },

  login(email, password) {
    const users = this.get(this.KEYS.USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error("Invalid email or password.");
    localStorage.setItem(this.KEYS.ACTIVE_USER, user.id);
    return user;
  },

  createSpace(creatorId, relationshipMode) {
    const spaces = this.get(this.KEYS.SPACES);
    
    const generateUniqueCode = () => {
      const words = ["LOVE", "PAIR", "BOND", "SOUL", "MINT", "SYNC", "GLOW", "VIBE"];
      const randomWord = words[Math.floor(Math.random() * words.length)];
      const randomDigits = Math.floor(10 + Math.random() * 90); // 10 to 99
      return `BU-${randomWord}-${randomDigits}`;
    };

    let code = generateUniqueCode();
    let attempts = 0;
    while (spaces.find(s => s.code.replace(/[^A-Z0-9]/g, "").toUpperCase() === code.replace(/[^A-Z0-9]/g, "").toUpperCase()) && attempts < 100) {
      code = generateUniqueCode();
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
      name: relationshipMode.toUpperCase() + " Space"
    };
    spaces.push(newSpace);
    this.set(this.KEYS.SPACES, spaces);

    const users = this.get(this.KEYS.USERS);
    const user = users.find(u => u.id === creatorId);
    if (user) {
      user.currentSpaceId = newSpace.id;
      this.set(this.KEYS.USERS, users);
    }
    return newSpace;
  },

  joinSpace(joinerId, code) {
    const spaces = this.get(this.KEYS.SPACES);
    const space = spaces.find(s => s.code.replace(/\s/g, '').toUpperCase() === code.replace(/\s/g, '').toUpperCase());
    if (!space) throw new Error("Invite code not found.");
    if (space.partnerId) throw new Error("This space is already full.");
    if (space.creatorId === joinerId) throw new Error("You cannot join your own space!");

    space.partnerId = joinerId;
    space.status = "active";
    space.streakDays = 1;
    space.lastActivityDate = new Date().toISOString();

    const users = this.get(this.KEYS.USERS);
    const joiner = users.find(u => u.id === joinerId);
    const creator = users.find(u => u.id === space.creatorId);
    
    if (joiner) joiner.currentSpaceId = space.id;
    space.name = `${creator ? creator.name : 'User'} & ${joiner ? joiner.name : 'User'}`;
    
    this.set(this.KEYS.SPACES, spaces);
    this.set(this.KEYS.USERS, users);

    this.addMemory(space.id, "milestone", "Connected our Space!", `Started connected space code: ${code}`);

    return space;
  },

  updateMood(userId, mood, label) {
    const users = this.get(this.KEYS.USERS);
    const user = users.find(u => u.id === userId);
    if (user) {
      user.mood = mood;
      user.moodLabel = label;
      user.moodTime = new Date().toISOString();
      this.set(this.KEYS.USERS, users);
    }
  },

  submitAnswer(spaceId, userId, questionId, text) {
    const answersList = this.get(this.KEYS.ANSWERS);
    let answerObj = answersList.find(a => a.spaceId === spaceId && a.questionId === questionId);
    if (!answerObj) {
      answerObj = { spaceId, questionId, answers: {} };
      answersList.push(answerObj);
    }
    answerObj.answers[userId] = {
      text,
      timestamp: new Date().toISOString()
    };
    this.set(this.KEYS.ANSWERS, answersList);

    const spaces = this.get(this.KEYS.SPACES);
    const space = spaces.find(s => s.id === spaceId);
    if (space && space.partnerId) {
      const hasA = !!answerObj.answers[space.creatorId];
      const hasB = !!answerObj.answers[space.partnerId];
      if (hasA && hasB) {
        const lastAct = new Date(space.lastActivityDate);
        const today = new Date();
        if (lastAct.toDateString() !== today.toDateString()) {
          space.streakDays += 1;
          space.lastActivityDate = today.toISOString();
          this.set(this.KEYS.SPACES, spaces);
        }

        const allQs = this.getAllQuestions();
        const qSeed = allQs.find(q => q.id === questionId);
        const users = this.get(this.KEYS.USERS);
        const uA = users.find(u => u.id === space.creatorId);
        const uB = users.find(u => u.id === space.partnerId);

        const memoryTitle = qSeed ? qSeed.text : "Daily Question Answered";
        const memoryDetail = `${uA ? uA.name : 'Partner A'}: "${answerObj.answers[space.creatorId].text}"\n${uB ? uB.name : 'Partner B'}: "${answerObj.answers[space.partnerId].text}"`;
        
        const memories = this.get(this.KEYS.MEMORIES);
        if (!memories.find(m => m.spaceId === spaceId && m.type === "question" && m.title === memoryTitle)) {
          this.addMemory(spaceId, "question", memoryTitle, memoryDetail);
        }
      }
    }
  },

  completeChallenge(spaceId, userId, challengeId) {
    const challengesList = this.get(this.KEYS.CHALLENGES);
    let compObj = challengesList.find(c => c.spaceId === spaceId && c.challengeId === challengeId);
    if (!compObj) {
      compObj = { spaceId, challengeId, completions: {} };
      challengesList.push(compObj);
    }
    compObj.completions[userId] = new Date().toISOString();
    this.set(this.KEYS.CHALLENGES, challengesList);

    const spaces = this.get(this.KEYS.SPACES);
    const space = spaces.find(s => s.id === spaceId);
    if (space && space.partnerId) {
      const hasA = !!compObj.completions[space.creatorId];
      const hasB = !!compObj.completions[space.partnerId];
      if (hasA && hasB) {
        this.addMemory(spaceId, "milestone", "Challenge Completed Together!", `Both finished challenge.`);
      }
    }
  },

  sendChatMessage(spaceId, senderId, text, media) {
    const chats = this.get(this.KEYS.CHATS);
    const newChat = {
      spaceId,
      senderId,
      text,
      media: media || null,
      timestamp: new Date().toISOString()
    };
    chats.push(newChat);
    this.set(this.KEYS.CHATS, chats);

    if (media) {
      const users = this.get(this.KEYS.USERS);
      const user = users.find(u => u.id === senderId);
      this.addMemory(spaceId, "photo", `Photo shared by ${user ? user.name : 'partner'}`, text || "Shared in Chat", media);
    }
    return newChat;
  },

  addMemory(spaceId, type, title, detail, media) {
    const memories = this.get(this.KEYS.MEMORIES);
    const newMemory = {
      id: "m_" + Math.random().toString(36).substr(2, 9),
      spaceId,
      type,
      title,
      detail,
      media: media || null,
      timestamp: new Date().toISOString()
    };
    memories.push(newMemory);
    this.set(this.KEYS.MEMORIES, memories);
    return newMemory;
  },

  leaveSpace(userId, spaceId) {
    const spaces = this.get(this.KEYS.SPACES);
    const spaceIndex = spaces.findIndex(s => s.id === spaceId);
    if (spaceIndex > -1) {
      spaces.splice(spaceIndex, 1);
      this.set(this.KEYS.SPACES, spaces);
    }

    const users = this.get(this.KEYS.USERS);
    users.forEach(u => {
      if (u.currentSpaceId === spaceId) {
        delete u.currentSpaceId;
      }
    });
    this.set(this.KEYS.USERS, users);
  },

  // Admin capabilities
  deleteUser(userId) {
    const users = this.get(this.KEYS.USERS);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return;
    
    const user = users[index];
    const spaceId = user.currentSpaceId;

    users.splice(index, 1);
    this.set(this.KEYS.USERS, users);

    if (spaceId) {
      this.deleteSpace(spaceId);
    }
  },

  deleteSpace(spaceId) {
    const spaces = this.get(this.KEYS.SPACES);
    const spaceIndex = spaces.findIndex(s => s.id === spaceId);
    if (spaceIndex > -1) {
      spaces.splice(spaceIndex, 1);
      this.set(this.KEYS.SPACES, spaces);
    }

    const users = this.get(this.KEYS.USERS);
    users.forEach(u => {
      if (u.currentSpaceId === spaceId) {
        delete u.currentSpaceId;
      }
    });
    this.set(this.KEYS.USERS, users);

    this.set(this.KEYS.ANSWERS, this.get(this.KEYS.ANSWERS).filter(a => a.spaceId !== spaceId));
    this.set(this.KEYS.CHATS, this.get(this.KEYS.CHATS).filter(c => c.spaceId !== spaceId));
    this.set(this.KEYS.MEMORIES, this.get(this.KEYS.MEMORIES).filter(m => m.spaceId !== spaceId));
  },

  adjustStreak(spaceId, newStreak) {
    const spaces = this.get(this.KEYS.SPACES);
    const space = spaces.find(s => s.id === spaceId);
    if (space) {
      space.streakDays = parseInt(newStreak, 10) || 0;
      space.lastActivityDate = new Date().toISOString();
      this.set(this.KEYS.SPACES, spaces);
    }
  },

  resetDatabase() {
    localStorage.clear();
    this.init();
  },

  clearChats() {
    this.set(this.KEYS.CHATS, []);
  },

  clearCustomQuestions() {
    this.set(this.KEYS.CUSTOM_QUESTIONS, []);
  },

  // Love Letters Manager
  getLoveLetters(spaceId) {
    return this.get(this.KEYS.LOVE_LETTERS).filter(l => l.spaceId === spaceId);
  },

  sendLoveLetter(spaceId, senderId, senderName, message) {
    const letters = this.get(this.KEYS.LOVE_LETTERS);
    const newLetter = {
      id: "l_" + Math.random().toString(36).substr(2, 9),
      spaceId,
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString(),
      sealed: false
    };
    letters.push(newLetter);
    this.set(this.KEYS.LOVE_LETTERS, letters);

    this.addMemory(spaceId, "milestone", `Love Letter sealed by ${senderName}`, `${message.substring(0, 60)}...`);
    return newLetter;
  },

  // Collaborative Drawing Board
  getDrawing(spaceId) {
    const drawings = this.get(this.KEYS.DRAWINGS);
    return drawings.find(d => d.spaceId === spaceId) || null;
  },

  saveDrawing(spaceId, senderId, drawingDataUrl) {
    const drawings = this.get(this.KEYS.DRAWINGS);
    const idx = drawings.findIndex(d => d.spaceId === spaceId);
    const drawingObj = {
      spaceId,
      drawingDataUrl,
      senderId,
      timestamp: new Date().toISOString()
    };
    if (idx > -1) {
      drawings[idx] = drawingObj;
    } else {
      drawings.push(drawingObj);
    }
    this.set(this.KEYS.DRAWINGS, drawings);

    const users = this.get(this.KEYS.USERS);
    const user = users.find(u => u.id === senderId);

    this.addMemory(spaceId, "photo", `Canvas artwork shared by ${user ? user.name : 'partner'}`, "Shared on the Draw Together board", drawingDataUrl);
    return drawingObj;
  },

  // Date Planner
  getDatePlans(spaceId) {
    return this.get(this.KEYS.DATE_PLANS).filter(d => d.spaceId === spaceId);
  },

  addDatePlan(spaceId, title, dateTime, location, description) {
    const dates = this.get(this.KEYS.DATE_PLANS);
    const newDate = {
      id: "d_" + Math.random().toString(36).substr(2, 9),
      spaceId,
      title,
      dateTime,
      location,
      description,
      bucketList: [
        { id: 1, text: "Take photos together", done: false },
        { id: 2, text: "Try a new food or drink", done: false },
        { id: 3, text: "Share a deep conversation", done: false }
      ]
    };
    dates.push(newDate);
    this.set(this.KEYS.DATE_PLANS, dates);

    this.addMemory(spaceId, "milestone", `Plan a Date: ${title}`, `Scheduled for ${new Date(dateTime).toLocaleDateString()} at ${location}`);
    return newDate;
  },

  toggleDateBucketItem(spaceId, dateId, itemId) {
    const dates = this.get(this.KEYS.DATE_PLANS);
    const date = dates.find(d => d.id === dateId && d.spaceId === spaceId);
    if (date) {
      const item = date.bucketList.find(i => i.id === itemId);
      if (item) {
        item.done = !item.done;
        this.set(this.KEYS.DATE_PLANS, dates);
      }
    }
  },

  deleteDatePlan(spaceId, dateId) {
    const dates = this.get(this.KEYS.DATE_PLANS);
    const filtered = dates.filter(d => !(d.id === dateId && d.spaceId === spaceId));
    this.set(this.KEYS.DATE_PLANS, filtered);
  },

  // Heart Touch Ping
  getTouchPings(spaceId) {
    return this.get(this.KEYS.TOUCH_PINGS).filter(p => p.spaceId === spaceId);
  },

  sendTouchPing(spaceId, senderId, senderName) {
    const pings = this.get(this.KEYS.TOUCH_PINGS);
    const newPing = {
      spaceId,
      senderId,
      senderName,
      timestamp: new Date().toISOString()
    };
    pings.push(newPing);
    this.set(this.KEYS.TOUCH_PINGS, pings);

    this.addMemory(spaceId, "milestone", `Heart touch sent by ${senderName}`, "Sent a glowing tap through our private sanctuary.");
    return newPing;
  },

  // Private Partner Diary
  getDiaryEntries(spaceId, userId) {
    return this.get(this.KEYS.DIARY).filter(d => d.spaceId === spaceId && d.userId === userId);
  },

  addDiaryEntry(spaceId, userId, title, content, category, date, imageUrl) {
    const entries = this.get(this.KEYS.DIARY);
    const newEntry = {
      id: "diary_" + Math.random().toString(36).substr(2, 9),
      spaceId,
      userId,
      title,
      content,
      category,
      date: date || new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString()
    };
    entries.push(newEntry);
    this.set(this.KEYS.DIARY, entries);
    return newEntry;
  },

  deleteDiaryEntry(spaceId, userId, entryId) {
    const entries = this.get(this.KEYS.DIARY);
    const filtered = entries.filter(d => !(d.id === entryId && d.spaceId === spaceId && d.userId === userId));
    this.set(this.KEYS.DIARY, filtered);
  },

  // Couples Game Scoreboard
  getGameScores(spaceId) {
    let scores = this.get(this.KEYS.GAME_SCORES);
    if (!scores || scores.length === 0) {
      scores = [
        { gameId: "link_four", name: "Link Four", icon: "grid_on", color: "#E58B58", userScore: 0, partnerScore: 0, draws: 0 },
        { gameId: "word_duel", name: "Word Duel", icon: "translate", color: "#6C8EEF", userScore: 0, partnerScore: 0, draws: 0 },
        { gameId: "spotted", name: "Spotted", icon: "visibility", color: "#A78BFA", userScore: 0, partnerScore: 0, draws: 0 },
        { gameId: "memory", name: "Memory Match", icon: "psychology", color: "#34D399", userScore: 0, partnerScore: 0, draws: 0 }
      ];
      this.set(this.KEYS.GAME_SCORES, scores);
    }
    return scores;
  },

  updateGameScore(spaceId, gameId, type) {
    const scores = this.getGameScores(spaceId);
    const updated = scores.map(game => {
      if (game.gameId === gameId) {
        if (type === 'user') {
          return { ...game, userScore: game.userScore + 1 };
        } else if (type === 'partner') {
          return { ...game, partnerScore: game.partnerScore + 1 };
        } else if (type === 'draw') {
          return { ...game, draws: game.draws + 1 };
        }
      }
      return game;
    });
    this.set(this.KEYS.GAME_SCORES, updated);
    return updated;
  },

  resetGameScores(spaceId) {
    const reset = [
      { gameId: "link_four", name: "Link Four", icon: "grid_on", color: "#E58B58", userScore: 0, partnerScore: 0, draws: 0 },
      { gameId: "word_duel", name: "Word Duel", icon: "translate", color: "#6C8EEF", userScore: 0, partnerScore: 0, draws: 0 },
      { gameId: "spotted", name: "Spotted", icon: "visibility", color: "#A78BFA", userScore: 0, partnerScore: 0, draws: 0 },
      { gameId: "memory", name: "Memory Match", icon: "psychology", color: "#34D399", userScore: 0, partnerScore: 0, draws: 0 }
    ];
    this.set(this.KEYS.GAME_SCORES, reset);
    return reset;
  }
};
