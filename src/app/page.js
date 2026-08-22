"use client";

import { useState, useEffect, useRef } from "react";
import { DB } from "@/lib/db";
import { DEFAULT_DISCOVER } from "@/lib/data";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";
import "./profile.css";
import "./settings.css";

import { LinkFour, WordDuel, Spotted, MemoryMatch } from "@/components/CouplesGames";

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
  const [onboardError, setOnboardError] = useState(null);
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatedSpace, setGeneratedSpace] = useState(null);

  // Profile Edit
  const [profileName, setProfileName] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const profileImageInputRef = useRef(null);

  // Chat states
  const [chatMessage, setChatMessage] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const chatImageInputRef = useRef(null);

  const renderAvatar = (u, sizeClass = "w-10 h-10", textClass = "text-sm") => {
    if (!u) return null;
    if (u.avatarUrl) {
      return (
        <img 
          src={u.avatarUrl} 
          alt={u.name} 
          className={`rounded-full object-cover shrink-0 ${sizeClass}`}
        />
      );
    }
    return (
      <div 
        className={`rounded-full flex items-center justify-center font-bold text-white uppercase shrink-0 ${sizeClass} ${textClass}`} 
        style={{ background: u.avatarColor || "#ff5a79" }}
      >
        {u.name[0].toUpperCase()}
      </div>
    );
  };

  // Daily Question state
  const [dailyAnswerInput, setDailyAnswerInput] = useState("");

  // Memory creation sidebar state
  const [memoryTitleInput, setMemoryTitleInput] = useState("");
  const [memoryDetailsInput, setMemoryDetailsInput] = useState("");
  const [memoryImage, setMemoryImage] = useState(null);

  // Dev toolbar state
  const [devToolbarCollapsed, setDevToolbarCollapsed] = useState(true);
  const [showDevToolbar, setShowDevToolbar] = useState(false);

  // New UX state variables
  const [partnerOnboardName, setPartnerOnboardName] = useState("");
  const [activeActivityModal, setActiveActivityModal] = useState(null);
  const [loveLetters, setLoveLetters] = useState([]);
  const [datePlans, setDatePlans] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [touchPings, setTouchPings] = useState([]);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Letter drafts
  const [loveLetterInput, setLoveLetterInput] = useState("");

  // Date Plan drafts
  const [dateTitle, setDateTitle] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [dateLocation, setDateLocation] = useState("");
  const [dateDesc, setDateDesc] = useState("");

  // Drawing configs
  const [drawColor, setDrawColor] = useState("#FDBA74");
  const [drawSize, setDrawSize] = useState(4);

  // Private Diary states
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryActiveFilter, setDiaryActiveFilter] = useState("All");
  const [diarySearchOpen, setDiarySearchOpen] = useState(false);
  const [diarySearchQuery, setDiarySearchQuery] = useState("");
  const [diaryModalOpen, setDiaryModalOpen] = useState(false);

  // Diary Form fields
  const [diaryTitleInput, setDiaryTitleInput] = useState("");
  const [diaryContentInput, setDiaryContentInput] = useState("");
  const [diaryCategoryInput, setDiaryCategoryInput] = useState("Things I Notice");
  const [diaryDateInput, setDiaryDateInput] = useState("");
  const [diaryImageInput, setDiaryImageInput] = useState(null);

  // Couples Game Scoreboard states
  const [gameScores, setGameScores] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [scoreboardTab, setScoreboardTab] = useState("play"); // 'play' or 'stats'
  const [activeGameModal, setActiveGameModal] = useState(null);

  // Profile & Settings states
  const [connectPartnerCode, setConnectPartnerCode] = useState("");
  const [editDisplayNameOpen, setEditDisplayNameOpen] = useState(false);

  // Load state on mount
  useEffect(() => {
    DB.init();
    loadState();
    setIsMounted(true);
    
    if (typeof window !== "undefined" && window.location.search.includes("dev=true")) {
      setShowDevToolbar(true);
    }

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

  function loadState() {
    const activeUserId = localStorage.getItem(DB.KEYS.ACTIVE_USER);
    const users = DB.get(DB.KEYS.USERS);
    const spaces = DB.get(DB.KEYS.SPACES);

    if (activeUserId) {
      const user = users.find((u) => u.id === activeUserId);
      if (user) {
        setCurrentUser(user);
        setProfileName(user.name);
        setProfileImagePreview(user.avatarUrl || null);

        if (user.currentSpaceId) {
          const space = spaces.find((s) => s.id === user.currentSpaceId);
          if (space) {
            setCurrentSpace(space);
            const partnerId = space.creatorId === user.id ? space.partnerId : space.creatorId;
            const partner = users.find((p) => p.id === partnerId);
            setPartnerUser(partner || null);

            // Load Love Letters, Drawings, Dates, Touch Pings, Diary, Game Scores
            setLoveLetters(DB.getLoveLetters(space.id));
            setDatePlans(DB.getDatePlans(space.id));
            setCurrentDrawing(DB.getDrawing(space.id));
            setTouchPings(DB.getTouchPings(space.id));
            setDiaryEntries(DB.getDiaryEntries(space.id, user.id));
            const cachedScores = DB.getGameScores(space.id);
            setGameScores(cachedScores);

            fetch(`/api/scoreboard?spaceId=${space.id}&userId=${user.id}`)
              .then(res => res.json())
              .then(data => {
                if (data && data.gameScores) {
                  setGameScores(data.gameScores);
                  localStorage.setItem(DB.KEYS.GAME_SCORES, JSON.stringify(data.gameScores));
                }
              })
              .catch(err => console.error("Error fetching scoreboard:", err));
          } else {
            setCurrentSpace(null);
            setPartnerUser(null);
            setLoveLetters([]);
            setDatePlans([]);
            setCurrentDrawing(null);
            setTouchPings([]);
            setDiaryEntries([]);
            setGameScores([]);
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
  }

  function clearUserState() {
    setCurrentUser(null);
    setCurrentSpace(null);
    setPartnerUser(null);
    setLoveLetters([]);
    setDatePlans([]);
    setCurrentDrawing(null);
    setTouchPings([]);
    setDiaryEntries([]);
    setGameScores([]);
    setCurrentView("landing");
  }

  useEffect(() => {
    if (!generatedSpace) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/spaces/status?spaceId=${generatedSpace.id}`);
        const data = await res.json();
        
        if (data && data.status === "active" && data.partnerId) {
          clearInterval(interval);
          
          // Sync backend space down to client-side localStorage
          const localSpaces = DB.get(DB.KEYS.SPACES);
          const index = localSpaces.findIndex(s => s.id === data.space.id);
          if (index > -1) {
            localSpaces[index] = data.space;
          } else {
            localSpaces.push(data.space);
          }
          DB.set(DB.KEYS.SPACES, localSpaces);

          // Update current user currentSpaceId
          const localUsers = DB.get(DB.KEYS.USERS);
          const user = localUsers.find(u => u.id === currentUser.id);
          if (user) {
            user.currentSpaceId = data.space.id;
            DB.set(DB.KEYS.USERS, localUsers);
          }

          // Trigger loading state updates
          loadState();
          // Reset states
          setGeneratedCode(null);
          setGeneratedSpace(null);
        }
      } catch (e) {
        console.error("Status polling failed:", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [generatedSpace, currentUser]);

  // Scoreboard Polling Sync
  useEffect(() => {
    if (currentView !== "scoreboard" || !currentSpace || !currentUser) return;

    const fetchScoreboard = () => {
      fetch(`/api/scoreboard?spaceId=${currentSpace.id}&userId=${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            if (data.gameScores) {
              setGameScores(data.gameScores);
              localStorage.setItem(DB.KEYS.GAME_SCORES, JSON.stringify(data.gameScores));
            }
            if (data.recentSessions) {
              setRecentSessions(data.recentSessions);
            }
          }
        })
        .catch(err => console.error("Error polling scoreboard:", err));
    };

    fetchScoreboard();
    const interval = setInterval(fetchScoreboard, 5000);
    return () => clearInterval(interval);
  }, [currentView, currentSpace, currentUser]);

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

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    if (confirm("WARNING: Are you sure you want to permanently delete your account? This will delete all your data and cannot be undone.")) {
      const users = DB.get(DB.KEYS.USERS);
      const filtered = users.filter(u => u.id !== currentUser.id);
      DB.set(DB.KEYS.USERS, filtered);
      
      if (currentSpace) {
        const spaces = DB.get(DB.KEYS.SPACES);
        const updatedSpaces = spaces.filter(s => s.id !== currentSpace.id);
        DB.set(DB.KEYS.SPACES, updatedSpaces);
      }
      
      handleLogout();
      alert("Your account has been deleted.");
    }
  };

  // ONBOARDING ACTIONS
  const handleCreateSpace = async () => {
    if (!currentUser) return;
    setOnboardLoading(true);
    setOnboardError(null);
    try {
      const res = await fetch("/api/spaces/create-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relationshipMode: onboardMode,
          creatorId: currentUser.id
        })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Sync space object to local storage client DB so client has it registered
      const localSpaces = DB.get(DB.KEYS.SPACES);
      localSpaces.push(data.space);
      DB.set(DB.KEYS.SPACES, localSpaces);

      // Link current user
      const localUsers = DB.get(DB.KEYS.USERS);
      const user = localUsers.find(u => u.id === currentUser.id);
      if (user) {
        user.currentSpaceId = data.space.id;
        DB.set(DB.KEYS.USERS, localUsers);
      }

      setGeneratedCode(data.space.code);
      setGeneratedSpace(data.space);
      loadState();
    } catch (e) {
      setOnboardError(e.message);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleJoinSpace = async () => {
    if (!currentUser || !onboardCode.trim()) {
      setOnboardError("Please enter an invite code.");
      return;
    }
    setOnboardLoading(true);
    setOnboardError(null);
    try {
      const res = await fetch("/api/spaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: onboardCode.trim(),
          joinerId: currentUser.id
        })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Sync space object to local storage client DB
      const localSpaces = DB.get(DB.KEYS.SPACES);
      const index = localSpaces.findIndex(s => s.id === data.space.id);
      if (index > -1) {
        localSpaces[index] = data.space;
      } else {
        localSpaces.push(data.space);
      }
      DB.set(DB.KEYS.SPACES, localSpaces);

      // Link current user
      const localUsers = DB.get(DB.KEYS.USERS);
      const user = localUsers.find(u => u.id === currentUser.id);
      if (user) {
        user.currentSpaceId = data.space.id;
        DB.set(DB.KEYS.USERS, localUsers);
      }

      loadState();
    } catch (e) {
      setOnboardError(e.message);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.startsWith("BU")) {
      value = value.slice(2);
    }
    if (value.length > 6) value = value.slice(0, 6);
    
    let formatted = "BU";
    if (value.length > 0) formatted += `-${value.slice(0, 4)}`;
    if (value.length > 4) formatted += `-${value.slice(4, 6)}`;
    
    setOnboardCode(value.length === 0 ? "" : formatted);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    const directLink = `${window.location.origin}/?code=${generatedCode}`;
    navigator.clipboard.writeText(directLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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
      if (profileImagePreview) {
        u.avatarUrl = profileImagePreview;
      } else {
        delete u.avatarUrl;
      }
      DB.set(DB.KEYS.USERS, users);
      loadState();
      alert("Profile saved!");
    }
  };

  const handleSendLetter = () => {
    if (!loveLetterInput.trim() || !currentSpace || !currentUser) return;
    DB.sendLoveLetter(currentSpace.id, currentUser.id, currentUser.name, loveLetterInput.trim());
    setLoveLetterInput("");
    loadState();
    alert("Love Letter sealed and sent! ✉️");
  };

  const handleSaveDate = () => {
    if (!dateTitle.trim() || !dateVal || !dateLocation.trim() || !currentSpace) {
      alert("Title, Date, and Location are required!");
      return;
    }
    DB.addDatePlan(currentSpace.id, dateTitle.trim(), new Date(dateVal).toISOString(), dateLocation.trim(), dateDesc.trim());
    setDateTitle("");
    setDateVal("");
    setDateLocation("");
    setDateDesc("");
    loadState();
  };

  const handleToggleDateItem = (dateId, itemId) => {
    if (!currentSpace) return;
    DB.toggleDateBucketItem(currentSpace.id, dateId, itemId);
    loadState();
  };

  const handleDeleteDate = (dateId) => {
    if (!currentSpace) return;
    DB.deleteDatePlan(currentSpace.id, dateId);
    loadState();
  };

  const handleHeartTouch = () => {
    if (!currentSpace || !currentUser) return;
    DB.sendTouchPing(currentSpace.id, currentUser.id, currentUser.name);
    loadState();
    
    // Trigger floating hearts animation
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: Math.random(),
      x: 30 + Math.random() * 40,
      y: 80 - Math.random() * 20
    }));
    setFloatingHearts(newHearts);
    setTimeout(() => {
      setFloatingHearts([]);
    }, 2000);
  };

  const handleSaveCanvasDrawing = (dataUrl) => {
    if (!currentSpace || !currentUser) return;
    DB.saveDrawing(currentSpace.id, currentUser.id, dataUrl);
    loadState();
    alert("Drawing shared with your partner! 🎨");
  };

  const handleSaveDiaryEntry = () => {
    if (!diaryTitleInput.trim() || !diaryContentInput.trim() || !currentSpace || !currentUser) {
      alert("Title and Note Content are required!");
      return;
    }
    DB.addDiaryEntry(
      currentSpace.id,
      currentUser.id,
      diaryTitleInput.trim(),
      diaryContentInput.trim(),
      diaryCategoryInput,
      diaryDateInput,
      diaryImageInput
    );
    setDiaryTitleInput("");
    setDiaryContentInput("");
    setDiaryCategoryInput("Things I Notice");
    setDiaryDateInput("");
    setDiaryImageInput(null);
    setDiaryModalOpen(false);
    loadState();
  };

  const handleDeleteDiaryEntry = (entryId) => {
    if (!currentSpace || !currentUser) return;
    if (confirm("Are you sure you want to delete this diary entry?")) {
      DB.deleteDiaryEntry(currentSpace.id, currentUser.id, entryId);
      loadState();
    }
  };

  const handleDiaryImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDiaryImageInput(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleIncrementScore = (gameId, winnerType) => {
    if (!currentSpace || !currentUser) return;
    
    // Optimistic Update
    setGameScores(prev => prev.map(game => {
      if (game.gameId === gameId) {
        if (winnerType === 'user') return { ...game, userScore: (game.userScore || 0) + 1 };
        if (winnerType === 'partner') return { ...game, partnerScore: (game.partnerScore || 0) + 1 };
        if (winnerType === 'draw') return { ...game, draws: (game.draws || 0) + 1 };
      }
      return game;
    }));

    // Local Storage backup
    DB.updateGameScore(currentSpace.id, gameId, winnerType);

    // Server-side Log
    fetch("/api/scoreboard/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleId: currentSpace.id,
        gameType: gameId,
        winnerId: winnerType === 'user' ? currentUser.id : (winnerType === 'partner' && partnerUser ? partnerUser.id : null),
        isDraw: winnerType === 'draw'
      })
    })
    .then(res => res.json())
    .then(() => {
      loadState();
    })
    .catch(err => console.error("Error recording score:", err));
  };

  const handleResetScores = () => {
    if (!currentSpace) return;
    if (confirm("Are you sure you want to reset all game scores? This cannot be undone.")) {
      // Optimistic Clear
      setGameScores(prev => prev.map(game => ({ ...game, userScore: 0, partnerScore: 0, draws: 0 })));
      DB.resetGameScores(currentSpace.id);

      fetch("/api/scoreboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupleId: currentSpace.id })
      })
      .then(res => res.json())
      .then(() => {
        loadState();
      })
      .catch(err => console.error("Error resetting scores:", err));
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfileImage = () => {
    setProfileImagePreview(null);
    const users = DB.get(DB.KEYS.USERS);
    const u = users.find((x) => x.id === currentUser.id);
    if (u) {
      delete u.avatarUrl;
      DB.set(DB.KEYS.USERS, users);
    }
    loadState();
  };

  const handleConnectPartner = async (code) => {
    setOnboardLoading(true);
    try {
      const res = await fetch("/api/spaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          joinerId: currentUser.id
        })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      const localSpaces = DB.get(DB.KEYS.SPACES);
      const index = localSpaces.findIndex(s => s.id === data.space.id);
      if (index > -1) {
        localSpaces[index] = data.space;
      } else {
        localSpaces.push(data.space);
      }
      DB.set(DB.KEYS.SPACES, localSpaces);

      const localUsers = DB.get(DB.KEYS.USERS);
      const user = localUsers.find(u => u.id === currentUser.id);
      if (user) {
        user.currentSpaceId = data.space.id;
        DB.set(DB.KEYS.USERS, localUsers);
      }
      loadState();
      alert("Successfully connected spaces! 🎉");
    } catch (e) {
      alert(e.message);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleUpdateDisplayName = (newName) => {
    if (!newName.trim()) return;
    const users = DB.get(DB.KEYS.USERS);
    const u = users.find((x) => x.id === currentUser.id);
    if (u) {
      u.name = newName.trim();
      DB.set(DB.KEYS.USERS, users);
      loadState();
      alert("Display name updated!");
    }
  };

  const handleProfileImageChangeAndSave = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setProfileImagePreview(dataUrl);
      
      const users = DB.get(DB.KEYS.USERS);
      const u = users.find((x) => x.id === currentUser.id);
      if (u) {
        u.avatarUrl = dataUrl;
        DB.set(DB.KEYS.USERS, users);
        loadState();
      }
    };
    reader.readAsDataURL(file);
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
      
      <div id="app-container" className="relative z-10 flex w-screen h-screen overflow-hidden bg-[#121212] text-white">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
        )}

        {/* Navigation Sidebar (Desktop & Mobile) */}
        {currentUser && currentView !== "onboarding" && currentSpace && (
          <aside className={`sidebar bg-[#161413] border-r border-[#24211E] shadow-sm py-8 px-4 z-50 transition-all duration-300 flex flex-col justify-between flex-shrink-0 w-64 ${mobileSidebarOpen ? "mobile-open" : ""}`}>
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
                <span className="font-label-md text-label-md">Closer</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "memories" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("memories"); }}>
                <span className="material-symbols-outlined">auto_stories</span>
                <span className="font-label-md text-label-md">Feed</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "diary" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("diary"); }}>
                <span className="material-symbols-outlined">book</span>
                <span className="font-label-md text-label-md">Diary</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "scoreboard" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("scoreboard"); }}>
                <span className="material-symbols-outlined">leaderboard</span>
                <span className="font-label-md text-label-md">Scoreboard</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "insights" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("insights"); }}>
                <span className="material-symbols-outlined">insights</span>
                <span className="font-label-md text-label-md">Insights</span>
              </a>
              <a href="#" className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/30 hover:text-primary transition-all scale-98 active:scale-95 duration-200 ${currentView === "profile" || currentView === "settings" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); navigateTo("profile"); }}>
                <span className="material-symbols-outlined">person</span>
                <span className="font-label-md text-label-md">Profile</span>
              </a>
            </nav>

            {/* Sidebar User Footer */}
            <div className="sidebar-footer" style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "20px" }}>
              {renderAvatar(currentUser, "w-9 h-9", "text-sm")}
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
        <div className="flex-grow flex-shrink flex-1 min-w-0 h-full flex flex-col overflow-y-auto">
          {currentView === "profile" ? (
            <ProfilePage
              user={currentUser}
              partner={partnerUser}
              inviteCode={currentSpace ? currentSpace.code : "VPRSQSYV"}
              onConnectPartner={handleConnectPartner}
              onNavigate={navigateTo}
              onOpenSettings={() => navigateTo("settings")}
              profileImagePreview={profileImagePreview}
              onProfileImageChange={handleProfileImageChangeAndSave}
            />
          ) : currentView === "settings" ? (
            <SettingsPage
              user={currentUser}
              onBack={() => navigateTo("profile")}
              onSubscription={() => alert("Tend App Pro upgraded! All space features unlocked.")}
              onRestorePurchases={() => alert("Purchases restored successfully.")}
              onNotifications={() => alert("Notification settings saved.")}
              onWidgets={() => alert("Countdown and Canvas widgets synced with home screen.")}
              onDisplayName={handleUpdateDisplayName}
              onSignOut={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onFeedback={() => alert("Thank you for your feedback! It has been submitted to the Tend team.")}
              onTerms={() => alert("Terms of Service updated for 2026.")}
              onPrivacy={() => alert("Privacy Policy: Your data is encrypted locally.")}
            />
          ) : (
            <>
              {/* Top Header Bar */}
              {currentUser && currentView !== "landing" && currentView !== "onboarding" && currentView !== "scoreboard" && currentSpace && (
            <header className="sticky top-0 z-20 w-full bg-[#161413] border-b border-[#24211E] px-8 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile Hamburger Button */}
                <button className="text-orange-400 flex lg:hidden items-center justify-center cursor-pointer bg-transparent border-0 mr-1" onClick={() => setMobileSidebarOpen(true)}>
                  <span className="material-symbols-outlined text-2xl">menu</span>
                </button>
                <h1 className="text-xl font-bold tracking-tight text-white font-cursive capitalize">
                  {currentView === "home" ? `Hello, ${currentUser.name}` : currentView}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-[#2A1D15] border border-[#42281D] px-3 py-1 rounded-full text-xs font-semibold text-[#E58B58]">
                  🔥 {currentSpace.streakDays} Day Streak
                </div>
                <div className="flex items-center gap-1">
                  {renderAvatar(currentUser, "w-7 h-7 border border-[#E58B58]/40", "text-xs font-bold")}
                  <span className="w-3 h-0.5 bg-stone-600"></span>
                  {partnerUser ? (
                    renderAvatar(partnerUser, "w-7 h-7 border border-[#6C8EEF]/40", "text-xs font-bold")
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-stone-400 text-xs border border-white/10 animate-pulse">
                      ?
                    </div>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Scrollable Page Body */}
          <main className="flex-grow flex-shrink flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
          {currentView === "onboarding" && (
            <section className="view-container active-view w-full max-w-[600px] mx-auto py-6 px-4 md:py-12 md:px-8">
              <div className="glass-card flex flex-col gap-6">
                <div>
                  <h2 className="text-3xl font-bold font-headline-sm text-primary mb-1">Let's connect your space</h2>
                  <p className="text-on-surface-variant">Create a private space or join your partner's existing space.</p>
                </div>

                {onboardError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 text-center font-semibold">
                    ⚠️ {onboardError}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Join Space */}
                  <div className="p-6 bg-white/20 rounded-2xl border border-white/30 space-y-4">
                    <h3 className="text-lg font-bold">Have an Invite Code?</h3>
                    <div className="space-y-3">
                      <input type="text" className="input-field w-full uppercase font-mono text-center tracking-widest font-bold" placeholder="BU-XXXX-XX" value={onboardCode} onChange={handleCodeChange} />
                      <button className="btn btn-primary w-full py-3.5 flex justify-center items-center gap-2" onClick={handleJoinSpace} disabled={onboardLoading}>
                        {onboardLoading ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-center font-bold text-on-surface-variant/50">OR</div>

                  {/* Create Space */}
                  <div className="p-6 bg-stone-800/40 rounded-3xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                    <h3 className="text-xl font-bold font-cursive text-amber-300">
                      {generatedCode ? `Invite ${partnerOnboardName || "Partner"}` : "Create a New Space"}
                    </h3>
                    {generatedCode ? (
                      <div className="space-y-4 text-center">
                        <p className="text-sm text-stone-300">Copy and send this direct invitation link to your partner:</p>
                        <div className="py-4 px-6 bg-black/35 rounded-2xl border border-white/15 font-mono text-xs font-semibold text-orange-200 text-center select-all break-all select-none">
                          {`${typeof window !== 'undefined' ? window.location.origin : ''}/?code=${generatedCode}`}
                        </div>
                        <button className="btn btn-primary w-full py-3.5 flex justify-center items-center gap-2 btn-terracotta" onClick={handleCopyCode}>
                          <span className="material-symbols-outlined text-[20px]">content_copy</span>
                          {copySuccess ? "Copied Link! ✨" : "Copy Invite Link"}
                        </button>
                        <div className="flex items-center justify-center gap-2 text-xs text-stone-400 mt-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Waiting for your partner to join...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="input-group">
                          <label className="input-label text-xs uppercase tracking-widest text-stone-400 font-bold">Who is your partner? (e.g. Fareedah)</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Enter partner's name"
                            value={partnerOnboardName}
                            onChange={(e) => setPartnerOnboardName(e.target.value)}
                          />
                        </div>

                        <label className="input-label text-xs uppercase tracking-widest text-stone-400 font-bold">Select Relationship Mode</label>
                        
                        <div className="grid grid-cols-2 gap-3 w-full">
                          {[
                            { value: "couple", label: "Couples", emoji: "💖" },
                            { value: "marriage", label: "Marriage", emoji: "💍" },
                            { value: "long_distance", label: "Long-Distance", emoji: "🌍" },
                            { value: "friends", label: "Friends", emoji: "👥" },
                            { value: "family", label: "Family", emoji: "🏡" },
                            { value: "custom", label: "Custom Space", emoji: "✨" }
                          ].map((mode) => {
                            const isSelected = onboardMode === mode.value;
                            return (
                              <button
                                key={mode.value}
                                type="button"
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 relative cursor-pointer group ${
                                  isSelected 
                                    ? "border-rose-400 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.25)] text-primary" 
                                    : "bg-white/5 border-white/10 hover:border-white/20 text-on-surface-variant/90 hover:text-white"
                                }`}
                                onClick={() => setOnboardMode(mode.value)}
                              >
                                <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110">{mode.emoji}</span>
                                <span className="text-xs font-semibold tracking-wide text-center">{mode.label}</span>
                                
                                {isSelected && (
                                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)] animate-pulse" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <button className="btn btn-primary w-full py-4 flex justify-center items-center gap-2 mt-2" onClick={handleCreateSpace} disabled={onboardLoading}>
                          {onboardLoading ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            "Generate Invite Code"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Onboarding Exit path */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-2">
                  <p className="text-xs text-on-surface-variant">Signed in as <span className="font-semibold">{currentUser?.name}</span></p>
                  <button className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-0" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* VIEW: HOME DASHBOARD */}
          {currentView === "home" && currentSpace && (
            <section className="view-container active-view w-full max-w-[1100px] mx-auto py-6 px-4 pb-32 md:py-12 md:px-8 md:pb-32">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left/Main Columns */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Grid Container (Side-by-side 2-columns) */}
                  <div className="grid grid-cols-2 gap-3 px-4 w-full select-none">
                    
                    {/* Promo Card 1: Daily Connection Ritual */}
                    <div className="bg-[#3D261A] border border-[#C87545]/40 p-3.5 rounded-2xl flex flex-col justify-between h-[160px] shadow-lg w-full">
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center gap-1.5 text-orange-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-xs">local_fire_department</span>
                            <span>Streak</span>
                          </div>
                          <h4 className="text-[11px] leading-snug font-semibold text-white line-clamp-2">
                            {todayQuestion ? todayQuestion.text : "Answer today's prompt to keep your streak alive!"}
                          </h4>
                        </div>
                        <button 
                          onClick={() => setCurrentView("daily")}
                          className="text-xs py-1.5 px-2.5 rounded-lg w-full text-center mt-auto font-medium text-orange-200 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 transition-all cursor-pointer"
                        >
                          {myAnswer ? "Responses" : "Answer"}
                        </button>
                      </div>
                    </div>

                    {/* Promo Card 2: Draw Together */}
                    <div className="bg-[#2C2640] border border-[#4A3E6D]/40 p-3.5 rounded-2xl flex flex-col justify-between h-[160px] shadow-lg w-full">
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center gap-1.5 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-xs">brush</span>
                            <span>Canvas</span>
                          </div>
                          <h4 className="text-[11px] leading-snug font-semibold text-white line-clamp-2">
                            Sketch, draw, and share real-time doodles with each other.
                          </h4>
                        </div>
                        <button 
                          onClick={() => setActiveActivityModal('draw')}
                          className="text-xs py-1.5 px-2.5 rounded-lg w-full text-center mt-auto font-medium text-indigo-200 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all cursor-pointer"
                        >
                          Sketch
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Partner Status Card */}
                  <section className="flex flex-col sm:flex-row items-center sm:text-left text-center gap-6 p-6 bg-stone-900/40 rounded-3xl border border-white/10 relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-subtle-pulse -m-1.5 blur-md"></div>
                      <div className="w-full h-full rounded-full border border-orange-400/30 relative z-10 overflow-hidden flex items-center justify-center text-white text-3xl font-bold bg-stone-850">
                        {partnerUser ? (
                          partnerUser.avatarUrl ? (
                            <img className="w-full h-full object-cover" src={partnerUser.avatarUrl} alt={partnerUser.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-cursive" style={{ background: partnerUser.avatarColor }}>
                              {partnerUser.name[0].toUpperCase()}
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400 text-xl font-cursive">
                            ?
                          </div>
                        )}
                      </div>
                      {partnerUser && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-stone-900 z-20 animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h2 className="font-cursive text-3xl text-orange-200 font-bold">{partnerUser ? `${partnerUser.name} & Me` : currentUser.name}</h2>
                        {partnerUser && (
                          <span className="bg-stone-850/80 border border-white/10 rounded-full px-3 py-0.5 text-xs flex items-center gap-1 shadow-md text-stone-300">
                            <span>{partnerUser.mood || "😐"}</span> {partnerUser.moodLabel || "Okay"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 font-medium tracking-wide">
                        {currentSpace.relationshipMode.replace("_", " ").toUpperCase()} SPACE • 🔥 {currentSpace.streakDays} DAY STREAK
                      </p>
                    </div>
                  </section>

                  {/* 2x2 Action Grid */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 pl-1">Intimate Sanctuary Grid</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Grid Item 1: Love Letter */}
                      <button 
                        onClick={() => setActiveActivityModal('love_letter_write')}
                        className="glass-card flex flex-col items-start text-left p-6 rounded-3xl border border-white/10 bg-stone-850/20 hover:bg-stone-800/20 transition-all cursor-pointer group"
                      >
                        <span className="material-symbols-outlined text-orange-400 text-3xl mb-4 group-hover:scale-110 transition-transform">favorite</span>
                        <h4 className="text-base font-bold text-white mb-1">Love Letter</h4>
                        <p className="text-xs text-stone-400 leading-relaxed">Seal private notes and digital love letters for each other.</p>
                      </button>

                      {/* Grid Item 2: Draw Together */}
                      <button 
                        onClick={() => setActiveActivityModal('draw')}
                        className="glass-card flex flex-col items-start text-left p-6 rounded-3xl border border-white/10 bg-stone-850/20 hover:bg-stone-800/20 transition-all cursor-pointer group"
                      >
                        <span className="material-symbols-outlined text-orange-400 text-3xl mb-4 group-hover:scale-110 transition-transform">brush</span>
                        <h4 className="text-base font-bold text-white mb-1">Draw Together</h4>
                        <p className="text-xs text-stone-400 leading-relaxed">Sketch turn-based canvas paintings or fun doodles.</p>
                      </button>

                      {/* Grid Item 3: Plan a Date */}
                      <button 
                        onClick={() => setActiveActivityModal('date_planner')}
                        className="glass-card flex flex-col items-start text-left p-6 rounded-3xl border border-white/10 bg-stone-850/20 hover:bg-stone-800/20 transition-all cursor-pointer group"
                      >
                        <span className="material-symbols-outlined text-orange-400 text-3xl mb-4 group-hover:scale-110 transition-transform">calendar_today</span>
                        <h4 className="text-base font-bold text-white mb-1">Plan a Date</h4>
                        <p className="text-xs text-stone-400 leading-relaxed">Shared calendar itinerary, checklists, and ticking countdowns.</p>
                      </button>

                      {/* Grid Item 4: Rituals Checklist */}
                      <button 
                        onClick={() => setCurrentView("daily")}
                        className="glass-card flex flex-col items-start text-left p-6 rounded-3xl border border-white/10 bg-stone-850/20 hover:bg-stone-800/20 transition-all cursor-pointer group"
                      >
                        <span className="material-symbols-outlined text-orange-400 text-3xl mb-4 group-hover:scale-110 transition-transform">auto_awesome</span>
                        <h4 className="text-base font-bold text-white mb-1">Connection Rituals</h4>
                        <p className="text-xs text-stone-400 leading-relaxed">Answer daily reflection prompts and complete challenges.</p>
                      </button>

                      {/* Grid Item 5: Couples Games / Scoreboard */}
                      <button 
                        onClick={() => setCurrentView("scoreboard")}
                        className="glass-card flex flex-col items-start text-left p-6 rounded-3xl border border-white/10 bg-stone-850/20 hover:bg-stone-800/20 transition-all cursor-pointer group"
                      >
                        <span className="material-symbols-outlined text-orange-400 text-3xl mb-4 group-hover:scale-110 transition-transform">sports_esports</span>
                        <h4 className="text-base font-bold text-white mb-1">Couples Games</h4>
                        <p className="text-xs text-stone-400 leading-relaxed">Play Link Four, Word Duel, Memory Match, and view scoreboards.</p>
                      </button>

                      {/* Grid Item 6: Private Diary */}
                      <button 
                        onClick={() => setCurrentView("diary")}
                        className="glass-card flex flex-col items-start text-left p-6 rounded-3xl border border-white/10 bg-stone-850/20 hover:bg-stone-800/20 transition-all cursor-pointer group"
                      >
                        <span className="material-symbols-outlined text-orange-400 text-3xl mb-4 group-hover:scale-110 transition-transform">book</span>
                        <h4 className="text-base font-bold text-white mb-1">Private Diary</h4>
                        <p className="text-xs text-stone-400 leading-relaxed">Notice things about your partner — moments, story hints, reminders.</p>
                      </button>
                    </div>
                  </div>

                  {/* Heart / Touch Button Nudge */}
                  <div className="flex flex-col items-center justify-center p-6 bg-stone-850/20 border border-white/10 rounded-3xl text-center relative overflow-hidden w-full">
                    <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <h3 className="text-lg font-bold text-white mb-2">Send Instant Touch</h3>
                    <p className="text-sm text-stone-300 leading-relaxed w-full max-w-[260px] mx-auto text-center mb-6">
                      Tap the heart to send a silent haptic ping of love and nudge your partner in real-time.
                    </p>
                    
                    <button 
                      onClick={handleHeartTouch}
                      className="w-20 h-20 rounded-full bg-[#D9885C] flex items-center justify-center border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer relative group mb-2"
                    >
                      <span className="material-symbols-outlined text-white text-3xl animate-pulse fill-current">favorite</span>
                      <span className="absolute inset-0 rounded-full border border-orange-400 animate-ping opacity-75 group-hover:animation-duration-1000"></span>
                    </button>
                  </div>

                  {/* Mood Check-In */}
                  <div className="glass-card mood-widget rounded-3xl p-6 border border-white/10 bg-stone-850/20">
                    <div>
                      <h3 className="text-base font-bold text-white">How are you feeling today?</h3>
                      <p className="text-xs text-stone-400 mb-4">Set your mood accent color in our shared space.</p>
                    </div>

                    <div className="mood-options-list flex flex-wrap gap-2">
                      {[
                        { emoji: "😊", label: "Great", activeClass: "active-mood-great" },
                        { emoji: "🙂", label: "Good", activeClass: "active-mood-good" },
                        { emoji: "😐", label: "Okay", activeClass: "active-mood-okay" },
                        { emoji: "😔", label: "Not Great", activeClass: "active-mood-notgreat" },
                        { emoji: "😢", label: "Difficult", activeClass: "active-mood-difficult" },
                      ].map((m) => (
                        <button
                          key={m.label}
                          className={`mood-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-stone-900/50 hover:bg-white/10 text-xs transition-all duration-200 cursor-pointer ${currentUser.mood === m.emoji ? m.activeClass : ""}`}
                          onClick={() => handleMoodSelect(m.emoji, m.label)}
                        >
                          <span>{m.emoji}</span>
                          <span className="font-semibold">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feed: Shared gallery and updates */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 pl-1">Our Sanctuary Feed</h3>
                    <div className="space-y-4">
                      {currentDrawing && (
                        <div className="p-5 bg-stone-900/40 rounded-2xl border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-orange-400 text-sm">brush</span>
                              <span className="text-xs font-bold text-white">Canvas Artwork Shared</span>
                            </div>
                            <span className="text-[10px] text-stone-500">{new Date(currentDrawing.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="w-full bg-stone-950 rounded-xl overflow-hidden border border-white/5 flex justify-center p-4">
                            <img src={currentDrawing.drawingDataUrl} alt="Shared canvas artwork" className="max-h-[220px] object-contain" />
                          </div>
                        </div>
                      )}

                      {touchPings.length > 0 && (
                        <div className="p-4 bg-stone-900/40 rounded-2xl border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-400 text-sm fill-current">favorite</span>
                            <span className="text-xs font-semibold text-stone-300">
                              <strong className="text-white">{touchPings[touchPings.length - 1].senderName}</strong> sent a cozy heart touch ping.
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500">{new Date(touchPings[touchPings.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}

                      {loveLetters.length > 0 && (
                        <div className="p-4 bg-stone-900/40 rounded-2xl border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-400 text-sm">drafts</span>
                            <span className="text-xs font-semibold text-stone-300">
                              <strong className="text-white">{loveLetters[loveLetters.length - 1].senderName}</strong> sealed a digital note in the mailbox.
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500">{new Date(loveLetters[loveLetters.length - 1].timestamp).toLocaleDateString()}</span>
                        </div>
                      )}

                      {(!currentDrawing && touchPings.length === 0 && loveLetters.length === 0) && (
                        <div className="p-8 bg-stone-800/10 border border-dashed border-white/10 rounded-2xl text-center text-xs text-stone-500">
                          No feed posts yet. Send a heart ping, draw a canvas, or write a love letter to create shared feed moments.
                        </div>
                      )}
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
                        {renderAvatar(partnerUser, "w-10 h-10", "text-sm")}
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

          {/* VIEW: PRIVATE PARTNER DIARY */}
          {currentView === "diary" && currentSpace && (
            <section className="view-container active-view w-full max-w-[650px] mx-auto py-6 px-4 md:py-8 md:px-6 relative pb-32">
              
              {/* Top App Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                {/* Left: Back Home pill */}
                <button 
                  onClick={() => setCurrentView("home")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800/60 hover:bg-stone-850/80 border border-white/10 rounded-full text-xs font-bold text-stone-300 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back_ios</span>
                  <span>Home</span>
                </button>

                {/* Center: Title */}
                <div className="text-center">
                  <span className="text-[10px] tracking-[0.2em] font-bold text-stone-400 uppercase">Diary</span>
                </div>

                {/* Right: Search button toggle */}
                <button 
                  onClick={() => setDiarySearchOpen(!diarySearchOpen)}
                  className={`p-1.5 rounded-full border bg-transparent cursor-pointer transition-all ${diarySearchOpen ? 'border-orange-400 text-orange-350' : 'border-transparent text-stone-400 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
              </div>

              {/* Toggled Search Input Bar */}
              {diarySearchOpen && (
                <div className="mb-6 animate-fade-in-down">
                  <input
                    type="text"
                    className="input-field w-full text-sm py-2.5 px-4"
                    placeholder="Search notes, hints, or category entries..."
                    value={diarySearchQuery}
                    onChange={(e) => setDiarySearchQuery(e.target.value)}
                  />
                </div>
              )}

              {/* Header Privacy Card */}
              <div className="p-6 bg-gradient-to-br from-stone-900 to-stone-950 border border-white/10 rounded-[24px] shadow-lg flex flex-col items-center text-center relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 rounded-full blur-2xl pointer-events-none"></div>
                
                {/* Partner Avatar Circle */}
                <div className="w-16 h-16 rounded-full bg-amber-100/10 border-2 border-[#D9885C] flex items-center justify-center font-cursive text-amber-200 text-3xl font-bold shadow-inner mb-3">
                  {partnerUser ? partnerUser.name[0].toUpperCase() : "?"}
                </div>

                {/* Cursive Name Title */}
                <h3 className="font-cursive text-2xl text-amber-250 leading-tight">
                  {partnerUser ? partnerUser.name : "Your Partner"}
                </h3>
                
                {/* Privacy Badge tagline */}
                <span className="text-[9px] font-bold tracking-[0.15em] text-stone-400 uppercase mt-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[11px] text-[#D9885C]">lock</span>
                  Only you can see this
                </span>
              </div>

              {/* Horizontal Category Filter Chips */}
              <div className="diary-category-chips-row mb-6 select-none">
                {["All", "Things I Notice", "Moments", "Ideas", "Hints", "Remember"].map((cat) => {
                  const isActive = diaryActiveFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setDiaryActiveFilter(cat)}
                      className={`btn-diary-chip ${isActive ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Notes List Rendering */}
              {(() => {
                // Filter entries based on chip selection & search query
                const filtered = diaryEntries.filter((entry) => {
                  const matchesCategory = diaryActiveFilter === "All" || entry.category === diaryActiveFilter;
                  const matchesSearch = !diarySearchQuery || 
                    entry.title.toLowerCase().includes(diarySearchQuery.toLowerCase()) || 
                    entry.content.toLowerCase().includes(diarySearchQuery.toLowerCase()) ||
                    entry.category.toLowerCase().includes(diarySearchQuery.toLowerCase());
                  return matchesCategory && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    /* Empty State View */
                    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-stone-900/15 border border-dashed border-white/10 rounded-[28px] mt-2 select-none flex-shrink-0 w-full">
                      <span className="material-symbols-outlined text-stone-500 text-4xl mb-4">book</span>
                      <h4 className="text-lg font-bold text-white mb-2">Nothing here yet</h4>
                      <p className="w-full max-w-[280px] mx-auto text-center flex-shrink-0 text-xs text-stone-400 leading-relaxed mb-6">
                        This is your private space to notice things about {partnerUser ? partnerUser.name : "your partner"} — moments, stories, hints they drop, things you love.
                      </p>
                      <button 
                        onClick={() => setDiaryModalOpen(true)}
                        className="btn-diary-cta font-body-md"
                      >
                        Add first entry
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filtered.map((entry) => (
                      <div key={entry.id} className="p-5 bg-stone-900/30 border border-white/10 rounded-2xl relative shadow-md group">
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDeleteDiaryEntry(entry.id)}
                          className="absolute top-4 right-4 text-stone-500 hover:text-red-400 text-lg bg-transparent border-0 cursor-pointer transition-colors"
                        >
                          &times;
                        </button>

                        {/* Tag Category & Date Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#D9885C]/15 border border-[#D9885C]/35 text-[9px] font-bold text-orange-300 uppercase tracking-wide">
                            {entry.category}
                          </span>
                          <span className="text-[10px] text-stone-500">{new Date(entry.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>

                        {/* Title */}
                        <h4 className="text-base font-bold text-white mb-2 leading-snug">{entry.title}</h4>

                        {/* Content text */}
                        <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>

                        {/* Optional Image Preview */}
                        {entry.imageUrl && (
                          <div className="mt-4 rounded-xl overflow-hidden border border-white/5 max-h-[200px] flex justify-center bg-black/10">
                            <img 
                              src={entry.imageUrl} 
                              alt="Note attachment" 
                              className="object-contain max-h-[200px] cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setActiveImagePreview(entry.imageUrl)}
                            />
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Floating Action Button (FAB) */}
              <button
                onClick={() => setDiaryModalOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center fab-terracotta border border-white/15 z-40"
              >
                <span className="material-symbols-outlined text-2xl font-bold">add</span>
              </button>

            </section>
          )}

          {/* VIEW: COUPLES GAME SCOREBOARD */}
          {currentView === "scoreboard" && currentSpace && (
            <section className="view-container active-view flex-1 min-w-0 w-full h-screen overflow-y-auto flex flex-col items-center py-8 px-6 lg:px-12 bg-scoreboard-oled rounded-[24px] border border-white/5 shadow-2xl relative select-none">
              
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-24">
                {/* Top App Bar & Header */}
                <div className="flex items-center justify-between border-b border-[#2D2A26] pb-4 w-full">
                  {/* Left Side: Back Arrow & Title */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCurrentView("home")}
                      className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-300 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    </button>
                    <h2 className="text-xl font-bold text-white font-cursive capitalize">Scoreboard & Games</h2>
                  </div>

                  {/* Center: Tab Selector (Pills) */}
                  <div className="flex bg-stone-900/80 border border-[#2D2A26] p-1 rounded-xl">
                    <button 
                      onClick={() => setScoreboardTab("play")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${scoreboardTab === "play" ? "bg-[#D9885C] text-white" : "text-stone-400 hover:text-white bg-transparent"}`}
                    >
                      Games
                    </button>
                    <button 
                      onClick={() => setScoreboardTab("stats")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${scoreboardTab === "stats" ? "bg-[#D9885C] text-white" : "text-stone-400 hover:text-white bg-transparent"}`}
                    >
                      Standings / History
                    </button>
                  </div>

                  {/* Right: Reset/Refresh Icon Button */}
                  <button 
                    onClick={handleResetScores}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-300 hover:text-red-400 transition-all cursor-pointer"
                    title="Reset all game scores"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                  </button>
                </div>

                {/* TAB 1: PLAY AREA */}
                {scoreboardTab === "play" && (
                  <div className="w-full flex flex-col gap-6">
                    {/* Head-to-Head Overall Score Banner */}
                    {(() => {
                      const totalUserWins = gameScores.reduce((acc, game) => acc + (game.userScore || 0), 0);
                      const totalPartnerWins = gameScores.reduce((acc, game) => acc + (game.partnerScore || 0), 0);
                      const totalPlaysAll = gameScores.reduce((acc, game) => acc + (game.userScore || 0) + (game.partnerScore || 0) + (game.draws || 0), 0);
                      
                      let matchStatusText = "Level pegging";
                      let statusEmoji = "handshake";
                      if (totalUserWins > totalPartnerWins) {
                        matchStatusText = "You're ahead";
                        statusEmoji = "emoji_events";
                      } else if (totalPartnerWins > totalUserWins) {
                        matchStatusText = "Partner leads";
                        statusEmoji = "military_tech";
                      }

                      return (
                        <div className="w-full bg-[#1E1C1A] border border-[#2D2A26] rounded-3xl p-6 shadow-xl flex flex-row items-center justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>
                          
                          {/* Left (You) */}
                          <div className="flex flex-col items-center flex-1">
                            <div className="w-12 h-12 rounded-full bg-amber-100/10 border border-[#E58B58]/40 flex items-center justify-center font-bold text-[#E58B58] text-lg shadow-inner mb-1.5">
                              {currentUser ? currentUser.name[0].toUpperCase() : "Y"}
                            </div>
                            <span className="text-3xl font-extrabold text-[#E58B58] tracking-tight">{totalUserWins}</span>
                            <span className="text-xs text-stone-400 font-semibold mt-1">You</span>
                          </div>

                          {/* Center (Status) */}
                          <div className="flex flex-col items-center flex-1 text-center px-2">
                            <span className="material-symbols-outlined text-2xl text-amber-400 mb-1">{statusEmoji}</span>
                            <span className="text-sm font-bold text-white tracking-wide uppercase">
                              {matchStatusText}
                            </span>
                            <span className="text-[10px] text-stone-500 font-medium mt-1">{totalPlaysAll} Rounds Played</span>
                          </div>

                          {/* Right (Partner) */}
                          <div className="flex flex-col items-center flex-1">
                            <div className="w-12 h-12 rounded-full bg-blue-100/10 border border-[#6C8EEF]/40 flex items-center justify-center font-bold text-[#6C8EEF] text-lg shadow-inner mb-1.5">
                              {partnerUser ? partnerUser.name[0].toUpperCase() : "P"}
                            </div>
                            <span className="text-3xl font-extrabold text-[#6C8EEF] tracking-tight">{totalPartnerWins}</span>
                            <span className="text-xs text-stone-400 font-semibold mt-1">Partner</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="text-xs font-semibold tracking-wider text-stone-400 uppercase mb-4 w-full text-left">
                      Select Game to Play
                    </div>

                    {/* 2-Column Responsive Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {gameScores.map((game) => {
                        const descriptions = {
                          link_four: "Drop discs. Align 4 in a row to win.",
                          word_duel: "Set a secret word and guess in 6 tries.",
                          spotted: "Find the matching emoji before they do.",
                          memory: "Flip tiles to match romantic symbol pairs."
                        };
                        const descText = descriptions[game.gameId] || "A fun couples multiplayer challenge.";
                        
                        // Dynamic badge colors for card details
                        let badgeColor = "#E58B58";
                        if (game.gameId === "word_duel") badgeColor = "#818CF8";
                        if (game.gameId === "spotted") badgeColor = "#2DD4BF";
                        if (game.gameId === "memory") badgeColor = "#34D399";

                        const totalPlaysForGame = (game.userScore || 0) + (game.partnerScore || 0) + (game.draws || 0);

                        return (
                          <div 
                            key={game.gameId} 
                            className="bg-[#1E1C1A] border border-[#2D2A26] rounded-2xl p-5 hover:border-[#E58B58]/40 transition-all flex flex-col justify-between h-44 w-full shadow-md animate-fadeIn"
                          >
                            {/* Top Row: Icon badge + Title + Status */}
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                                  style={{ backgroundColor: `${badgeColor}15`, border: `1px solid ${badgeColor}35` }}
                                >
                                  <span className="material-symbols-outlined text-[20px]" style={{ color: badgeColor }}>
                                    {game.icon || 'sports_esports'}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-white leading-none mb-1">{game.name}</h4>
                                  <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{totalPlaysForGame} games played</p>
                                </div>
                              </div>
                            </div>

                            {/* Middle Row: Description & Score Pill */}
                            <div className="flex items-center justify-between w-full my-1 gap-2">
                              <span className="text-xs text-stone-400 truncate flex-1">{descText}</span>
                              <div className="bg-stone-900/60 border border-[#2D2A26] px-2.5 py-0.5 rounded-full text-[10px] text-stone-300 font-bold tracking-wide flex-shrink-0">
                                You {game.userScore || 0} - {game.partnerScore || 0} Partner
                              </div>
                            </div>

                            {/* Bottom Row: Play Game action button */}
                            <button 
                              onClick={() => setActiveGameModal(game.gameId)}
                              className="bg-[#D9885C] hover:bg-[#c6764b] text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all self-end w-full sm:w-auto"
                            >
                              <span className="material-symbols-outlined text-sm">play_arrow</span>
                              Play Game
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: STANDINGS & STATS AREA */}
                {scoreboardTab === "stats" && (
                  <div className="w-full flex flex-col gap-6">
                    {/* Head-to-Head Overall Score Banner */}
                    {(() => {
                      const totalUserWins = gameScores.reduce((acc, game) => acc + (game.userScore || 0), 0);
                      const totalPartnerWins = gameScores.reduce((acc, game) => acc + (game.partnerScore || 0), 0);
                      const totalPlaysAll = gameScores.reduce((acc, game) => acc + (game.userScore || 0) + (game.partnerScore || 0) + (game.draws || 0), 0);
                      
                      let matchStatusText = "Level pegging";
                      let statusEmoji = "handshake";
                      if (totalUserWins > totalPartnerWins) {
                        matchStatusText = "You're ahead";
                        statusEmoji = "emoji_events";
                      } else if (totalPartnerWins > totalUserWins) {
                        matchStatusText = "Partner leads";
                        statusEmoji = "military_tech";
                      }

                      return (
                        <div className="w-full bg-[#1E1C1A] border border-[#2D2A26] rounded-3xl p-6 shadow-xl flex flex-row items-center justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 rounded-full blur-2xl pointer-events-none"></div>
                          
                          {/* Left (You) */}
                          <div className="flex flex-col items-center flex-1">
                            <div className="w-12 h-12 rounded-full bg-amber-100/10 border border-[#E58B58]/40 flex items-center justify-center font-bold text-[#E58B58] text-lg shadow-inner mb-1.5">
                              {currentUser ? currentUser.name[0].toUpperCase() : "Y"}
                            </div>
                            <span className="text-3xl font-extrabold text-[#E58B58] tracking-tight">{totalUserWins}</span>
                            <span className="text-xs text-stone-400 font-semibold mt-1">You</span>
                          </div>

                          {/* Center (Status) */}
                          <div className="flex flex-col items-center flex-1 text-center px-2">
                            <span className="material-symbols-outlined text-2xl text-amber-400 mb-1">{statusEmoji}</span>
                            <span className="text-sm font-bold text-white tracking-wide uppercase">
                              {matchStatusText}
                            </span>
                            <span className="text-[10px] text-stone-500 font-medium mt-1">{totalPlaysAll} Rounds Played</span>
                          </div>

                          {/* Right (Partner) */}
                          <div className="flex flex-col items-center flex-1">
                            <div className="w-12 h-12 rounded-full bg-blue-100/10 border border-[#6C8EEF]/40 flex items-center justify-center font-bold text-[#6C8EEF] text-lg shadow-inner mb-1.5">
                              {partnerUser ? partnerUser.name[0].toUpperCase() : "P"}
                            </div>
                            <span className="text-3xl font-extrabold text-[#6C8EEF] tracking-tight">{totalPartnerWins}</span>
                            <span className="text-xs text-stone-400 font-semibold mt-1">Partner</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Rivalry Breakdown Section */}
                    <div className="flex flex-col items-stretch space-y-3">
                      <div className="mb-1">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[#8A847F] uppercase">Rivalry Breakdown</span>
                      </div>

                      <div className="space-y-4 flex flex-col items-stretch">
                        {gameScores.map((game) => {
                          const totalPlays = (game.userScore || 0) + (game.partnerScore || 0) + (game.draws || 0);
                          const userPct = totalPlays > 0 ? ((game.userScore || 0) / totalPlays) * 100 : 0;
                          const drawPct = totalPlays > 0 ? ((game.draws || 0) / totalPlays) * 100 : 0;
                          const partnerPct = totalPlays > 0 ? ((game.partnerScore || 0) / totalPlays) * 100 : 0;

                          return (
                            <div key={game.gameId} className="w-full bg-[#1E1C1A] border border-[#2D2A26] rounded-3xl p-5 flex flex-col gap-4 shadow-md">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-base" style={{ color: game.color }}>
                                    {game.icon || 'sports_esports'}
                                  </span>
                                  <h4 className="text-xs font-bold text-white">{game.name}</h4>
                                </div>
                                <span className="text-[9px] text-[#8A847F] font-semibold uppercase">{totalPlays} Played</span>
                              </div>

                              {/* Custom CSS Win Split Bar */}
                              {totalPlays > 0 ? (
                                <div className="w-full h-2 bg-stone-900 rounded-full flex overflow-hidden border border-white/5">
                                  {game.userScore > 0 && (
                                    <div className="h-full bg-[#E58B58]" style={{ width: `${userPct}%` }} title={`You: ${game.userScore} wins`} />
                                  )}
                                  {game.draws > 0 && (
                                    <div className="h-full bg-[#8A847F]" style={{ width: `${drawPct}%` }} title={`Draws: ${game.draws}`} />
                                  )}
                                  {game.partnerScore > 0 && (
                                    <div className="h-full bg-[#6C8EEF]" style={{ width: `${partnerPct}%` }} title={`Partner: ${game.partnerScore} wins`} />
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-2 bg-stone-850 rounded-full border border-dashed border-white/5 flex items-center justify-center animate-pulse" />
                              )}

                              {/* 3-Column Score Grid inside each game card */}
                              <div className="grid grid-cols-3 gap-2 w-full text-center py-2 border-t border-b border-white/5 my-1">
                                {/* Left: You */}
                                <div className="flex flex-col items-center justify-center">
                                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">You</span>
                                  <span className="text-lg font-bold text-[#E58B58]">{game.userScore || 0}</span>
                                  <button 
                                    onClick={() => handleIncrementScore(game.gameId, 'user')}
                                    className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 hover:bg-[#E58B58] text-[#E58B58] hover:text-white border border-[#E58B58]/20 transition-all cursor-pointer mt-1"
                                  >
                                    +1 Y
                                  </button>
                                </div>

                                {/* Center: Draws */}
                                <div className="flex flex-col items-center justify-center border-l border-r border-white/5">
                                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Draws</span>
                                  <span className="text-lg font-bold text-[#8A847F]">{game.draws || 0}</span>
                                  <button 
                                    onClick={() => handleIncrementScore(game.gameId, 'draw')}
                                    className="text-[9px] px-2 py-0.5 rounded bg-stone-800 hover:bg-[#8A847F] text-stone-300 hover:text-white border border-stone-700 transition-all cursor-pointer mt-1"
                                  >
                                    +1 D
                                  </button>
                                </div>

                                {/* Right: Partner */}
                                <div className="flex flex-col items-center justify-center">
                                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Partner</span>
                                  <span className="text-lg font-bold text-[#6C8EEF]">{game.partnerScore || 0}</span>
                                  <button 
                                    onClick={() => handleIncrementScore(game.gameId, 'partner')}
                                    className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 hover:bg-[#6C8EEF] text-[#6C8EEF] hover:text-white border border-[#6C8EEF]/20 transition-all cursor-pointer mt-1"
                                  >
                                    +1 P
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent Activity Log */}
                    {recentSessions && recentSessions.length > 0 && (
                      <div className="flex flex-col items-stretch mt-6">
                        <div className="mb-3">
                          <span className="text-[10px] font-bold tracking-[0.2em] text-[#8A847F] uppercase">Recent Activity</span>
                        </div>

                        <div className="bg-scoreboard-card rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden w-full">
                          {recentSessions.map((session) => {
                            const game = gameScores.find(g => g.gameId === session.gameType) || { name: "Multiplayer Game" };
                            let logText = "";
                            
                            if (session.isDraw) {
                              logText = `It was a draw in ${game.name}!`;
                            } else if (session.winnerId === currentUser.id) {
                              logText = `You won at ${game.name}! 🏆`;
                            } else {
                              logText = `${partnerUser ? partnerUser.name : "Partner"} won at ${game.name}! 👑`;
                            }

                            const timeString = new Date(session.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });

                            return (
                              <div key={session.id} className="p-3 flex items-center justify-between gap-3 text-xs w-full">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-stone-500 text-sm">history</span>
                                  <span className="text-stone-300 font-medium">{logText}</span>
                                </div>
                                <span className="text-[9px] text-stone-500 font-bold whitespace-nowrap">{timeString}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </section>
          )}

          {currentView === "discover" && (
            <section className="view-container active-view w-full max-w-[1200px] mx-auto py-6 px-4 pb-32 md:py-12 md:px-8 md:pb-32">
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
                    {partnerUser ? (
                      <div className="relative">
                        {renderAvatar(partnerUser, "w-10 h-10", "text-sm")}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-surface animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center font-bold text-white text-sm relative">
                        P
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-surface animate-pulse"></div>
                      </div>
                    )}
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
            <section className="view-container active-view w-full max-w-[1200px] mx-auto py-6 px-4 pb-32 md:py-12 md:px-8 md:pb-32">
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
                                  {renderAvatar(currentUser, "w-6 h-6", "text-[10px]")}
                                  <span className="font-bold text-sm">{currentUser.name}</span>
                                </div>
                                <p className="answer-text-content mt-3 text-sm italic">{creatorAnswer?.text}</p>
                              </div>
                              
                              <div className="answer-bubble flex-1">
                                <div className="answer-author-row flex items-center gap-2">
                                  {renderAvatar(partnerUser || { name: "Partner", avatarColor: "#70585b" }, "w-6 h-6", "text-[10px]")}
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
            <section className="view-container active-view w-full max-w-[1200px] mx-auto py-6 px-4 pb-32 md:py-12 md:px-8 md:pb-32 flex flex-col md:flex-row gap-8">
              
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



        </main>
            </>
          )}
        </div>

        {/* Bottom Nav Bar (Mobile Only) */}
        {currentUser && currentView !== "landing" && currentView !== "onboarding" && currentView !== "profile" && currentView !== "settings" && currentSpace && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-[#181615] border-t border-[#282522] rounded-t-[24px] md:hidden shadow-lg">
            
            {/* Sanctuary (Home) */}
            <button 
              className={`flex flex-col items-center justify-center transition-all duration-200 ${(currentView === "home" || currentView === "diary" || currentView === "scoreboard") ? "text-primary scale-110" : "text-on-surface-variant/70 hover:text-primary"}`}
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
      {showDevToolbar && (
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
      )}

      {/* --- PREMIUM COMPONENT MODALS --- */}

      {/* 1. Draw Together Modal */}
      {activeActivityModal === "draw" && (
        <div className="modal-overlay flex" onClick={() => setActiveActivityModal(null)}>
          <div className="modal-content glass-card rounded-[28px] max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close text-stone-400 hover:text-white" onClick={() => setActiveActivityModal(null)}>&times;</button>
            <h3 className="text-xl font-bold font-cursive text-orange-200 mb-4">Draw Together Canvas</h3>
            <DrawingCanvas onSave={(dataUrl) => { handleSaveCanvasDrawing(dataUrl); setActiveActivityModal(null); }} />
          </div>
        </div>
      )}

      {/* 2. Love Letter: Write Modal */}
      {activeActivityModal === "love_letter_write" && (
        <div className="modal-overlay flex" onClick={() => setActiveActivityModal(null)}>
          <div className="modal-content glass-card rounded-[28px] max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close text-stone-400 hover:text-white" onClick={() => setActiveActivityModal(null)}>&times;</button>
            <h3 className="text-xl font-bold font-cursive text-orange-200 mb-2">Write a Love Letter</h3>
            <p className="text-xs text-stone-400 mb-4">Seal a private note for your partner. They can open it from their mailbox.</p>
            
            <div className="space-y-4">
              <textarea 
                className="input-field w-full h-32 font-cursive text-lg leading-relaxed text-orange-100 placeholder:text-stone-600" 
                placeholder="Dearest..." 
                value={loveLetterInput} 
                onChange={(e) => setLoveLetterInput(e.target.value)}
              />
              <div className="flex gap-2">
                <button className="btn btn-glass flex-1 text-xs" onClick={() => setActiveActivityModal('love_letter_list')}>Open Mailbox</button>
                <button className="btn btn-primary flex-1 btn-terracotta text-xs" onClick={handleSendLetter}>Seal & Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Love Letter: Inbox List Modal */}
      {activeActivityModal === "love_letter_list" && (
        <div className="modal-overlay flex" onClick={() => setActiveActivityModal(null)}>
          <div className="modal-content glass-card rounded-[28px] max-w-md p-6 overflow-y-auto max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close text-stone-400 hover:text-white" onClick={() => setActiveActivityModal(null)}>&times;</button>
            <h3 className="text-xl font-bold font-cursive text-orange-200 mb-4">Our Sealed Mailbox ({loveLetters.length})</h3>
            
            <div className="space-y-4">
              {loveLetters.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">Mailbox is currently empty.</p>
              ) : (
                loveLetters.map((l) => (
                  <div key={l.id} className="p-4 bg-stone-900/50 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-350">From: {l.senderName}</span>
                      <span className="text-[10px] text-stone-500">{new Date(l.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-cursive text-stone-200 leading-relaxed whitespace-pre-wrap">{l.message}</p>
                  </div>
                ))
              )}
              <button className="btn btn-glass w-full text-xs mt-2" onClick={() => setActiveActivityModal('love_letter_write')}>Write New Letter</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Plan a Date Countdown Modal */}
      {activeActivityModal === "date_planner" && (
        <div className="modal-overlay flex" onClick={() => setActiveActivityModal(null)}>
          <div className="modal-content glass-card rounded-[28px] max-w-md p-6 overflow-y-auto max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close text-stone-400 hover:text-white" onClick={() => setActiveActivityModal(null)}>&times;</button>
            <h3 className="text-xl font-bold font-cursive text-orange-200 mb-2">Our Date Planner</h3>
            <p className="text-xs text-stone-400 mb-4 font-body-md">Schedule dates, view countdowns, and check off shared bucket lists.</p>

            {/* Create form */}
            <div className="p-4 bg-stone-900/40 rounded-2xl border border-white/5 space-y-3 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-300">Create New Date Plan</h4>
              <div className="space-y-2">
                <input type="text" className="input-field w-full py-2 px-3 text-xs" placeholder="Date Title (e.g. Picnic, Movie)" value={dateTitle} onChange={(e) => setDateTitle(e.target.value)} />
                <input type="datetime-local" className="input-field w-full py-2 px-3 text-xs" value={dateVal} onChange={(e) => setDateVal(e.target.value)} />
                <input type="text" className="input-field w-full py-2 px-3 text-xs" placeholder="Location" value={dateLocation} onChange={(e) => setDateLocation(e.target.value)} />
                <textarea className="input-field w-full h-16 py-2 px-3 text-xs" placeholder="Itinerary details" value={dateDesc} onChange={(e) => setDateDesc(e.target.value)} />
                <button className="btn btn-primary w-full py-2 text-xs btn-terracotta" onClick={handleSaveDate}>Add Date Plan</button>
              </div>
            </div>

            {/* Date list */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 pl-1">Scheduled Plans ({datePlans.length})</h4>
              {datePlans.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-4">No dates planned yet.</p>
              ) : (
                datePlans.map((d) => (
                  <div key={d.id} className="p-4 bg-stone-900/60 rounded-2xl border border-white/10 space-y-3 relative">
                    <button 
                      onClick={() => handleDeleteDate(d.id)}
                      className="absolute top-2.5 right-2.5 text-stone-500 hover:text-rose-400 text-xl bg-transparent border-0 cursor-pointer"
                    >
                      &times;
                    </button>
                    <div>
                      <h5 className="text-sm font-bold text-white leading-tight">{d.title}</h5>
                      <p className="text-[10px] text-orange-300 mt-1">{new Date(d.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} • {d.location}</p>
                      {d.description && <p className="text-xs text-stone-450 mt-1 leading-normal">{d.description}</p>}
                    </div>

                    {/* countdown */}
                    <DateCountdown targetDate={d.dateTime} />

                    {/* bucket checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Date Checklist</span>
                      {d.bucketList?.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={item.done} 
                            onChange={() => handleToggleDateItem(d.id, item.id)}
                            className="rounded bg-stone-900 border-white/15 text-orange-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className={item.done ? "line-through text-stone-500" : ""}>{item.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Private Diary Note Creation Modal (Bottom Sheet style) */}
      {diaryModalOpen && (
        <div className="modal-overlay flex items-end sm:items-center" onClick={() => setDiaryModalOpen(false)}>
          <div className="modal-content glass-card rounded-t-[32px] sm:rounded-[28px] max-w-md p-6 overflow-y-auto max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close text-stone-400 hover:text-white" onClick={() => setDiaryModalOpen(false)}>&times;</button>
            
            <h3 className="text-xl font-bold font-cursive text-orange-200 mb-1">Add Diary Entry</h3>
            <p className="text-xs text-stone-400 mb-5 font-body-md">Write down notes, hints, or memories. This stays 100% private to you.</p>

            <div className="space-y-4">
              {/* Category Selector */}
              <div className="input-group">
                <label className="input-label text-[10px] uppercase tracking-wider text-stone-400 font-bold">Category Tag</label>
                <div className="flex flex-wrap gap-2 mt-1 select-none">
                  {["Things I Notice", "Moments", "Ideas", "Hints", "Remember"].map((cat) => {
                    const isSelected = diaryCategoryInput === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setDiaryCategoryInput(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-[#D9885C]/20 border-[#D9885C] text-orange-300" 
                            : "bg-white/5 border-white/10 text-stone-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title input */}
              <div className="input-group">
                <label className="input-label text-[10px] uppercase tracking-wider text-stone-400 font-bold">Title</label>
                <input 
                  type="text" 
                  className="input-field w-full py-2 px-3 text-xs" 
                  placeholder="e.g. Favorite snacks, Sunset walk details" 
                  value={diaryTitleInput} 
                  onChange={(e) => setDiaryTitleInput(e.target.value)} 
                />
              </div>

              {/* Date Input */}
              <div className="input-group">
                <label className="input-label text-[10px] uppercase tracking-wider text-stone-400 font-bold">Note Date (Optional)</label>
                <input 
                  type="date" 
                  className="input-field w-full py-2 px-3 text-xs" 
                  value={diaryDateInput} 
                  onChange={(e) => setDiaryDateInput(e.target.value)} 
                />
              </div>

              {/* Note Content Textarea */}
              <div className="input-group">
                <label className="input-label text-[10px] uppercase tracking-wider text-stone-400 font-bold">Diary Note</label>
                <textarea 
                  className="input-field w-full h-28 py-2.5 px-3 text-xs leading-relaxed" 
                  placeholder="Write your private notes here..." 
                  value={diaryContentInput} 
                  onChange={(e) => setDiaryContentInput(e.target.value)} 
                />
              </div>

              {/* Optional Photo Attachment */}
              <div className="input-group">
                <label className="input-label text-[10px] uppercase tracking-wider text-stone-400 font-bold">Photo Attachment (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleDiaryImageUpload} 
                  className="hidden" 
                  id="diary-image-upload" 
                />
                
                {diaryImageInput ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/10 bg-black/10 mt-1 flex justify-center">
                    <img src={diaryImageInput} alt="Uploaded attachment" className="h-full object-contain" />
                    <button 
                      onClick={() => setDiaryImageInput(null)} 
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center cursor-pointer border border-white/10"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label 
                    htmlFor="diary-image-upload" 
                    className="mt-1 flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/10 text-xs text-stone-400 hover:text-white transition-all select-none"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                    Upload Photo (Max 2MB)
                  </label>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  className="btn btn-glass flex-1 text-xs" 
                  onClick={() => setDiaryModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary flex-1 btn-terracotta text-xs" 
                  onClick={handleSaveDiaryEntry}
                >
                  Save Entry
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- INTERACTIVE SCOREBOARD GAMES MODALS --- */}
      {activeGameModal && (
        <div className="modal-overlay flex" onClick={() => setActiveGameModal(null)}>
          {activeGameModal === "spotted" ? (
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm mx-auto px-4">
              <Spotted 
                currentUser={currentUser}
                partnerUser={partnerUser}
                onClose={() => setActiveGameModal(null)}
                onComplete={(winnerType) => {
                  handleIncrementScore("spotted", winnerType);
                  setActiveGameModal(null);
                }}
              />
            </div>
          ) : (
            <div className="modal-content glass-card rounded-[28px] max-w-md p-6 overflow-y-auto max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close text-stone-400 hover:text-white" onClick={() => setActiveGameModal(null)}>&times;</button>
              
              <h3 className="text-xl font-bold font-cursive text-orange-200 mb-4 text-center">
                {activeGameModal === "link_four" && "Link Four"}
                {activeGameModal === "word_duel" && "Word Duel"}
                {activeGameModal === "memory" && "Memory Match"}
              </h3>

              {activeGameModal === "link_four" && (
                <LinkFour 
                  currentUser={currentUser}
                  partnerUser={partnerUser}
                  onComplete={(winnerType) => {
                    handleIncrementScore("link_four", winnerType);
                    setActiveGameModal(null);
                  }}
                />
              )}

              {activeGameModal === "word_duel" && (
                <WordDuel 
                  currentUser={currentUser}
                  partnerUser={partnerUser}
                  onComplete={(winnerType) => {
                    handleIncrementScore("word_duel", winnerType);
                    setActiveGameModal(null);
                  }}
                />
              )}

              {activeGameModal === "memory" && (
                <MemoryMatch 
                  currentUser={currentUser}
                  partnerUser={partnerUser}
                  onComplete={(winnerType) => {
                    handleIncrementScore("memory", winnerType);
                    setActiveGameModal(null);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Hearts Overlay */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="fixed pointer-events-none text-red-500 animate-float-heart z-[100] text-3xl"
          style={{ left: `${heart.x}vw`, bottom: `${heart.y}vh` }}
        >
          ❤️
        </div>
      ))}

    </div>
  );
}

// Helper Canvas Drawing Widget
const DrawingCanvas = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FDBA74");
  const [thickness, setThickness] = useState(4);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    // Support mouse and touch
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    onSave(dataUrl);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        {/* Colors presets */}
        <div className="flex gap-2">
          {["#FDBA74", "#EA580C", "#F5F5F4", "#ffb2c1", "#8a4fff", "#00e676"].map((c) => (
            <button
              key={c}
              className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'} cursor-pointer`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        
        {/* Thickness */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-bold uppercase">Brush:</span>
          <input
            type="range"
            min="1"
            max="15"
            value={thickness}
            onChange={(e) => setThickness(parseInt(e.target.value))}
            className="w-20 accent-orange-400 cursor-pointer"
          />
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={380}
        height={280}
        className="drawing-canvas w-full max-w-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="flex gap-3">
        <button className="btn btn-glass flex-1 text-xs" onClick={clearCanvas}>Clear</button>
        <button className="btn btn-primary flex-1 btn-terracotta text-xs" onClick={handleSave}>Share</button>
      </div>
    </div>
  );
};

// Helper Live Countdown Widget
const DateCountdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let left = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      if (difference > 0) {
        left = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      setTimeLeft(left);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 text-center mt-2">
      <div className="bg-black/30 p-2 rounded-xl border border-white/5">
        <div className="text-base font-bold text-orange-400">{timeLeft.days}</div>
        <div className="text-[9px] text-stone-500 uppercase font-bold tracking-wider">Days</div>
      </div>
      <div className="bg-black/30 p-2 rounded-xl border border-white/5">
        <div className="text-base font-bold text-orange-400">{timeLeft.hours}</div>
        <div className="text-[9px] text-stone-500 uppercase font-bold tracking-wider">Hrs</div>
      </div>
      <div className="bg-black/30 p-2 rounded-xl border border-white/5">
        <div className="text-base font-bold text-orange-400">{timeLeft.minutes}</div>
        <div className="text-[9px] text-stone-500 uppercase font-bold tracking-wider">Mins</div>
      </div>
      <div className="bg-black/30 p-2 rounded-xl border border-white/5">
        <div className="text-base font-bold text-orange-400">{timeLeft.seconds}</div>
        <div className="text-[9px] text-stone-500 uppercase font-bold tracking-wider">Secs</div>
      </div>
    </div>
  );
};
