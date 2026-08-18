/**
 * BetweenUs - Default Seed Data
 * Contains questions, challenges, and discover content for the platform.
 */

export const DEFAULT_QUESTIONS = [
  {
    id: "q_1",
    text: "What is something I did recently that made you happy?",
    category: "Appreciation",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_2",
    text: "What's one thing you'd like us to do together in the next few months?",
    category: "Quality Time",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_3",
    text: "What is a memory of us you never want to forget?",
    category: "Emotional Connection",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_4",
    text: "What is something you've been thinking about lately but haven't shared?",
    category: "Understanding",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_5",
    text: "What was your very first impression of me, and how has it changed?",
    category: "Understanding",
    modes: ["couple", "marriage", "long_distance", "friends", "custom"]
  },
  {
    id: "q_6",
    text: "When do you feel most connected or closest to me?",
    category: "Emotional Connection",
    modes: ["couple", "marriage", "long_distance", "custom"]
  },
  {
    id: "q_7",
    text: "What is a challenge we've overcome together that you are proud of?",
    category: "Communication",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_8",
    text: "If you could pick one word to describe our relationship right now, what would it be?",
    category: "Communication",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_9",
    text: "What is one small way I can support you better during a stressful day?",
    category: "Understanding",
    modes: ["couple", "marriage", "long_distance", "family", "custom"]
  },
  {
    id: "q_10",
    text: "What's a habit or quirk of mine that you secretly love?",
    category: "Appreciation",
    modes: ["couple", "marriage", "long_distance", "friends", "custom"]
  },
  {
    id: "q_11",
    text: "How do you think we have both grown since we first met?",
    category: "Understanding",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_12",
    text: "What is a dream or goal you have for yourself that I can help you achieve?",
    category: "Emotional Connection",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_13",
    text: "What is your favorite memory of us from this past year?",
    category: "Quality Time",
    modes: ["couple", "marriage", "long_distance", "friends", "family", "custom"]
  },
  {
    id: "q_14",
    text: "How do you usually like to receive affection (e.g., words, actions, quality time)?",
    category: "Appreciation",
    modes: ["couple", "marriage", "long_distance", "custom"]
  },
  {
    id: "q_15",
    text: "What is a song, movie, or book that reminds you of us, and why?",
    category: "Quality Time",
    modes: ["couple", "marriage", "long_distance", "friends", "custom"]
  }
];

export const DEFAULT_CHALLENGES = [
  {
    id: "c_1",
    text: "Send the other person a voice note telling them one thing you appreciate about them.",
    category: "Communication",
    points: 15
  },
  {
    id: "c_2",
    text: "Share a photo of something that reminded you of them today.",
    category: "Quality Time",
    points: 10
  },
  {
    id: "c_3",
    text: "Tell them three specific things you appreciate about them in person or chat.",
    category: "Appreciation",
    points: 10
  },
  {
    id: "c_4",
    text: "Spend 10 minutes talking without using your phones before bed.",
    category: "Quality Time",
    points: 20
  },
  {
    id: "c_5",
    text: "Write down a goal you want both of you to achieve this month and share it.",
    category: "Emotional Connection",
    points: 15
  },
  {
    id: "c_6",
    text: "Send them a random text with an inside joke or a sweet memory.",
    category: "Communication",
    points: 10
  },
  {
    id: "c_7",
    text: "Prepare a small surprise (like making them a hot beverage or sending a custom card).",
    category: "Appreciation",
    points: 20
  }
];

export const DEFAULT_DISCOVER = [
  {
    id: "d_1",
    title: "Understanding The 5 Love Languages",
    summary: "Discover how you and your partner express and receive love differently to bridge emotional gaps.",
    readTime: "5 min read",
    category: "Communication",
    content: "The concept of love languages, introduced by Dr. Gary Chapman, suggests that people experience love in five primary ways: Words of Affirmation, Quality Time, Receiving Gifts, Acts of Service, and Physical Touch. Identifying yours and your partner's love languages can prevent misunderstandings and build a solid foundation of mutual appreciation."
  },
  {
    id: "d_2",
    title: "Thriving Across the Miles",
    summary: "Long-distance relationships require unique rituals. Here are actionable tips to keep the spark alive.",
    readTime: "7 min read",
    category: "Long Distance",
    content: "Long-distance connections thrive on consistency. Setting up virtual date nights, syncing watch lists, sending physical care packages, and having daily touchpoints (like BetweenUs questions!) helps create a shared reality despite the geographical separation. Focus on quality conversations and planning your next physical visit to keep hope and excitement high."
  },
  {
    id: "d_3",
    title: "The Art of Active Listening",
    summary: "Most people listen to reply. Learn how to listen to understand and validate your partner.",
    readTime: "4 min read",
    category: "Understanding",
    content: "Active listening means fully focusing on the speaker rather than planning your next words. To practice: repeat back what you heard in your own words ('It sounds like you felt frustrated when...'), avoid immediately offering solutions unless asked, and validate their emotions first. Emotional validation is the ultimate building block of trust."
  },
  {
    id: "d_4",
    title: "Creating Micro-Rituals",
    summary: "Why small, daily 5-minute habits protect your bond better than grand romantic gestures.",
    readTime: "6 min read",
    category: "Quality Time",
    content: "Psychological research shows that long-term relationship satisfaction is built on tiny daily bids for connection, not just massive vacations or anniversaries. A 5-minute morning check-in, a custom text in the afternoon, or an evening stroll together act as anchors that secure your relationship through life's storms."
  }
];
