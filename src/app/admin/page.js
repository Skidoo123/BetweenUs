"use client";

import { useState, useEffect } from "react";
import { DB } from "@/lib/db";
import { DEFAULT_CHALLENGES } from "@/lib/data";
import ShaderBackground from "@/components/ShaderBackground";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [systemLogs, setSystemLogs] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Data State
  const [users, setUsers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Search/Filters
  const [searchUsers, setSearchUsers] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Question Form
  const [qText, setQText] = useState("");
  const [qCategory, setQCategory] = useState("Understanding");
  const [qMode, setQMode] = useState("all");

  // Simulator
  const [simSpaceId, setSimSpaceId] = useState("");
  const [simPartnerId, setSimPartnerId] = useState(null);
  const [simPartnerName, setSimPartnerName] = useState("");
  const [simPartnerAvatarColor, setSimPartnerAvatarColor] = useState("");
  const [simIsPending, setSimIsPending] = useState(false);
  const [simPartnerProfile, setSimPartnerProfile] = useState(null);

  // Initialize and load
  useEffect(() => {
    DB.init();
    loadAdminData();
    logEvent("Admin dashboard loaded. Connected to mock database tables.");
    setIsMounted(true);

    // Sync storage events
    const handleStorageChange = (e) => {
      if (Object.values(DB.KEYS).includes(e.key)) {
        loadAdminData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update simulator info when space changes or database updates
  useEffect(() => {
    if (simSpaceId) {
      loadSimulatorPartnerInfo(simSpaceId);
    } else if (spaces.length > 0) {
      setSimSpaceId(spaces[0].id);
      loadSimulatorPartnerInfo(spaces[0].id);
    } else {
      setSimPartnerId(null);
    }
  }, [simSpaceId, spaces]);

  const loadAdminData = () => {
    const loadedUsers = DB.get(DB.KEYS.USERS);
    const loadedSpaces = DB.get(DB.KEYS.SPACES);
    const loadedQuestions = DB.getAllQuestions();

    setUsers(loadedUsers);
    setSpaces(loadedSpaces);
    setQuestions(loadedQuestions);
  };

  const logEvent = (message) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs((prev) => [...prev, { time, text: message }]);
  };

  const loadSimulatorPartnerInfo = (spaceId) => {
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) return;

    const activeUserId = localStorage.getItem(DB.KEYS.ACTIVE_USER);
    const usersList = DB.get(DB.KEYS.USERS);

    let partnerId = null;
    let partnerName = "";
    let partnerColor = "";
    
    if (activeUserId === space.creatorId) {
      partnerId = space.partnerId;
      const partner = usersList.find((u) => u.id === space.partnerId);
      partnerName = partner ? partner.name : "Partner (Pending)";
      partnerColor = partner ? partner.avatarColor : "#70585b";
    } else {
      partnerId = space.creatorId;
      const creator = usersList.find((u) => u.id === space.creatorId);
      partnerName = creator ? creator.name : "Creator";
      partnerColor = creator ? creator.avatarColor : "#ff5a79";
    }

    setSimPartnerId(partnerId);
    setSimPartnerName(partnerName);
    setSimPartnerAvatarColor(partnerColor);
    setSimIsPending(!partnerId);

    const partnerProfile = usersList.find((u) => u.id === partnerId);
    setSimPartnerProfile(partnerProfile || null);
  };

  // ACTIONS: IMPERSONATION & USER DELETE
  const handleImpersonate = (userId) => {
    localStorage.setItem(DB.KEYS.ACTIVE_USER, userId);
    logEvent(`Impersonated user ID: ${userId}. Redirecting...`);
    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  const handleDeleteUser = (userId, userName) => {
    if (confirm(`CRITICAL: Disband space connections and delete user profile: "${userName}"?`)) {
      DB.deleteUser(userId);
      loadAdminData();
      logEvent(`Deleted user profile: ${userName} (${userId})`);
    }
  };

  // ACTIONS: SPACES
  const handleDisbandSpace = (spaceId, spaceCode) => {
    if (confirm(`Disband relationship space ID ${spaceId}? Both connected users will revert to single space setup.`)) {
      DB.deleteSpace(spaceId);
      loadAdminData();
      logEvent(`Disbanded Relationship Space ID: ${spaceId} (Invite Code: ${spaceCode})`);
    }
  };

  const handleAdjustStreak = (spaceId, spaceName, currentStreak) => {
    const newStreak = prompt(`Enter new daily streak count for Space "${spaceName}":`, currentStreak);
    if (newStreak !== null) {
      DB.adjustStreak(spaceId, newStreak);
      loadAdminData();
      logEvent(`Adjusted streak of Space (${spaceName}): ${currentStreak} days → ${newStreak} days`);
    }
  };

  // ACTIONS: QUESTIONS
  const handleAddQuestion = () => {
    if (!qText.trim()) return alert("Enter question text");
    const modes = qMode === "all"
      ? ["couple", "marriage", "long_distance", "friends", "family", "custom"]
      : [qMode];

    DB.addCustomQuestion(qText.trim(), qCategory, modes);
    setQText("");
    loadAdminData();
    logEvent(`Published custom question: "${qText.trim()}" [Category: ${qCategory}]`);
  };

  const handleDeleteQuestion = (questionId, text) => {
    if (confirm(`Remove custom question: "${text}" from pool?`)) {
      DB.deleteCustomQuestion(questionId);
      loadAdminData();
      logEvent(`Deleted custom question ID: ${questionId}`);
    }
  };

  // ACTIONS: SIMULATOR
  const triggerSimulatedChat = () => {
    if (!simSpaceId || !simPartnerId) return;
    const simulatedTexts = [
      "Hey! Just looking at our memory stream. It is so cute!",
      "I love answering the questions of the day with you.",
      "Hope you are having a beautiful afternoon!",
      "Can we plan that weekend trip we talked about?",
      "Sending you a warm hug through the space!"
    ];
    const text = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
    DB.sendChatMessage(simSpaceId, simPartnerId, text);
    logEvent(`[Simulator] Message sent to Space ${simSpaceId} by partner ${simPartnerId}: "${text}"`);
    alert(`Message simulated from partner: "${text}"`);
  };

  const triggerSimulatedAnswer = () => {
    if (!simSpaceId || !simPartnerId) return;
    const space = spaces.find((s) => s.id === simSpaceId);
    if (!space) return;

    const dailyQuestions = questions.filter((q) => q.modes.includes(space.relationshipMode));
    const dayIndex = space.streakDays % (dailyQuestions.length || 1);
    const question = dailyQuestions[dayIndex] || dailyQuestions[0];

    if (!question) return alert("Could not resolve current question pool.");

    // Check if partner already answered
    const answers = DB.get(DB.KEYS.ANSWERS);
    const answerObj = answers.find((a) => a.spaceId === simSpaceId && a.questionId === question.id);
    if (answerObj && answerObj.answers[simPartnerId]) {
      return alert("Partner has already answered today's question!");
    }

    const simulatedAnswers = [
      "I love when we read books together in the evening.",
      "Definitely the home-cooked pizza night we had.",
      "Hearing you laugh at my silly jokes makes my day.",
      "You are such a caring person, I appreciate you so much.",
      "Cooking brunch together on Sundays!"
    ];
    const answerText = simulatedAnswers[Math.floor(Math.random() * simulatedAnswers.length)];

    DB.submitAnswer(simSpaceId, simPartnerId, question.id, answerText);
    loadAdminData();
    logEvent(`[Simulator] Submitted daily question answer for partner ${simPartnerId}`);
    alert(`Partner answered today's question: "${answerText}"`);
  };

  const triggerSimulatedMood = () => {
    if (!simPartnerId) return;
    const moods = [
      { emoji: "😊", label: "Great" },
      { emoji: "🙂", label: "Good" },
      { emoji: "😐", label: "Okay" },
      { emoji: "😔", label: "Not Great" },
      { emoji: "😢", label: "Difficult" }
    ];
    const mood = moods[Math.floor(Math.random() * moods.length)];

    DB.updateMood(simPartnerId, mood.emoji, mood.label);
    loadAdminData();
    logEvent(`[Simulator] Updated mood of partner ${simPartnerId} to ${mood.emoji} (${mood.label})`);
    alert(`Partner updated mood to ${mood.emoji} (${mood.label})`);
  };

  const triggerSimulatedChallenge = () => {
    if (!simSpaceId || !simPartnerId) return;
    const randomChallenge = DEFAULT_CHALLENGES[Math.floor(Math.random() * DEFAULT_CHALLENGES.length)];

    // Check if partner already completed
    const comps = DB.get(DB.KEYS.CHALLENGES);
    const compObj = comps.find((c) => c.spaceId === simSpaceId && c.challengeId === randomChallenge.id);
    if (compObj && compObj.completions[simPartnerId]) {
      return alert(`Partner already completed challenge: "${randomChallenge.text}"`);
    }

    DB.completeChallenge(simSpaceId, simPartnerId, randomChallenge.id);
    loadAdminData();
    logEvent(`[Simulator] Logged challenge completion for partner ${simPartnerId}: "${randomChallenge.text}"`);
    alert(`Partner completed daily challenge: "${randomChallenge.text}"`);
  };

  // ACTIONS: MAINTENANCE
  const handleResetDB = () => {
    if (confirm("WARNING: This will delete ALL users, spaces, chats, answers, and memories, resetting to the default seeded Bob & Alice. Proceed?")) {
      DB.resetDatabase();
      loadAdminData();
      logEvent("Mock database reset to default seeds.");
      alert("Database reset completed successfully.");
    }
  };

  const handleClearChats = () => {
    if (confirm("Are you sure you want to clear chat histories from all spaces?")) {
      DB.clearChats();
      loadAdminData();
      logEvent("Wiped chat histories globally.");
      alert("Chat histories cleared.");
    }
  };

  const handleClearCustomQuestions = () => {
    if (confirm("Are you sure you want to delete all custom added questions?")) {
      DB.clearCustomQuestions();
      loadAdminData();
      logEvent("Wiped custom questions pool.");
      alert("Custom questions wiped.");
    }
  };

  // METRICS CALCULATIONS FOR OVERVIEW
  const coupleSpaces = spaces.filter((s) => s.relationshipMode === "couple" || s.relationshipMode === "marriage").length;
  const ldSpaces = spaces.filter((s) => s.relationshipMode === "long_distance").length;
  const friendSpaces = spaces.filter((s) => s.relationshipMode === "friends" || s.relationshipMode === "family").length;

  const totalSpacesCount = spaces.length || 1;
  const couplePct = Math.round((coupleSpaces / totalSpacesCount) * 100);
  const ldPct = Math.round((ldSpaces / totalSpacesCount) * 100);
  const friendPct = Math.round((friendSpaces / totalSpacesCount) * 100);

  const topStreakVal = spaces.reduce((max, s) => (s.streakDays > max ? s.streakDays : max), 0);

  if (!isMounted) {
    return <div className="text-on-surface bg-background min-h-screen"></div>;
  }

  return (
    <div className="text-on-surface font-body-md min-h-screen antialiased overflow-x-hidden relative">
      <ShaderBackground />

      <div id="app-container" className="relative z-10 flex">
        {/* Admin Sidebar */}
        <aside className="sidebar bg-white/15 dark:bg-inverse-surface/10 backdrop-blur-lg border-r border-white/20 shadow-sm py-8 px-4 z-50 transition-all duration-300">
          <div className="mb-10 px-4 flex flex-col gap-1">
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold drop-shadow-sm flex items-center gap-2">
              <svg className="logo-heart heart-pulse" style={{ width: "24px", height: "24px", fill: "var(--primary)" }} viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              BetweenUs
            </h1>
            <p className="font-caption text-caption text-primary font-semibold tracking-widest uppercase">Admin Control</p>
          </div>

          <nav className="flex-1 space-y-2">
            <a href="#" className={`admin-tab nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all duration-200 ${activeTab === "overview" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }}>
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
              <span className="font-label-md text-label-md">Overview</span>
            </a>
            <a href="#" className={`admin-tab nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all duration-200 ${activeTab === "users" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("users"); }}>
              <span className="material-symbols-outlined text-[22px]">group</span>
              <span className="font-label-md text-label-md">Users Directory</span>
            </a>
            <a href="#" className={`admin-tab nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all duration-200 ${activeTab === "spaces" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("spaces"); }}>
              <span className="material-symbols-outlined text-[22px]">hub</span>
              <span className="font-label-md text-label-md">Active Spaces</span>
            </a>
            <a href="#" className={`admin-tab nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all duration-200 ${activeTab === "questions" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("questions"); }}>
              <span className="material-symbols-outlined text-[22px]">quiz</span>
              <span className="font-label-md text-label-md">Question Pool</span>
            </a>
            <a href="#" className={`admin-tab nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all duration-200 ${activeTab === "simulator" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("simulator"); }}>
              <span className="material-symbols-outlined text-[22px]">terminal</span>
              <span className="font-label-md text-label-md">Multi-User Simulator</span>
            </a>
          </nav>

          <div className="pt-6 border-t border-white/20 mt-6">
            <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold hover:bg-primary-container/20 transition-all duration-200">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-label-md text-label-md">Back to App</span>
            </a>
          </div>
        </aside>

        {/* Main Dashboard Area */}
        <main className="main-content flex-1 min-h-screen p-8 md:p-12 overflow-y-auto">
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <section className="view-panel active-panel">
              <div>
                <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Admin Dashboard Overview</h2>
                <p className="text-on-surface-variant">Instant metrics and health stats of your relationship private sanctuary network.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card stat-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">group</span>
                  </div>
                  <div>
                    <p className="text-caption font-label-md uppercase text-on-surface-variant">Total Users</p>
                    <h3 className="text-3xl font-extrabold text-primary">{users.length}</h3>
                  </div>
                </div>
                <div className="glass-card stat-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container/55 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-2xl">hub</span>
                  </div>
                  <div>
                    <p className="text-caption font-label-md uppercase text-on-surface-variant">Active Spaces</p>
                    <h3 className="text-3xl font-extrabold text-on-surface">{spaces.length}</h3>
                  </div>
                </div>
                <div className="glass-card stat-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined text-2xl">local_fire_department</span>
                  </div>
                  <div>
                    <p className="text-caption font-label-md uppercase text-on-surface-variant">Top Streak</p>
                    <h3 className="text-3xl font-extrabold text-amber-600">🔥 {topStreakVal}</h3>
                  </div>
                </div>
                <div className="glass-card stat-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-2xl">quiz</span>
                  </div>
                  <div>
                    <p className="text-caption font-label-md uppercase text-on-surface-variant">Questions Pool</p>
                    <h3 className="text-3xl font-extrabold text-primary">{questions.length}</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Event Log */}
                <div className="glass-card p-6 flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    System Event Log
                  </h3>
                  <div className="flex-1 min-h-[250px] bg-black/10 rounded-xl p-4 font-mono text-sm overflow-y-auto max-h-[300px] text-on-surface">
                    {systemLogs.map((log, idx) => (
                      <div key={idx} className="text-on-surface-variant mb-1 border-b border-white/5 pb-1 last:border-0">
                        <span className="text-primary font-bold">[{log.time}]</span> {log.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="glass-card p-6 flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">pie_chart</span>
                    Relationship Mode Breakdown
                  </h3>
                  <div className="flex-1 flex flex-col justify-center gap-4 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>💕 Couples (couple/marriage)</span>
                        <span>{coupleSpaces} ({couplePct}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${couplePct}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>🌍 Long Distance (long_distance)</span>
                        <span>{ldSpaces} ({ldPct}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${ldPct}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>🫂 Friends & Family (friends/family)</span>
                        <span>{friendSpaces} ({friendPct}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${friendPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB: USERS DIRECTORY */}
          {activeTab === "users" && (
            <section className="view-panel active-panel">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Registered Users Directory</h2>
                  <p className="text-on-surface-variant">View and manage profiles, space links, and active moods.</p>
                </div>
                <div className="w-full sm:w-72 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70">search</span>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-2 bg-white/30 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-on-surface-variant" 
                    placeholder="Search name or email..." 
                    value={searchUsers} 
                    onChange={(e) => setSearchUsers(e.target.value)} 
                  />
                </div>
              </div>

              <div className="glass-card p-0 overflow-hidden">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr className="bg-white/10">
                        <th>User ID</th>
                        <th>Profile Name</th>
                        <th>Email Address</th>
                        <th>Space ID</th>
                        <th>Current Mood</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((u) => 
                          u.name.toLowerCase().includes(searchUsers.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchUsers.toLowerCase())
                        )
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-white/5 border-b border-white/10">
                            <td className="font-mono text-xs text-on-surface-variant">{u.id}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold text-white" style={{ background: u.avatarColor }}>
                                  {u.name[0].toUpperCase()}
                                </span>
                                <strong className="font-semibold">{u.name}</strong>
                              </div>
                            </td>
                            <td className="text-sm">{u.email}</td>
                            <td>
                              {u.currentSpaceId ? (
                                <code className="bg-white/10 px-2 py-1 rounded text-xs">{u.currentSpaceId}</code>
                              ) : (
                                <span className="text-on-surface-variant/40">Unlinked</span>
                              )}
                            </td>
                            <td>
                              {u.mood ? (
                                <span className="flex items-center gap-1">
                                  {u.mood} <span className="text-xs text-on-surface-variant">({u.moodLabel || "Okay"})</span>
                                </span>
                              ) : (
                                <span className="text-on-surface-variant/40">😐 None</span>
                              )}
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button className="bg-primary/25 border border-primary/40 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold" onClick={() => handleImpersonate(u.id)}>Impersonate</button>
                                <button className="border border-red-500/30 text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-semibold" onClick={() => handleDeleteUser(u.id, u.name)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: ACTIVE SPACES */}
          {activeTab === "spaces" && (
            <section className="view-panel active-panel">
              <div>
                <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Active Relationship Spaces</h2>
                <p className="text-on-surface-variant">Manage connections, adjust connection streaks, and audit joint spaces.</p>
              </div>

              <div className="glass-card p-0 overflow-hidden">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr className="bg-white/10">
                        <th>Space ID</th>
                        <th>Invite Code</th>
                        <th>Space Name</th>
                        <th>Linked Profiles</th>
                        <th>Streak</th>
                        <th>Rel. Mode</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spaces.map((s) => {
                        const creator = users.find((u) => u.id === s.creatorId);
                        const partner = users.find((u) => u.id === s.partnerId);
                        
                        return (
                          <tr key={s.id} className="hover:bg-white/5 border-b border-white/10">
                            <td className="font-mono text-xs text-on-surface-variant">{s.id}</td>
                            <td><strong className="text-primary font-mono text-sm tracking-wider">{s.code}</strong></td>
                            <td className="font-semibold text-sm">{s.name}</td>
                            <td className="text-xs space-y-0.5">
                              <div><span className="text-primary font-semibold">Creator:</span> {creator ? `${creator.name} (${creator.id})` : s.creatorId}</div>
                              <div><span className="text-secondary font-semibold">Partner:</span> {partner ? `${partner.name} (${partner.id})` : <span className="text-on-surface-variant/40">Waiting</span>}</div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">🔥 {s.streakDays}</span>
                                <button className="border border-white/40 hover:border-primary text-xs px-2 py-0.5 rounded" onClick={() => handleAdjustStreak(s.id, s.name, s.streakDays)}>Set</button>
                              </div>
                            </td>
                            <td>
                              <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full">{s.relationshipMode.replace("_", " ")}</span>
                            </td>
                            <td>
                              <button className="border border-red-500/30 text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-semibold" onClick={() => handleDisbandSpace(s.id, s.code)}>Disband</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: QUESTIONS POOL */}
          {activeTab === "questions" && (
            <section className="view-panel active-panel">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="glass-card flex flex-col gap-4 lg:col-span-1 h-fit">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Custom Question
                  </h3>
                  
                  <div className="modal-form">
                    <div className="input-group">
                      <label className="input-label">Question Content</label>
                      <textarea className="input-field text-sm" placeholder="e.g. What is a secret hobby you want us to try?" rows="3" value={qText} onChange={(e) => setQText(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Category</label>
                      <select className="select-field text-sm py-2 px-3" value={qCategory} onChange={(e) => setQCategory(e.target.value)}>
                        <option value="Understanding">Understanding</option>
                        <option value="Communication">Communication</option>
                        <option value="Appreciation">Appreciation</option>
                        <option value="Quality Time">Quality Time</option>
                        <option value="Emotional Connection">Emotional Connection</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Modes Association</label>
                      <select className="select-field text-sm py-2 px-3" value={qMode} onChange={(e) => setQMode(e.target.value)}>
                        <option value="all">All Modes</option>
                        <option value="couple">💕 Couples Only</option>
                        <option value="long_distance">🌍 Long Distance Only</option>
                        <option value="friends">🫂 Friends Only</option>
                      </select>
                    </div>
                    <button className="btn btn-primary w-full py-3" onClick={handleAddQuestion}>Publish to Pool</button>
                  </div>
                </div>

                {/* Pool Table */}
                <div className="glass-card p-6 lg:col-span-2 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Daily Question Pool</h3>
                    <select className="bg-white/30 border border-white/50 text-xs px-3 py-1.5 rounded-lg focus:outline-none text-on-surface" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                      <option value="all">All Categories</option>
                      <option value="Understanding">Understanding</option>
                      <option value="Communication">Communication</option>
                      <option value="Appreciation">Appreciation</option>
                      <option value="Quality Time">Quality Time</option>
                      <option value="Emotional Connection">Emotional Connection</option>
                    </select>
                  </div>

                  <div className="admin-table-container flex-1">
                    <table className="admin-table">
                      <thead>
                        <tr className="bg-white/10">
                          <th className="w-16">ID</th>
                          <th>Question Content</th>
                          <th className="w-32">Category</th>
                          <th className="w-24 text-center">Source</th>
                          <th className="w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions
                          .filter((q) => filterCategory === "all" || q.category === filterCategory)
                          .map((q) => {
                            const isCustom = q.id.startsWith("q_custom_");
                            return (
                              <tr key={q.id} className="hover:bg-white/5 border-b border-white/10">
                                <td className="font-mono text-xs text-on-surface-variant">{q.id}</td>
                                <td className="text-sm font-medium pr-4">{q.text}</td>
                                <td><span className="text-xs font-bold text-primary">{q.category}</span></td>
                                <td className="text-center">
                                  {isCustom ? (
                                    <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Custom</span>
                                  ) : (
                                    <span className="bg-slate-500/10 text-on-surface-variant border border-white/20 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase">System</span>
                                  )}
                                </td>
                                <td>
                                  {isCustom ? (
                                    <button className="border border-red-500/30 text-red-500 hover:bg-red-500/10 px-2.5 py-1 rounded text-xs font-semibold" onClick={() => handleDeleteQuestion(q.id, q.text)}>Delete</button>
                                  ) : (
                                    <span className="text-xs text-on-surface-variant/40">- Locked -</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB: SIMULATOR */}
          {activeTab === "simulator" && (
            <section className="view-panel active-panel">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Simulator Card */}
                <div className="glass-card flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined">terminal</span>
                      Multi-User Simulator Controls
                    </h3>
                    <p className="text-sm text-on-surface-variant">Trigger actions from the perspective of secondary partners to test streaks, chat logs, and milestones.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="input-group">
                      <label className="input-label">Select Active Workspace Space</label>
                      <select className="select-field" value={simSpaceId} onChange={(e) => setSimSpaceId(e.target.value)}>
                        {spaces.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 bg-white/15 rounded-xl border border-white/20 text-sm space-y-2">
                      {simIsPending ? (
                        <div>
                          <p className="text-yellow-600 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined">warning</span> Space is Pending Connection
                          </p>
                          <p className="text-xs mt-1 text-on-surface-variant">Connect a second user to test simulator actions.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white" style={{ background: simPartnerAvatarColor }}>
                              {simPartnerName[0]?.toUpperCase()}
                            </span>
                            Simulating Partner: {simPartnerName} ({simPartnerId})
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">Actions below run on behalf of {simPartnerName} to instantly complete daily objectives.</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button className="btn btn-secondary py-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed" onClick={triggerSimulatedChat} disabled={simIsPending}>
                        Simulate Partner Chat
                      </button>
                      <button className="btn btn-secondary py-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed" onClick={triggerSimulatedAnswer} disabled={simIsPending}>
                        Answer Today's Q
                      </button>
                      <button className="btn btn-glass py-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed" onClick={triggerSimulatedMood} disabled={simIsPending}>
                        Randomize Mood
                      </button>
                      <button className="btn btn-glass py-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed" onClick={triggerSimulatedChallenge} disabled={simIsPending}>
                        Complete Challenge
                      </button>
                    </div>
                  </div>
                </div>

                {/* Maintenance Card */}
                <div className="glass-card flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined">settings_backup_restore</span>
                      Database & System Maintenance
                    </h3>
                    <p className="text-sm text-on-surface-variant">Perform global database maintenance, resets, and seed verification operations.</p>
                  </div>

                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-800 rounded-xl text-sm flex gap-3">
                      <span className="material-symbols-outlined text-red-600">warning</span>
                      <div>
                        <strong class="block">Danger Zone</strong>
                        These settings directly modify the localStorage tables shared by all open instances. Data deleted here cannot be recovered.
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button className="btn btn-glass w-full border-red-500/30 text-red-600 hover:bg-red-500/10 py-3 font-semibold" onClick={handleResetDB}>
                        Reset Mock Database to Default Seeds
                      </button>
                      <button className="btn btn-glass w-full py-3 font-semibold" onClick={handleClearChats}>
                        Clear Chat Histories (All Spaces)
                      </button>
                      <button className="btn btn-glass w-full py-3 font-semibold" onClick={handleClearCustomQuestions}>
                        Wipe Custom Questions Pool
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
