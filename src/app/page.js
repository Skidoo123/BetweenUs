"use client";

import { useState, useEffect, useRef } from "react";
import { DB } from "@/lib/db";
import { DEFAULT_DISCOVER } from "@/lib/data";
import ShaderBackground from "@/components/ShaderBackground";

export default function ClientPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [partnerUser, setPartnerUser] = useState(null);
  const [currentView, setCurrentView] = useState("landing");
  const [isMounted, setIsMounted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigateTo = (view) => {
    setCurrentView(view);
    setMobileSidebarOpen(false);
  };
  
  // Modals state
  const [authModal, setAuthModal] = useState(null); // 'signup' | 'signin' | null
  const [activeArticle, setActiveArticle] = useState(null);
  const [activeImagePreview, setActiveImagePreview] = useState(null);

  // Form states
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const [onboardCode, setOnboardCode] = useState("");
  const [onboardMode, setOnboardMode] = useState("couple");

  // Profile Edit
  const [profileName, setProfileName] = useState("");

  // Chat states
  const [chatMessage, setChatMessage] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const chatImageInputRef = useRef(null);

  // Daily Question state
  const [dailyAnswerInput, setDailyAnswerInput] = useState("");

  // Memory creation sidebar state
  const [memoryTitleInput, setMemoryTitleInput] = useState("");
  const [memoryDetailsInput, setMemoryDetailsInput] = useState("");
  const [memoryImage, setMemoryImage] = useState(null);

  // Dev toolbar state
  const [devToolbarCollapsed, setDevToolbarCollapsed] = useState(true);

  // Load state on mount
  useEffect(() => {
    DB.init();
    loadState();
    setIsMounted(true);

    // Event listener for tab sync
    const handleStorageChange = (e) => {
      if (Object.values(DB.KEYS).includes(e.key)) {
        loadState();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (currentView === "chat") {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentView]);

  const loadState = () => {
    const activeUserId = localStorage.getItem(DB.KEYS.ACTIVE_USER);
    const users = DB.get(DB.KEYS.USERS);
    const spaces = DB.get(DB.KEYS.SPACES);

    if (activeUserId) {
      const user = users.find((u) => u.id === activeUserId);
      if (user) {
        setCurrentUser(user);
        setProfileName(user.name);

        if (user.currentSpaceId) {
          const space = spaces.find((s) => s.id === user.currentSpaceId);
          if (space) {
            setCurrentSpace(space);
            const partnerId = space.creatorId === user.id ? space.partnerId : space.creatorId;
            const partner = users.find((p) => p.id === partnerId);
            setPartnerUser(partner || null);
          } else {
            setCurrentSpace(null);
            setPartnerUser(null);
          }
        } else {
          setCurrentSpace(null);
          setPartnerUser(null);
        }
      } else {
        clearUserState();
      }
    } else {
      clearUserState();
    }
  };

  const clearUserState = () => {
    setCurrentUser(null);
    setCurrentSpace(null);
    setPartnerUser(null);
    setCurrentView("landing");
  };

  // AUTH ACTIONS
  const handleAuthSubmit = () => {
    if (!authEmail || !authPassword) return alert("Fill in required fields.");

    try {
      if (authModal === "signup") {
        if (!authName) return alert("Please enter your name");
        const colors = ["#ff5a79", "#8a4fff", "#4dbcff", "#00e676", "#ffb800"];
        const col = colors[Math.floor(Math.random() * colors.length)];
        const user = DB.register(authEmail, authPassword, authName, col);
        localStorage.setItem(DB.KEYS.ACTIVE_USER, user.id);
      } else {
        DB.login(authEmail, authPassword);
      }

      setAuthModal(null);
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
      loadState();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(DB.KEYS.ACTIVE_USER);
    clearUserState();
  };

  // ONBOARDING ACTIONS
  const handleCreateSpace = () => {
    if (!currentUser) return;
    DB.createSpace(currentUser.id, onboardMode);
    loadState();
  };

  const handleJoinSpace = () => {
    if (!currentUser || !onboardCode.trim()) return alert("Enter code");
    try {
      DB.joinSpace(currentUser.id, onboardCode.trim());
      loadState();
    } catch (e) {
      alert(e.message);
    }
  };

  // MOOD CHECK-IN
  const handleMoodSelect = (mood, label) => {
    if (!currentUser) return;
    DB.updateMood(currentUser.id, mood, label);
    loadState();
  };

  // DAILY QUESTIONS ACTIONS
  const handleAnswerSubmit = (qId) => {
    if (!currentSpace || !currentUser || !dailyAnswerInput.trim()) return;
    DB.submitAnswer(currentSpace.id, currentUser.id, qId, dailyAnswerInput.trim());
    setDailyAnswerInput("");
    loadState();
  };

  // CHALLENGE CHECKBOX CLICK
  const handleChallengeToggle = (challengeId, isCompleted) => {
    if (!currentSpace || !currentUser || isCompleted) return;
    DB.completeChallenge(currentSpace.id, currentUser.id, challengeId);
    loadState();
  };

  // CHAT ACTIONS
  const handleSendChat = () => {
    if (!currentSpace || !currentUser || !chatMessage.trim()) return;
    DB.sendChatMessage(currentSpace.id, currentUser.id, chatMessage.trim());
    setChatMessage("");
    loadState();
  };

  const handleChatImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !currentSpace || !currentUser) return;
    const reader = new FileReader();
    reader.onload = () => {
      DB.sendChatMessage(currentSpace.id, currentUser.id, "Shared an image 📷", reader.result);
      loadState();
    };
    reader.readAsDataURL(file);
  };

  const handleAutoAwesomePrompt = () => {
    const prompts = [
      "I'm thinking about the time we laughed so hard at...",
      "What is your favorite memory of us from last month?",
      "Sending you a warm reminder that I appreciate you! ❤️",
      "Let's plan a cozy date night this weekend.",
      "Thinking of you today! Here is a little virtual hug."
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setChatMessage(randomPrompt);
  };

  const simulatePartnerVoiceNote = () => {
    if (!currentSpace || !partnerUser) return;
    setIsPartnerTyping(true);
    setTimeout(() => {
      DB.sendChatMessage(currentSpace.id, partnerUser.id, "🎙️ Shared a voice note (24s)");
      loadState();
      setIsPartnerTyping(false);
    }, 1500);
  };

  const simulatePartnerPhotoShare = () => {
    if (!currentSpace || !partnerUser) return;
    setIsPartnerTyping(true);
    setTimeout(() => {
      const samplePhotos = [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5hiH3okLASpqpWNGuPlTr35nuTff96MbkO1hJ4mbkjJ_x6P_rYdBrVWd_JfVWpCaf5Jr8y_2wCWrRxQyYpeg1pMQl71PSCGATbjLYCNzP1ZlXGEon6m9oNV150bakNrWaniRjZuOtEkY5F453vEEpzjYNRCgCJdkudMqc7mok54aEdHSb_62qv-9PxfRaYFL8U4QY-Bwc-FIrE38IXsZGdMdvc5xTNgb6t1jGOCh79jCI6CHDidF",
      ];
      DB.sendChatMessage(currentSpace.id, partnerUser.id, "Wish you were here for this one ☕", samplePhotos[0]);
      loadState();
      setIsPartnerTyping(false);
    }, 1500);
  };

  // MEMORIES ACTIONS
  const handleSaveMemory = () => {
    if (!currentSpace || !memoryTitleInput.trim() || !memoryDetailsInput.trim()) {
      return alert("Title and Details are required to capture a memory!");
    }
    DB.addMemory(currentSpace.id, memoryImage ? "photo" : "milestone", memoryTitleInput.trim(), memoryDetailsInput.trim(), memoryImage);
    setMemoryTitleInput("");
    setMemoryDetailsInput("");
    setMemoryImage(null);
    loadState();
    setCurrentView("memories");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMemoryImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // SETTINGS PROFILE ACTIONS
  const handleProfileSave = () => {
    if (!profileName.trim()) return alert("Name cannot be empty");
    const users = DB.get(DB.KEYS.USERS);
    const u = users.find((x) => x.id === currentUser.id);
    if (u) {
      u.name = profileName.trim();
      DB.set(DB.KEYS.USERS, users);
      loadState();
      alert("Profile saved!");
    }
  };

  const handleLeaveSpace = () => {
    if (!currentSpace || !currentUser) return;
    if (confirm("Are you sure you want to delete and leave this shared connection space? All chat messages and daily streaks will be cleared.")) {
      DB.leaveSpace(currentUser.id, currentSpace.id);
      loadState();
    }
  };

  // METRICS CALCULATOR
  const calculateProgressScore = (category) => {
    if (!currentSpace) return 0;
    const completions = DB.get(DB.KEYS.CHALLENGES).filter((c) => c.spaceId === currentSpace.id);
    const categoryChallenges = (window.DEFAULT_CHALLENGES || []).filter((c) => c.category === category);
    
    if (categoryChallenges.length === 0) return 0;
    
    let completedCount = 0;
    categoryChallenges.forEach((ch) => {
      const comp = completions.find((x) => x.challengeId === ch.id);
      if (comp && (comp.completions[currentSpace.creatorId] || comp.completions[currentSpace.partnerId])) {
        completedCount++;
      }
    });

    return Math.min(Math.round((completedCount / categoryChallenges.length) * 100), 100);
  };

  // SIMULATOR DEV BUTTONS
  const devSwitchUser = (uid) => {
    localStorage.setItem(DB.KEYS.ACTIVE_USER, uid);
    loadState();
  };

  const devSimulateChat = () => {
    if (!currentSpace || !partnerUser) return;
    setIsPartnerTyping(true);
    setTimeout(() => {
      const simulatedTexts = [
        "Hey there! Thinking of you.",
        "Check out the memory we locked in today!",
        "Can't wait to hang out this weekend.",
        "I completed today's appreciation challenge!",
        "Hope you are having a wonderful day."
      ];
      const randomTxt = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
      DB.sendChatMessage(currentSpace.id, partnerUser.id, randomTxt);
      loadState();
      setIsPartnerTyping(false);
    }, 1500);
  };

  const devSimulateAnswer = () => {
    if (!currentSpace || !partnerUser) return;
    const dailyQuestions = DB.getAllQuestions().filter((q) => q.modes.includes(currentSpace.relationshipMode));
    const dayIndex = currentSpace.streakDays % (dailyQuestions.length || 1);
    const todayQuestion = dailyQuestions[dayIndex] || dailyQuestions[0];

    const simulatedAnswers = [
      "Probably the picnic date we had last summer.",
      "I loved when you texted me random words of support before my interview.",
      "Definitely going on a road trip to the mountains.",
      "I've been thinking about how lucky I am to have you around.",
      "When we cooked dinner together listening to vinyl records."
    ];
    const randomAnswer = simulatedAnswers[Math.floor(Math.random() * simulatedAnswers.length)];

    DB.submitAnswer(currentSpace.id, partnerUser.id, todayQuestion.id, randomAnswer);
    loadState();
  };

  const devSimulateMood = () => {
    if (!partnerUser) return;
    const moods = [
      { emoji: "😊", label: "Great" },
      { emoji: "🙂", label: "Good" },
      { emoji: "😐", label: "Okay" },
      { emoji: "😔", label: "Not Great" },
      { emoji: "😢", label: "Difficult" }
    ];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    DB.updateMood(partnerUser.id, randomMood.emoji, randomMood.label);
    loadState();
  };

  const devResetDB = () => {
    if (confirm("Reset local mock database to default seeded users (Alice & Bob)?")) {
      DB.resetDatabase();
      loadState();
    }
  };

  // RENDER HELPERS
  const dailyQuestions = DB.getAllQuestions().filter((q) => currentSpace && q.modes.includes(currentSpace.relationshipMode));
  const todayQuestionIndex = currentSpace ? currentSpace.streakDays % (dailyQuestions.length || 1) : 0;
  const todayQuestion = dailyQuestions[todayQuestionIndex] || dailyQuestions[0];

  const answers = DB.get(DB.KEYS.ANSWERS);
  const todayAnswerObj = currentSpace && todayQuestion ? answers.find((a) => a.spaceId === currentSpace.id && a.questionId === todayQuestion.id) : null;
  
  const creatorAnswer = todayAnswerObj?.answers[currentSpace?.creatorId];
  const partnerAnswer = todayAnswerObj?.answers[currentSpace?.partnerId];
  const isQuestionRevealed = !!(creatorAnswer && partnerAnswer);

  const myAnswer = currentUser && todayAnswerObj?.answers[currentUser.id];
  const partnerAnswerHidden = !!(myAnswer && !partnerAnswer);

  if (!isMounted) {
    return (
      <div className="bg-atmospheric min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-serif text-2xl text-white">BetweenUs...</div>
      </div>
    );
  }

  // Render auth modal helper
  const renderAuthModal = () => {
    if (!authModal) return null;
    return (
      <div className="modal-overlay flex" onClick={() => setAuthModal(null)}>
        <div className="modal-content glass-card rounded-[28px] p-8 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setAuthModal(null)}>&times;</button>
          <div className="modal-header">
            <h3 className="text-2xl font-bold text-primary">
              {authModal === "signup" ? "Create BetweenUs Account" : "Welcome Back"}
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              {authModal === "signup" ? "Get closer to the people you love." : "Log in to access your shared connection spaces."}
            </p>
          </div>
          
          <div className="modal-form mt-4">
            {authModal === "signup" && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" placeholder="e.g. Alice Miller" value={authName} onChange={(e) => setAuthName(e.target.value)} />
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" placeholder="alice@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" className="input-field" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
            </div>
            
            <button className="btn btn-primary w-full py-4 mt-2" onClick={handleAuthSubmit}>
              {authModal === "signup" ? "Sign Up & Get Started" : "Secure Log In"}
            </button>
            
            <p className="text-xs text-center text-on-surface-variant mt-4">
              {authModal === "signup" ? "Already have an account?" : "Need a new space?"}{" "}
              <a href="#" className="text-primary font-bold hover:underline" onClick={(e) => { e.preventDefault(); setAuthModal(authModal === "signup" ? "signin" : "signup"); }}>
                {authModal === "signup" ? "Sign In" : "Sign Up"}
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 1. ISOLATE LANDING VIEW RENDER (No sidebar, no main margins)
  if (currentView === "landing") {
    return (
      <div className="min-h-[100dvh] w-full relative overflow-hidden bg-atmospheric text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container flex flex-col items-center justify-center">
        
        {/* Ambient Background Elements */}
        <div className="pointer-events-none absolute -z-10 inset-0 overflow-hidden">
          {/* Large top circle */}
          <div className="glass-circle absolute w-[70vw] h-[70vw] rounded-full top-[10%] left-[5%] animate-float-slow mix-blend-screen opacity-70 pointer-events-none"></div>
          {/* Medium right circle */}
          <div className="glass-circle absolute w-[40vw] h-[40vw] rounded-full top-[40%] right-[-10%] animate-float-medium mix-blend-screen opacity-60 pointer-events-none"></div>
          {/* Small bottom circle */}
          <div className="glass-circle absolute w-[50vw] h-[50vw] rounded-full bottom-[15%] left-[-15%] animate-float-fast mix-blend-screen opacity-50 pointer-events-none"></div>
          {/* Subtle glow spots */}
          <div className="absolute top-[30%] right-[20%] w-4 h-4 bg-white rounded-full blur-md animate-pulse-glow pointer-events-none"></div>
          <div className="absolute bottom-[25%] left-[30%] w-6 h-6 bg-primary rounded-full blur-lg animate-pulse-glow pointer-events-none" style={{ animationDelay: "2s" }}></div>
        </div>

        {/* Constrained landing content wrapper */}
        <div className="relative z-10 w-full max-w-md min-h-[100dvh] flex flex-col justify-between items-center py-10 px-6">
          {/* Header Section */}
          <header className="w-full text-center space-y-4 animate-fade-in-down flex flex-col items-center">
            <h2 className="text-primary/85 uppercase tracking-[0.3em] text-xs font-semibold text-center">Reimagined</h2>
            <h1 className="font-serif text-3xl font-bold tracking-wide text-white drop-shadow-md text-center">
              BetweenUs
            </h1>
          </header>

          {/* Central Messaging */}
          <section className="flex flex-col items-center justify-center flex-grow text-center space-y-8 my-8">
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="font-serif text-5xl md:text-6xl leading-tight font-semibold text-glow text-white">
                Our <br/>
                <span className="italic text-primary/90">Private</span> <br/>
                Sanctuary
              </h2>
              <p className="font-sans text-sm md:text-base font-light text-brand-light/95 max-w-[280px] leading-relaxed mx-auto mt-4">
                A quiet space meant just for two. Away from the noise, close to the heart.
              </p>
            </div>
            <div className="pt-4 animate-pulse" style={{ animationDuration: "3s" }}>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0", fontSize: "32px" }}>
                favorite
              </span>
            </div>
          </section>

          {/* Action Section */}
          <section className="w-full pt-4 pb-2 animate-fade-in-up flex flex-col items-center relative z-20">
            {currentUser ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <button 
                  className="w-72 py-3.5 px-6 rounded-full bg-rose-200 text-rose-950 font-medium shadow-md hover:bg-rose-300 transition text-center whitespace-nowrap cursor-pointer border-none"
                  type="button"
                  onClick={() => setCurrentView(currentUser.currentSpaceId ? "home" : "onboarding")}
                >
                  Enter Sanctuary
                </button>
                <button 
                  className="w-72 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-rose-100 text-center transition cursor-pointer font-medium text-sm whitespace-nowrap"
                  type="button"
                  onClick={handleLogout}
                >
                  Sign Out ({currentUser.name})
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                <button 
                  className="w-72 py-3.5 px-6 rounded-full bg-rose-200 text-rose-950 font-medium shadow-md hover:bg-rose-300 transition text-center whitespace-nowrap cursor-pointer border-none"
                  type="button"
                  onClick={() => setAuthModal("signup")}
                >
                  Get Started
                </button>
                <button 
                  className="w-72 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-rose-100 text-center transition cursor-pointer font-medium text-sm whitespace-nowrap"
                  type="button"
                  onClick={() => setAuthModal("signin")}
                >
                  Welcome Back
                </button>
              </div>
            )}
            <div className="mt-6 w-full flex justify-center">
              <p className="w-72 text-center text-xs text-rose-200/60 leading-relaxed whitespace-normal">
                Secured with end-to-end encryption.
              </p>
            </div>
          </section>
        </div>
        
        {renderAuthModal()}
      </div>
    );
  }

  // 2. RENDERING CORE WORKSPACE SYSTEM (Home, Chat, Discover, Memories, Daily, etc.)
  return (
    <div className="text-on-surface font-body-md min-h-screen antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container relative">
      <ShaderBackground />

      {/* Floating Memory Bubbles (Decorative) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="floating-bubble absolute top-[15%] left-[25%] w-[300px] h-[300px] rounded-full bg-white/10 backdrop-blur-md border border-white/20"></div>
        <div className="floating-bubble absolute bottom-[20%] left-[10%] w-[200px] h-[200px] rounded-full bg-white/10 backdrop-blur-lg border border-white/20"></div>
        <div className="floating-bubble absolute top-[40%] right-[35%] w-[150px] h-[150px] rounded-full bg-white/10 backdrop-blur-sm border border-white/20"></div>
      </div>

      {/* Mobile Header Bar */}
      {currentUser && (
        <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-surface/30 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 lg:hidden">
          <button className="text-primary flex items-center justify-center cursor-pointer bg-transparent border-0" onClick={() => setMobileSidebarOpen(true)}>
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h2 className="font-serif text-lg font-bold text-white capitalize">{currentView === "home" ? "Sanctuary" : currentView === "chat" ? "Our Space" : currentView === "daily" ? "Rituals" : currentView}</h2>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: currentUser.avatarColor, color: '#fff' }}>
            {currentUser.name[0].toUpperCase()}
          </div>
        </header>
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <div id="app-container" className="relative z-10 flex">
        {/* Navigation Sidebar (Desktop) */}
        {currentUser && (
          <aside className={`sidebar bg-white/10 dark:bg-inverse-surface/10 backdrop-blur-lg border-r border-white/20 shadow-sm py-8 px-4 z-50 transition-all duration-300 hover:bg-white/20 ${mobileSidebarOpen ? "mobile-open" : ""}`}>
            <div className="mb-12 px-4 cursor-pointer" onClick={() => navigateTo("home")}>
              <h1 className="font-headline-sm text-headline-sm text-primary font-bold drop-shadow-sm flex items-center gap-2">
                <svg className="logo-heart" style={{ width: "24px", height: "24px", fill: "var(--primary)" }} viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                BetweenUs
              </h1>
              <p className="font-caption text-caption text-on-surface-variant mt-1">Our Private Sanctuary</p>
            </div>

            <nav className="flex-1 space-y-2">
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "home" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("home"); }}>
                <span className="material-symbols-outlined">home</span>
                <span className="font-label-md text-label-md">Home</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "discover" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("discover"); }}>
                <span className="material-symbols-outlined">explore</span>
                <span className="font-label-md text-label-md">Discover</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "chat" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("chat"); }}>
                <span className="material-symbols-outlined">chat_bubble</span>
                <span className="font-label-md text-label-md">Our Space</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "daily" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("daily"); }}>
                <span className="material-symbols-outlined">calendar_today</span>
                <span className="font-label-md text-label-md">Daily</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "memories" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("memories"); }}>
                <span className="material-symbols-outlined">auto_stories</span>
                <span className="font-label-md text-label-md">Memories</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "insights" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("insights"); }}>
                <span className="material-symbols-outlined">insights</span>
                <span className="font-label-md text-label-md">Insights</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "profile" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("profile"); }}>
                <span className="material-symbols-outlined">person</span>
                <span className="font-label-md text-label-md">Profile</span>
              </a>
            </nav>

            {/* Sidebar User Footer */}
            <div className="sidebar-footer" style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "20px" }}>
              <div className="user-avatar-small" style={{ background: currentUser.avatarColor }}>
                {currentUser.name[0].toUpperCase()}
              </div>
              <div className="user-info-small">
                <span className="user-name-small">{currentUser.name}</span>
                <span className="user-status-small">{currentSpace ? "Connected" : "Single Space"}</span>
              </div>
            </div>

            {/* Admin Link */}
            <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "12px" }}>
              <a href="/admin" className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant/60 font-medium hover:bg-white/30 hover:text-primary transition-all duration-200" onClick={() => setMobileSidebarOpen(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>lock</span>
                <span className="font-label-md text-label-md" style={{ fontSize: "0.85rem" }}>Admin Dashboard</span>
              </a>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="main-content flex-1 min-h-screen" style={{ marginLeft: currentUser ? "var(--sidebar-width)" : "0", width: currentUser ? "calc(100% - var(--sidebar-width))" : "100%" }}>

          {/* VIEW: ONBOARDING */}
          {currentView === "onboarding" && (
            <section className="view-container active-view w-full max-w-[600px] mx-auto py-6 px-4 md:py-12 md:px-8">
              <div className="glass-card flex flex-col gap-6">
                <div>
                  <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Let's connect your space</h2>
                  <p className="text-on-surface-variant">Create a private space or join your partner's existing space.</p>
                </div>

                <div className="space-y-6">
                  {/* Join Space */}
                  <div className="p-6 bg-white/20 rounded-2xl border border-white/30 space-y-4">
                    <h3 className="text-lg font-bold">Have an Invite Code?</h3>
                    <div className="flex gap-3">
                      <input type="text" className="input-field flex-1 uppercase font-mono text-center tracking-widest font-bold" placeholder="BU-XXXX-XX" value={onboardCode} onChange={(e) => setOnboardCode(e.target.value)} />
                      <button className="btn btn-primary" onClick={handleJoinSpace}>Connect</button>
                    </div>
                  </div>

                  <div className="text-center font-bold text-on-surface-variant/50">OR</div>

                  {/* Create Space */}
                  <div className="p-6 bg-white/20 rounded-2xl border border-white/30 space-y-4">
                    <h3 className="text-lg font-bold">Create a New Space</h3>
                    <div className="space-y-3">
                      <div className="input-group">
                        <label className="input-label">Relationship Mode</label>
                        <select className="select-field" value={onboardMode} onChange={(e) => setOnboardMode(e.target.value)}>
                          <option value="couple">💕 Couples Mode</option>
                          <option value="marriage">💍 Marriage Mode</option>
                          <option value="long_distance">🌍 Long Distance</option>
                          <option value="friends">🫂 Friends Mode</option>
                          <option value="family">🏡 Family Mode</option>
                          <option value="custom">✨ Custom Space</option>
                        </select>
                      </div>
                      <button className="btn btn-primary w-full py-4" onClick={handleCreateSpace}>Generate Invite Code</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* VIEW: HOME DASHBOARD */}
          {currentView === "home" && currentSpace && (
            <section className="view-container active-view w-full max-w-[1100px] mx-auto py-6 px-4 md:py-12 md:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left/Main Columns */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Partner Status Overview */}
                  <section className="flex flex-col sm:flex-row items-center sm:text-left text-center gap-6 p-6 glass-card rounded-[32px] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <div className="w-24 h-24 relative flex-shrink-0">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-subtle-pulse -m-2 blur-md"></div>
                      <div className="w-full h-full rounded-full border-2 border-primary/30 relative z-10 flex items-center justify-center font-serif text-white text-3xl font-bold bg-cover bg-center overflow-hidden" style={{ background: partnerUser?.avatarColor || "#70585b" }}>
                        {partnerUser ? (
                          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkORfiJPf7wgCEmgxmcYy1qEbzmYc8GGWFXQ1bfp-18ON-COitO61bpVQt7GcSidAc6S0Mkfu3SJcfYxa08REoHmfc_olVmgUaBxcmJClvDI3oFM8gK0WKbQfsX8pApELxbI0KpQU0LS-mloLHiQRzS_t3v7tWbpelz4wZDc3Ko-w2A-3QONfmUnlD3aY9JfB1Y7OLcQgKe417DGwtQzLGSZwy_WkFWeJZg7IJ3O24Y--ISeEp22-w" alt={partnerUser.name} />
                        ) : (
                          "P"
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full border-4 border-surface z-25 animate-pulse"></div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h2 className="font-title-md text-2xl text-primary-fixed-dim font-bold">{partnerUser ? `${partnerUser.name} & Me` : currentUser.name}</h2>
                        {partnerUser && (
                          <span className="bg-surface/60 border border-white/20 rounded-full px-3 py-0.5 text-xs flex items-center gap-1 shadow-md backdrop-blur-md text-on-surface">
                            <span>{partnerUser.mood || "😐"}</span> {partnerUser.moodLabel || "Okay"}
                          </span>
                        )}
                      </div>
                      <p className="font-body-md text-sm text-on-surface-variant opacity-80">
                        {currentSpace.relationshipMode.replace("_", " ").toUpperCase()} Space • 🔥 {currentSpace.streakDays} Day Streak
                      </p>
                    </div>
                  </section>

                  {/* Daily Ritual Card */}
                  <section className="bg-white/5 backdrop-blur-[32px] border border-white/10 rounded-[32px] p-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary-fixed-dim text-lg">auto_awesome</span>
                      <span className="font-label-sm text-xs text-primary-fixed-dim uppercase tracking-wider font-semibold">Daily Connection Ritual</span>
                    </div>
                    <h3 className="font-headline-lg-mobile text-xl text-on-surface mb-6 leading-tight font-medium max-w-xl">
                      {todayQuestion ? todayQuestion.text : "Loading connection prompts..."}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="bg-primary/20 hover:bg-primary/30 text-primary-fixed-dim font-body-md text-sm py-4 px-6 rounded-xl border border-primary/20 transition-all duration-200 flex justify-center items-center gap-2" onClick={() => setCurrentView("daily")}>
                        <span className="material-symbols-outlined text-lg">edit</span>
                        {isQuestionRevealed ? "View Responses" : myAnswer ? "Waiting for Partner" : "Answer Prompt"}
                      </button>
                    </div>
                  </section>

                  {/* Mood Check-In */}
                  <div className="glass-card mood-widget rounded-[32px] p-8">
                    <div>
                      <h3 className="text-lg font-bold">How are you feeling today?</h3>
                      <p className="text-sm text-on-surface-variant mb-4">Update your mood accent in our private space.</p>
                    </div>

                    <div className="mood-options-list flex flex-wrap gap-2.5">
                      {[
                        { emoji: "😊", label: "Great", activeClass: "active-mood-great" },
                        { emoji: "🙂", label: "Good", activeClass: "active-mood-good" },
                        { emoji: "😐", label: "Okay", activeClass: "active-mood-okay" },
                        { emoji: "😔", label: "Not Great", activeClass: "active-mood-notgreat" },
                        { emoji: "😢", label: "Difficult", activeClass: "active-mood-difficult" },
                      ].map((m) => (
                        <button
                          key={m.label}
                          className={`mood-btn flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-sm transition-all duration-200 ${currentUser.mood === m.emoji ? m.activeClass : ""}`}
                          onClick={() => handleMoodSelect(m.emoji, m.label)}
                        >
                          <span className="text-lg">{m.emoji}</span>
                          <span className="font-semibold text-xs">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column / Bento Growth Metrics */}
                <div className="space-y-6">
                  <div className="glass-card rounded-[32px] p-6 border border-white/10">
                    <h3 className="text-lg font-bold mb-6 text-primary-fixed-dim">Our Connection Bento</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: "Communication", icon: "forum", dash: 85, colorClass: "text-primary-fixed-dim" },
                        { name: "Understanding", icon: "favorite", dash: 72, colorClass: "text-secondary" },
                        { name: "Appreciation", icon: "auto_awesome", dash: 60, colorClass: "text-primary-fixed-dim" },
                        { name: "Quality Time", icon: "schedule", dash: 90, colorClass: "text-secondary" },
                      ].map((cat) => {
                        const score = calculateProgressScore(cat.name) || cat.dash;
                        return (
                          <div key={cat.name} className="bg-white/5 backdrop-blur-[32px] border border-white/10 rounded-[24px] p-4 flex flex-col items-center text-center">
                            <div className="relative w-16 h-16 mb-3">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                <path className={`${cat.colorClass} transition-all duration-1000 ease-out`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${score}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`material-symbols-outlined text-lg ${cat.colorClass}`}>{cat.icon}</span>
                              </div>
                            </div>
                            <h4 className="font-body-md text-xs text-on-surface font-medium mb-1">{cat.name}</h4>
                            <p className="font-label-sm text-[10px] text-on-surface-variant opacity-75">{score}% Score</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Simulated Partner Status Details */}
                  {partnerUser && (
                    <div className="glass-card p-6 rounded-[24px] border border-primary-container/20">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Partner Session</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-bold text-white text-sm" style={{ background: partnerUser.avatarColor }}>
                          {partnerUser.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{partnerUser.name}</p>
                          <p className="text-xs text-on-surface-variant">Last active mood check-in: {partnerUser.moodTime ? new Date(partnerUser.moodTime).toLocaleTimeString() : "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </section>
          )}

          {/* VIEW: DISCOVER Starter Advice */}
          {currentView === "discover" && (
            <section className="view-container active-view w-full max-w-[1200px] mx-auto py-6 px-4 md:py-12 md:px-8">
              <div>
                <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Discover Starter Advice</h2>
                <p className="text-on-surface-variant">Curated resources and reading materials for strong communication and connection rituals.</p>
              </div>

              <div className="discover-grid">
                {DEFAULT_DISCOVER.map((art) => (
                  <div key={art.id} className="glass-card discover-card">
                    <div className="discover-meta">
                      <span className="text-primary font-bold">{art.category}</span>
                      <span>{art.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight">{art.title}</h3>
                    <p className="text-sm flex-1 text-on-surface-variant">{art.summary}</p>
                    <button className="btn btn-glass btn-open-article self-start text-xs py-2 px-4" onClick={() => setActiveArticle(art)}>
                      Read Article
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* VIEW: CHAT (OUR SPACE) */}
          {currentView === "chat" && currentSpace && (
            <section className="view-container active-view w-full max-w-[500px] mx-auto py-4 px-4 flex flex-col h-[calc(100vh-140px)] md:h-[80vh] relative">
              <div className="glass-card chat-window flex-1 flex flex-col rounded-[32px] overflow-hidden relative border border-white/20 shadow-2xl bg-surface/10 backdrop-blur-xl">
                
                {/* Header */}
                <div className="chat-header flex justify-between items-center px-6 py-4 border-b border-white/10 bg-surface/20 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 relative flex items-center justify-center font-bold text-white text-sm" style={{ background: partnerUser?.avatarColor || "#70585b" }}>
                      {partnerUser ? (
                        partnerUser.name[0].toUpperCase()
                      ) : (
                        "P"
                      )}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-surface animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-headline-lg-mobile text-base text-primary dark:text-primary-fixed-dim tracking-tight font-bold">
                        {partnerUser ? partnerUser.name : "Waiting for partner..."}
                      </h3>
                      <p className="font-label-sm text-xs text-on-surface-variant">
                        {partnerUser ? `Feeling ${partnerUser.mood || "😐"} ${partnerUser.moodLabel || "Okay"}` : "Connecting space..."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <a href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-on-surface-variant dark:text-on-surface-variant hover:opacity-80 transition-opacity">
                      <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    </a>
                  </div>
                </div>

                {/* Messages */}
                <div className="chat-messages flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 hide-scrollbar">
                  <div className="text-center w-full my-2">
                    <span className="inline-block px-4 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 font-label-sm text-label-sm text-on-surface-variant">
                      Connection Chat Log
                    </span>
                  </div>

                  {DB.get(DB.KEYS.CHATS)
                    .filter((c) => c.spaceId === currentSpace.id)
                    .map((msg, idx) => {
                      const isMe = msg.senderId === currentUser.id;
                      const sender = isMe ? currentUser : partnerUser;
                      
                      return isMe ? (
                        <div key={idx} className="flex flex-col items-end gap-1 max-w-[85%] self-end">
                          <div className="bg-primary/15 backdrop-blur-[32px] border border-primary/20 rounded-2xl rounded-tr-sm p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.1)]">
                            {msg.media && (
                              <img src={msg.media} alt="Shared attachment" className="rounded-xl w-full h-auto object-cover max-h-48 mb-2 cursor-pointer hover:opacity-90" onClick={() => setActiveImagePreview(msg.media)} />
                            )}
                            <p className="font-body-md text-on-surface text-sm">{msg.text}</p>
                          </div>
                          <div className="flex items-center gap-1 mr-1">
                            <span className="font-label-sm text-label-sm text-on-surface-variant/50">
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                            <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
                          </div>
                        </div>
                      ) : (
                        <div key={idx} className="flex flex-col items-start gap-1 max-w-[85%] self-start">
                          <div className="bg-white/10 backdrop-blur-[32px] border border-white/20 rounded-2xl rounded-tl-sm px-glass-padding py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                            <span className="text-[10px] block font-bold text-primary mb-1 uppercase tracking-widest">{sender?.name || "Partner"}</span>
                            {msg.media && (
                              <img src={msg.media} alt="Shared attachment" className="rounded-xl w-full h-auto object-cover max-h-48 mb-2 cursor-pointer hover:opacity-90" onClick={() => setActiveImagePreview(msg.media)} />
                            )}
                            <p className="font-body-md text-on-surface text-sm">{msg.text}</p>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant/50 ml-1">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                        </div>
                      );
                    })}
                  
                  {isPartnerTyping && (
                    <div className="flex flex-col items-start gap-1 max-w-[85%] self-start mt-2">
                      <div className="bg-white/5 backdrop-blur-[32px] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center h-[42px]">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Footer Input */}
                <div className="px-container-padding pb-4 pt-2 bg-surface/20 backdrop-blur-xl border-t border-white/10">
                  <div className="bg-surface/30 backdrop-blur-[40px] border border-white/20 rounded-full flex items-center p-1 shadow-[0_-8px_32px_rgba(0,0,0,0.2)]">
                    
                    <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors hover:bg-white/5" onClick={() => chatImageInputRef.current?.click()}>
                      <span className="material-symbols-outlined">add_photo_alternate</span>
                    </button>
                    
                    <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors hover:bg-white/5" onClick={handleAutoAwesomePrompt}>
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </button>
                    
                    <input 
                      type="file" 
                      ref={chatImageInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleChatImageSelect} 
                    />
                    
                    <input 
                      className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-on-surface font-body-md placeholder:text-on-surface-variant/50 px-2 text-sm" 
                      placeholder="Whisper something..." 
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    />
                    
                    <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors hover:bg-white/5 mr-1" onClick={simulatePartnerVoiceNote}>
                      <span className="material-symbols-outlined">mic</span>
                    </button>
                    
                    <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_0_15px_rgba(255,218,223,0.3)] hover:scale-105 transition-transform" onClick={handleSendChat}>
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    </button>
                    
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* VIEW: DAILY RITUALS */}
          {currentView === "daily" && currentSpace && (
            <section className="view-container active-view w-full max-w-[1200px] mx-auto py-6 px-4 md:py-12 md:px-8">
              <div className="daily-activities-container">
                {/* 3D Question Card Flipping */}
                <div className="question-panel">
                  <div>
                    <h3 className="text-2xl font-bold font-headline-sm text-primary mb-1">Question of the day</h3>
                    <p className="text-sm text-on-surface-variant">Strengthen connection through shared responses.</p>
                  </div>

                  <div className="card-perspective-container">
                    <div className={`flip-card-inner h-full w-full ${isQuestionRevealed ? "revealed" : ""}`}>
                      
                      {/* Front Card Face (Locked or form) */}
                      <div className="card-face card-front flex flex-col justify-between">
                        {todayQuestion ? (
                          <>
                            <div className="q-category-tag bg-primary/10 border border-primary/20 text-primary self-center px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-xs">
                              {todayQuestion.category}
                            </div>
                            
                            <h2 className="q-text text-xl font-bold text-center text-on-surface leading-snug px-6 w-full max-w-lg">
                              {todayQuestion.text}
                            </h2>

                            {myAnswer ? (
                              <div className="q-locked-overlay">
                                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 animate-pulse">lock</span>
                                <p className="text-sm text-on-surface-variant px-4">
                                  You've answered! Responses reveal once partner ({partnerUser?.name || "partner"}) replies.
                                </p>
                              </div>
                            ) : (
                              <div className="w-full space-y-3">
                                <textarea 
                                  className="w-full bg-white/20 border border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface" 
                                  placeholder="Write your secret answer here..." 
                                  rows="3"
                                  value={dailyAnswerInput}
                                  onChange={(e) => setDailyAnswerInput(e.target.value)}
                                />
                                <button className="btn btn-primary w-full py-3" onClick={() => handleAnswerSubmit(todayQuestion.id)}>
                                  Lock In Answer
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <p>Loading today's connect prompts...</p>
                        )}
                      </div>

                      {/* Back Card Face (Revealed answers) */}
                      <div className="card-face card-back flex flex-col justify-between">
                        {todayQuestion && isQuestionRevealed && (
                          <>
                            <div className="q-category-tag bg-primary/15 border border-primary/30 text-primary self-center px-4 py-1 rounded-full font-bold uppercase tracking-wider text-xs">
                              Prompts Revealed
                            </div>

                            <div className="revealed-answers-grid flex-1 flex flex-col sm:flex-row gap-4 mt-6 mb-6">
                              <div className="answer-bubble flex-1">
                                <div className="answer-author-row flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs text-white" style={{ background: currentUser.avatarColor }}>
                                    {currentUser.name[0].toUpperCase()}
                                  </div>
                                  <span className="font-bold text-sm">{currentUser.name}</span>
                                </div>
                                <p className="answer-text-content mt-3 text-sm italic">{creatorAnswer?.text}</p>
                              </div>
                              
                              <div className="answer-bubble flex-1">
                                <div className="answer-author-row flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs text-white" style={{ background: partnerUser?.avatarColor || "#70585b" }}>
                                    {(partnerUser?.name || "P")[0].toUpperCase()}
                                  </div>
                                  <span className="font-bold text-sm">{partnerUser?.name || "Partner"}</span>
                                </div>
                                <p className="answer-text-content mt-3 text-sm italic">{partnerAnswer?.text}</p>
                              </div>
                            </div>

                            <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-widest text-center">Streak Active - Revealed</p>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Challenges Panel */}
                <div className="challenges-panel">
                  <div>
                    <h3 className="text-2xl font-bold font-headline-sm text-primary mb-1">Daily connection checklists</h3>
                    <p className="text-sm text-on-surface-variant">Perform simple micro-challenges to secure streaks.</p>
                  </div>

                  <div className="challenge-list">
                    {DB.get(DB.KEYS.CHALLENGES)
                      .filter((ch) => ch.spaceId === currentSpace.id)
                      .map((comp) => {
                        const challenge = (window.DEFAULT_CHALLENGES || []).find((c) => c.id === comp.challengeId);
                        if (!challenge) return null;

                        const myComp = !!comp.completions[currentUser.id];
                        const partnerComp = partnerUser ? !!comp.completions[partnerUser.id] : false;
                        const bothComp = myComp && partnerComp;

                        return (
                          <div key={challenge.id} className={`glass-card challenge-card rounded-2xl ${bothComp ? "completed" : ""}`}>
                            <div className="challenge-details">
                              <span className="challenge-points">+{challenge.points} pts</span>
                              <span className="challenge-text text-sm font-semibold">{challenge.text}</span>
                              <div className="flex gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${myComp ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 border-white/10 text-on-surface-variant"}`}>Me</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${partnerComp ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-white/5 border-white/10 text-on-surface-variant"}`}>Partner</span>
                              </div>
                            </div>
                            <div className="challenge-checkbox" onClick={() => handleChallengeToggle(challenge.id, myComp)}>
                              <svg viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* VIEW: MEMORIES timeline stream */}
          {currentView === "memories" && currentSpace && (
            <section className="view-container active-view w-full max-w-[1200px] mx-auto py-6 px-4 md:py-12 md:px-8 flex flex-col md:flex-row gap-8">
              
              {/* Memories sidebar capture form */}
              <div className="w-full md:w-80 space-y-6">
                <div className="glass-card flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-primary">Capture a Memory</h3>
                  <p className="text-xs text-on-surface-variant">Lock a photo or milestone description permanently in our memories stream.</p>
                  
                  <div className="modal-form">
                    <div className="relative group w-full h-40 bg-white/20 border border-dashed border-white/40 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => document.getElementById("mem-image-picker").click()}>
                      {memoryImage ? (
                        <img src={memoryImage} alt="Selected preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                          <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Upload image</p>
                        </div>
                      )}
                      <input type="file" id="mem-image-picker" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Memory Title</label>
                      <input type="text" className="input-field text-sm" placeholder="e.g. Our Picnic Date" value={memoryTitleInput} onChange={(e) => setMemoryTitleInput(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Details & Notes</label>
                      <textarea className="input-field text-sm" placeholder="Write something sweet..." rows="3" value={memoryDetailsInput} onChange={(e) => setMemoryDetailsInput(e.target.value)} />
                    </div>
                    <button className="btn btn-primary w-full py-3" onClick={handleSaveMemory}>Save to Stream</button>
                  </div>
                </div>
              </div>

              {/* Memories stream grid */}
              <div className="flex-1 space-y-6">
                <div className="memories-header-row">
                  <div>
                    <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Our shared memories</h2>
                    <p className="text-on-surface-variant">Chronological archive of photos, daily Q&As, and key milestones.</p>
                  </div>
                </div>

                <div className="memories-grid">
                  {DB.get(DB.KEYS.MEMORIES)
                    .filter((m) => m.spaceId === currentSpace.id)
                    .map((mem) => {
                      let tagClass = "tag-milestone";
                      if (mem.type === "question") tagClass = "tag-question";
                      if (mem.type === "photo") tagClass = "tag-photo";
                      
                      return (
                        <div key={mem.id} className="glass-card memory-card rounded-3xl">
                          <div className="flex justify-between items-start">
                            <span className={`memory-tag font-bold ${tagClass}`}>{mem.type}</span>
                            <span className="memory-date text-[10px] font-bold uppercase tracking-wider">{mem.timestamp ? new Date(mem.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ""}</span>
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-base leading-snug mb-2">{mem.title}</h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{mem.detail}</p>
                          </div>

                          {mem.media && (
                            <img src={mem.media} alt="Memory illustration" className="memory-photo cursor-pointer hover:opacity-95" onClick={() => setActiveImagePreview(mem.media)} />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

            </section>
          )}

          {/* VIEW: INSIGHTS */}
          {currentView === "insights" && currentSpace && (
            <section className="view-container active-view w-full max-w-[1200px] mx-auto py-6 px-4 md:py-12 md:px-8">
              <div>
                <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Relationship Insights</h2>
                <p className="text-on-surface-variant">Analyze communication trends, streak consistency, and growth areas.</p>
              </div>

              <div className="insights-grid">
                {/* Visual Bar Chart */}
                <div className="glass-card flex flex-col gap-4">
                  <h3 className="text-lg font-bold">Growth Areas Breakdown</h3>
                  <p className="text-xs text-on-surface-variant mb-4">Active score derived from daily checklist participation</p>
                  
                  <div className="chart-placeholder-container flex-1">
                    {[
                      { label: "Comm.", cat: "Communication", isViolet: false },
                      { label: "Time", cat: "Quality Time", isViolet: true },
                      { label: "Apprec.", cat: "Appreciation", isViolet: false },
                      { label: "Unders.", cat: "Understanding", isViolet: true },
                    ].map((item) => {
                      const score = calculateProgressScore(item.cat);
                      return (
                        <div key={item.label} className="chart-bar-item">
                          <span className="chart-bar-val">{score}%</span>
                          <div className={`chart-bar-fill ${item.isViolet ? "violet-fill" : ""}`} style={{ height: `${score}%` }}></div>
                          <span className="chart-bar-label font-bold mt-2">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Connection Tips */}
                <div className="glass-card flex flex-col gap-4">
                  <h3 className="text-lg font-bold">Connection Action Tips</h3>
                  <div className="insight-tips-list flex-1 flex flex-col gap-3 justify-center">
                    <div className="tip-item">
                      <span className="material-symbols-outlined text-primary text-3xl">chat</span>
                      <div>
                        <h4 className="font-bold text-sm">Practice verbal check-ins</h4>
                        <p className="text-xs text-on-surface-variant mt-1">Your communication score is rising! Make sure to follow up on today's revealed answers in chat.</p>
                      </div>
                    </div>

                    <div className="tip-item">
                      <span className="material-symbols-outlined text-primary text-3xl">favorite</span>
                      <div>
                        <h4 className="font-bold text-sm">Express appreciation weekly</h4>
                        <p className="text-xs text-on-surface-variant mt-1">Complete more daily challenges together to boost your Appreciation score higher!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* VIEW: SETTINGS & PROFILE */}
          {currentView === "profile" && currentUser && (
            <section className="view-container active-view w-full max-w-[1200px] mx-auto py-6 px-4 md:py-12 md:px-8">
              <div>
                <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Settings & Profile</h2>
                <p className="text-on-surface-variant">Update credentials, profile accents, or check space invite settings.</p>
              </div>

              <div className="insights-grid">
                {/* Profile Card */}
                <div className="glass-card flex flex-col gap-6">
                  <h3 className="text-xl font-bold text-primary">Your Profile</h3>
                  
                  <div className="modal-form">
                    <div className="flex items-center gap-5">
                      <div className="user-avatar-small flex items-center justify-center font-bold text-white text-xl" style={{ background: currentUser.avatarColor, width: "60px", height: "60px" }}>
                        {currentUser.name[0].toUpperCase()}
                      </div>
                      <div className="space-y-2">
                        <span className="input-label">Avatar Accent Color</span>
                        <div className="flex gap-2">
                          {["#ff5a79", "#8a4fff", "#4dbcff", "#00e676", "#ffb800"].map((col) => (
                            <span 
                              key={col} 
                              className="w-6 h-6 rounded-full cursor-pointer border border-white/30 hover:scale-110 transition-transform" 
                              style={{ background: col }}
                              onClick={() => {
                                const users = DB.get(DB.KEYS.USERS);
                                const u = users.find((x) => x.id === currentUser.id);
                                if (u) {
                                  u.avatarColor = col;
                                  DB.set(DB.KEYS.USERS, users);
                                  loadState();
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <input type="text" className="input-field" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input type="email" className="input-field opacity-60 cursor-not-allowed" value={currentUser.email} disabled />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button className="btn btn-primary" onClick={handleProfileSave}>Save Profile</button>
                      <button className="btn btn-glass" onClick={handleLogout}>Log Out</button>
                    </div>
                  </div>
                </div>

                {/* Space Settings Card */}
                <div className="glass-card flex flex-col gap-6">
                  <h3 className="text-xl font-bold text-primary">Space Settings</h3>
                  {currentSpace ? (
                    <div className="space-y-4">
                      <div>
                        <span className="input-label">Space ID</span>
                        <div className="font-mono text-sm font-semibold mt-1 text-on-surface">{currentSpace.id}</div>
                      </div>
                      <div>
                        <span className="input-label">Invite Code</span>
                        <div className="font-mono text-xl font-bold mt-1 text-primary tracking-widest">{currentSpace.code}</div>
                      </div>
                      <div>
                        <span className="input-label">Relationship Mode</span>
                        <div className="text-sm font-bold mt-1 uppercase tracking-wider text-on-surface-variant">{currentSpace.relationshipMode.replace("_", " ")}</div>
                      </div>
                      <div className="pt-4 border-t border-white/20">
                        <button className="btn btn-glass border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={handleLeaveSpace}>
                          Leave Shared Space
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant">You are not connected to any space yet.</p>
                  )}
                </div>
              </div>
            </section>
          )}

        </main>

        {/* Bottom Nav Bar (Mobile Only) */}
        {currentUser && currentView !== "landing" && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-surface/30 dark:bg-surface/10 backdrop-blur-[40px] border-t border-white/20 rounded-t-[24px] md:hidden shadow-lg">
            
            {/* Sanctuary (Home) */}
            <button 
              className={`flex flex-col items-center justify-center transition-all duration-200 ${currentView === "home" ? "text-primary scale-110" : "text-on-surface-variant/70 hover:text-primary"}`}
              onClick={() => setCurrentView("home")}
            >
              <span className="material-symbols-outlined mb-1">home</span>
              <span className="font-label-sm text-[10px] font-bold">Sanctuary</span>
            </button>

            {/* Rituals (Daily) */}
            <button 
              className={`flex flex-col items-center justify-center transition-all duration-200 ${currentView === "daily" ? "text-primary scale-110" : "text-on-surface-variant/70 hover:text-primary"}`}
              onClick={() => setCurrentView("daily")}
            >
              <span className="material-symbols-outlined mb-1">auto_awesome</span>
              <span className="font-label-sm text-[10px] font-bold">Rituals</span>
            </button>

            {/* Our Space (Chat) */}
            <button 
              className={`flex flex-col items-center justify-center transition-all duration-200 ${currentView === "chat" ? "text-primary scale-110" : "text-on-surface-variant/70 hover:text-primary"}`}
              onClick={() => setCurrentView("chat")}
            >
              <span className="material-symbols-outlined mb-1">chat_bubble</span>
              <span className="font-label-sm text-[10px] font-bold">Our Space</span>
            </button>

            {/* Timeline (Memories) */}
            <button 
              className={`flex flex-col items-center justify-center transition-all duration-200 ${currentView === "memories" ? "text-primary scale-110" : "text-on-surface-variant/70 hover:text-primary"}`}
              onClick={() => setCurrentView("memories")}
            >
              <span className="material-symbols-outlined mb-1">auto_stories</span>
              <span className="font-label-sm text-[10px] font-bold">Timeline</span>
            </button>

            {/* Profile (Settings) */}
            <button 
              className={`flex flex-col items-center justify-center transition-all duration-200 ${currentView === "profile" ? "text-primary scale-110" : "text-on-surface-variant/70 hover:text-primary"}`}
              onClick={() => setCurrentView("profile")}
            >
              <span className="material-symbols-outlined mb-1">person_heart</span>
              <span className="font-label-sm text-[10px] font-bold">Profile</span>
            </button>
            
          </nav>
        )}

      </div>

      {/* Shared Auth Modal Overlay */}
      {authModal && (
        <div className="modal-overlay flex" onClick={() => setAuthModal(null)}>
          <div className="modal-content glass-card rounded-[28px] p-8" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAuthModal(null)}>&times;</button>
            <div className="modal-header">
              <h3 className="text-2xl font-bold text-primary">
                {authModal === "signup" ? "Create BetweenUs Account" : "Welcome Back"}
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                {authModal === "signup" ? "Get closer to the people you love." : "Log in to access your shared connection spaces."}
              </p>
            </div>
            
            <div className="modal-form mt-4">
              {authModal === "signup" && (
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Alice Miller" value={authName} onChange={(e) => setAuthName(e.target.value)} />
                </div>
              )}
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" placeholder="alice@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" className="input-field" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
              </div>
              
              <button className="btn btn-primary w-full py-4 mt-2" onClick={handleAuthSubmit}>
                {authModal === "signup" ? "Sign Up" : "Log In"}
              </button>
              
              <p className="text-xs text-center text-on-surface-variant">
                {authModal === "signup" ? "Already have an account?" : "Need a new space?"}{" "}
                <a href="#" className="text-primary font-bold hover:underline" onClick={(e) => { e.preventDefault(); setAuthModal(authModal === "signup" ? "signin" : "signup"); }}>
                  {authModal === "signup" ? "Sign In" : "Sign Up"}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="modal-overlay flex" onClick={() => setActiveArticle(null)}>
          <div className="modal-content glass-card rounded-[28px] max-w-xl p-8 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveArticle(null)}>&times;</button>
            <span className="text-primary font-bold uppercase tracking-widest text-xs block mb-1">
              {activeArticle.category} • {activeArticle.readTime}
            </span>
            <h2 className="text-2xl font-bold mb-4">{activeArticle.title}</h2>
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{activeArticle.content}</p>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {activeImagePreview && (
        <div className="modal-overlay flex" onClick={() => setActiveImagePreview(null)}>
          <div className="max-w-[90vw] max-h-[90vh] overflow-hidden rounded-3xl relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white text-2xl flex items-center justify-center cursor-pointer hover:bg-black/70" onClick={() => setActiveImagePreview(null)}>&times;</button>
            <img src={activeImagePreview} alt="Full screen preview" className="w-full h-full object-contain max-h-[85vh]" />
          </div>
        </div>
      )}

      {/* Dev Testing Collapsible Toolbar */}
      <div className={`dev-toolbar ${devToolbarCollapsed ? "collapsed" : ""} hidden md:block`}>
        <div className="dev-toolbar-header" onClick={() => setDevToolbarCollapsed(!devToolbarCollapsed)}>
          <span className="dev-toolbar-title">
            <span>🛠️</span> BETWEENUS NEXT.JS DEV PANEL & MULTI-USER SIMULATOR
          </span>
          <span id="dev-toolbar-chevron" className="text-xs">
            {devToolbarCollapsed ? "[Click to Expand]" : "[Click to Collapse]"}
          </span>
        </div>
        
        <div className="dev-toolbar-body">
          <div className="dev-toolbar-sections">
            <div className="dev-tool-group">
              <span className="dev-tool-label">Switch Active:</span>
              {DB.get(DB.KEYS.USERS).map((u) => {
                const isActive = currentUser?.id === u.id;
                return (
                  <button 
                    key={u.id} 
                    className={`btn btn-glass py-1 px-2.5 text-xs font-mono ${isActive ? "dev-btn-active-user" : ""}`}
                    onClick={() => devSwitchUser(u.id)}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>

            {currentSpace && partnerUser && (
              <div className="dev-tool-group border-l border-white/20 pl-4">
                <span className="dev-tool-label">Simulate Partner ({partnerUser.name}):</span>
                <button className="btn btn-glass py-1 px-2 text-xs" onClick={devSimulateChat}>Chat Msg</button>
                <button className="btn btn-glass py-1 px-2 text-xs" onClick={devSimulateAnswer}>Answer Q</button>
                <button className="btn btn-glass py-1 px-2 text-xs" onClick={devSimulateMood}>Set Mood 😢</button>
              </div>
            )}
          </div>
          
          <div>
            <button className="btn btn-glass py-1 px-3 text-xs border-red-500/20 text-primary" onClick={devResetDB}>
              Reset Database
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
