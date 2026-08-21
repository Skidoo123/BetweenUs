"use client";

import { useState, useEffect } from "react";

// List of romantic/couples emojis for Spotted and Memory games
const EMOJIS = ["❤️", "🌹", "💍", "🔑", "⭐", "🎈", "🎨", "✈️", "🏝️", "🏠", "🍕", "🍰", "☕", "🐱", "🐶", "🚗", "📚", "💡", "🎵", "🎁", "🥂", "🍩", "🧸", "🍿", "🧩", "🔮"];

// --- 1. LINK FOUR GAME ---
export function LinkFour({ onComplete, currentUser, partnerUser }) {
  const ROWS = 6;
  const COLS = 7;
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState("user"); // 'user' or 'partner'
  const [winner, setWinner] = useState(null); // 'user', 'partner', 'draw', or null

  const checkWin = (grid) => {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = grid[r][c];
        if (val && val === grid[r][c + 1] && val === grid[r][c + 2] && val === grid[r][c + 3]) return val;
      }
    }
    // Check vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = grid[r][c];
        if (val && val === grid[r + 1][c] && val === grid[r + 2][c] && val === grid[r + 3][c]) return val;
      }
    }
    // Check diagonal down-right
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = grid[r][c];
        if (val && val === grid[r + 1][c + 1] && val === grid[r + 2][c + 2] && val === grid[r + 3][c + 3]) return val;
      }
    }
    // Check diagonal up-right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = grid[r][c];
        if (val && val === grid[r - 1][c + 1] && val === grid[r - 2][c + 2] && val === grid[r - 3][c + 3]) return val;
      }
    }
    // Check draw
    if (grid.every(row => row.every(cell => cell !== null))) return "draw";
    return null;
  };

  const handleColumnClick = (colIdx) => {
    if (winner) return;

    // Find lowest empty row
    let rowIdx = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][colIdx] === null) {
        rowIdx = r;
        break;
      }
    }

    if (rowIdx === -1) return; // Column full

    const newBoard = board.map(row => [...row]);
    newBoard[rowIdx][colIdx] = currentPlayer;
    setBoard(newBoard);

    const gameResult = checkWin(newBoard);
    if (gameResult) {
      setWinner(gameResult);
    } else {
      setCurrentPlayer(currentPlayer === "user" ? "partner" : "user");
    }
  };

  const activeName = currentPlayer === "user" 
    ? (currentUser ? currentUser.name : "You")
    : (partnerUser ? partnerUser.name : "Partner");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        {!winner ? (
          <p className="text-sm text-stone-400">
            Current Turn:{" "}
            <span className={`font-bold ${currentPlayer === "user" ? "text-[#D9885C]" : "text-[#6C8EEF]"}`}>
              {activeName}
            </span>
          </p>
        ) : (
          <p className="text-base font-bold text-white">
            {winner === "draw" ? (
              "It's a Draw!"
            ) : (
              <span>
                🏆 Winner:{" "}
                <span className={winner === "user" ? "text-[#D9885C]" : "text-[#6C8EEF]"}>
                  {winner === "user" ? (currentUser ? currentUser.name : "You") : (partnerUser ? partnerUser.name : "Partner")}
                </span>
              </span>
            )}
          </p>
        )}
      </div>

      {/* Connect Four Grid */}
      <div className="bg-[#181615] border border-[#2D2A26] p-3 rounded-2xl shadow-xl flex flex-col gap-2">
        {board.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-2">
            {row.map((cell, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleColumnClick(cIdx)}
                disabled={!!winner}
                className="w-10 h-10 rounded-full bg-[#141211] border border-[#2D2A26] hover:bg-[#23201D] transition-colors flex items-center justify-center cursor-pointer"
              >
                {cell === "user" && <div className="w-8 h-8 rounded-full bg-[#D9885C] shadow-inner" />}
                {cell === "partner" && <div className="w-8 h-8 rounded-full bg-[#6C8EEF] shadow-inner" />}
              </button>
            ))}
          </div>
        ))}
      </div>

      {winner && (
        <button
          onClick={() => onComplete(winner)}
          className="btn btn-primary text-xs py-2 px-6 w-full max-w-[200px] justify-center mt-2"
        >
          Record Result
        </button>
      )}
    </div>
  );
}

// --- 2. WORD DUEL GAME ---
export function WordDuel({ onComplete, currentUser, partnerUser }) {
  const WORD_LIST = ["HEART", "SWEET", "LOVER", "DREAM", "SMILE", "MATCH", "TRUST", "ADORE", "HAPPY", "MATCH", "UNITE", "PEACH", "FLAME"];
  
  const [secretWord, setSecretWord] = useState("");
  const [gameStage, setGameStage] = useState("setup"); // 'setup' or 'guessing'
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [winner, setWinner] = useState(null); // 'user', 'partner', or null
  const [isMasked, setIsMasked] = useState(true);

  const handleStartSetup = () => {
    // Generate a random word as fallback
    const randWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setSecretWord(randWord);
  };

  const handleWordSubmit = (e) => {
    e.preventDefault();
    const cleanWord = secretWord.toUpperCase().trim();
    if (cleanWord.length !== 5) {
      alert("Please enter exactly a 5-letter word.");
      return;
    }
    setSecretWord(cleanWord);
    setGameStage("guessing");
  };

  const handleLetterSubmit = (e) => {
    e.preventDefault();
    const cleanGuess = currentGuess.toUpperCase().trim();
    if (cleanGuess.length !== 5) return;

    const newGuesses = [...guesses, cleanGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (cleanGuess === secretWord) {
      // Guesser (Partner / Player 2) wins!
      setWinner("partner");
    } else if (newGuesses.length >= 6) {
      // Out of guesses! Word creator (You / Player 1) wins!
      setWinner("user");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {gameStage === "setup" && (
        <form onSubmit={handleWordSubmit} className="space-y-4 w-full text-center">
          <p className="text-xs text-stone-400">
            <strong>Player 1 ({currentUser ? currentUser.name : "You"})</strong>: Type a secret 5-letter word for your partner to guess.
          </p>
          <div className="relative">
            <input
              type={isMasked ? "password" : "text"}
              maxLength={5}
              placeholder="SECRET"
              value={secretWord}
              onChange={(e) => setSecretWord(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
              className="input-field w-full text-center tracking-widest text-lg font-bold bg-[#141211] border border-[#2D2A26] text-white rounded-xl py-3"
            />
            <button
              type="button"
              onClick={() => setIsMasked(!isMasked)}
              className="absolute right-3 top-3 text-stone-500 hover:text-white text-xs bg-transparent border-0 cursor-pointer"
            >
              {isMasked ? "Show" : "Hide"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStartSetup}
              className="btn btn-secondary text-xs flex-1 justify-center py-2"
            >
              Random Word
            </button>
            <button
              type="submit"
              disabled={secretWord.length !== 5}
              className="btn btn-primary text-xs flex-1 justify-center py-2 disabled:opacity-50"
            >
              Start Duel
            </button>
          </div>
        </form>
      )}

      {gameStage === "guessing" && (
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-xs text-stone-400 text-center">
            <strong>Player 2 ({partnerUser ? partnerUser.name : "Partner"})</strong>: Guess the secret 5-letter word! (6 tries)
          </p>

          {/* Wordle Grid */}
          <div className="grid grid-rows-6 gap-2">
            {Array(6).fill(null).map((_, rowIdx) => {
              const guess = guesses[rowIdx] || "";
              return (
                <div key={rowIdx} className="flex gap-2">
                  {Array(5).fill(null).map((_, colIdx) => {
                    const char = guess[colIdx] || (rowIdx === guesses.length ? currentGuess[colIdx] : "") || "";
                    let bgColor = "bg-[#141211] border-[#2D2A26]";
                    let textColor = "text-white";

                    if (rowIdx < guesses.length) {
                      if (char === secretWord[colIdx]) {
                        bgColor = "bg-[#2E523A] border-[#2E523A]"; // Correct spot (green)
                      } else if (secretWord.includes(char)) {
                        bgColor = "bg-[#8A6F27] border-[#8A6F27]"; // Wrong spot (yellow)
                      } else {
                        bgColor = "bg-[#2D2A28] border-[#2D2A28]"; // Not in word
                      }
                    }

                    return (
                      <div
                        key={colIdx}
                        className={`w-10 h-10 border rounded-xl flex items-center justify-center font-extrabold text-sm uppercase ${bgColor} ${textColor}`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {!winner ? (
            <form onSubmit={handleLetterSubmit} className="w-full flex gap-2">
              <input
                maxLength={5}
                placeholder="GUESS"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                className="input-field flex-1 text-center tracking-widest text-sm font-bold bg-[#141211] border border-[#2D2A26] text-white rounded-xl py-2"
              />
              <button
                type="submit"
                disabled={currentGuess.length !== 5}
                className="btn btn-primary text-xs py-2 px-4 disabled:opacity-50"
              >
                Guess
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-base font-bold text-white">
                🏆 Winner:{" "}
                <span className={winner === "user" ? "text-[#D9885C]" : "text-[#6C8EEF]"}>
                  {winner === "user" ? (currentUser ? currentUser.name : "You") : (partnerUser ? partnerUser.name : "Partner")}
                </span>
              </p>
              <p className="text-xs text-stone-500">The secret word was: <strong className="text-white tracking-widest">{secretWord}</strong></p>
              <button
                onClick={() => onComplete(winner)}
                className="btn btn-primary text-xs py-2 px-6 w-full justify-center"
              >
                Record Result
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- 3. SPOTTED GAME ---
export function Spotted({ onComplete, currentUser, partnerUser }) {
  const [gameStage, setGameStage] = useState("intro"); // 'intro', 'playing', 'game_over'
  const [currentPlayer, setCurrentPlayer] = useState("user"); // 'user', then 'partner'
  const [round, setRound] = useState(1);
  const [cardA, setCardA] = useState([]);
  const [cardB, setCardB] = useState([]);
  const [matchingSymbol, setMatchingSymbol] = useState("");
  const [userScore, setUserScore] = useState(0);
  const [partnerScore, setPartnerScore] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const generateCards = () => {
    // Pick 6 unique emojis for card A
    const pool = [...EMOJIS].sort(() => 0.5 - Math.random());
    const cardAEmojis = pool.slice(0, 6);
    
    // Pick matching emoji
    const match = cardAEmojis[Math.floor(Math.random() * cardAEmojis.length)];
    
    // Pick 5 unique emojis NOT in card A for card B
    const bPool = pool.filter(e => !cardAEmojis.includes(e));
    const cardBEmojis = bPool.slice(0, 5);
    cardBEmojis.push(match);

    // Shuffle both
    setCardA(cardAEmojis.sort(() => 0.5 - Math.random()));
    setCardB(cardBEmojis.sort(() => 0.5 - Math.random()));
    setMatchingSymbol(match);
    setStartTime(Date.now());
  };

  const handleStartGame = () => {
    setUserScore(0);
    setPartnerScore(0);
    setCurrentPlayer("user");
    setRound(1);
    setGameStage("playing");
    generateCards();
  };

  const handleSymbolClick = (symbol) => {
    if (symbol !== matchingSymbol) return; // Missed

    // Correct hit! Add point
    if (currentPlayer === "user") {
      setUserScore(prev => prev + 1);
    } else {
      setPartnerScore(prev => prev + 1);
    }

    if (round < 3) {
      // Next round for same player
      setRound(prev => prev + 1);
      generateCards();
    } else if (currentPlayer === "user") {
      // Toggle to partner
      alert(`Nice job! Now hand the device to ${partnerUser ? partnerUser.name : "Partner"} for their turn!`);
      setCurrentPlayer("partner");
      setRound(1);
      generateCards();
    } else {
      // Game Over
      setGameStage("game_over");
    }
  };

  const winner = userScore > partnerScore ? "user" : (partnerScore > userScore ? "partner" : "draw");
  const activeName = currentPlayer === "user" 
    ? (currentUser ? currentUser.name : "You")
    : (partnerUser ? partnerUser.name : "Partner");

  return (
    <div className="flex flex-col items-center gap-4 w-full text-center">
      {gameStage === "intro" && (
        <div className="space-y-4">
          <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
            Spot the single matching emoji between the left and right cards as fast as you can! First, Player 1 plays 3 rounds, then Player 2 plays 3 rounds.
          </p>
          <button onClick={handleStartGame} className="btn btn-primary text-xs py-2 px-6 justify-center w-full">
            Start Spotted Duel
          </button>
        </div>
      )}

      {gameStage === "playing" && (
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center text-xs border-b border-[#2D2A26] pb-2 px-2">
            <span className="text-[#D9885C] font-bold">You: {userScore}</span>
            <span className="text-white font-bold uppercase tracking-widest text-[10px]">
              {activeName}'s Turn (Rd {round}/3)
            </span>
            <span className="text-[#6C8EEF] font-bold">Partner: {partnerScore}</span>
          </div>

          <div className="flex gap-4 items-center justify-center py-2">
            {/* Card A */}
            <div className="w-28 h-28 rounded-full bg-[#1E1C1A] border border-[#2D2A26] grid grid-cols-3 items-center justify-items-center p-2 relative shadow-md">
              {cardA.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSymbolClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform bg-transparent border-0 cursor-pointer p-0"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Separator VS */}
            <span className="text-[10px] font-bold text-stone-600">VS</span>

            {/* Card B */}
            <div className="w-28 h-28 rounded-full bg-[#1E1C1A] border border-[#2D2A26] grid grid-cols-3 items-center justify-items-center p-2 relative shadow-md">
              {cardB.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSymbolClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform bg-transparent border-0 cursor-pointer p-0"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <p className="text-[10px] text-stone-500">Tap the matching emoji on either side</p>
        </div>
      )}

      {gameStage === "game_over" && (
        <div className="space-y-4">
          <p className="text-base font-bold text-white">
            {winner === "draw" ? (
              "It's a Tied Game!"
            ) : (
              <span>
                🏆 Winner:{" "}
                <span className={winner === "user" ? "text-[#D9885C]" : "text-[#6C8EEF]"}>
                  {winner === "user" ? (currentUser ? currentUser.name : "You") : (partnerUser ? partnerUser.name : "Partner")}
                </span>
              </span>
            )}
          </p>
          <div className="text-xs space-y-1 text-stone-400">
            <p>{currentUser ? currentUser.name : "You"}: {userScore} spots</p>
            <p>{partnerUser ? partnerUser.name : "Partner"}: {partnerScore} spots</p>
          </div>
          <button
            onClick={() => onComplete(winner)}
            className="btn btn-primary text-xs py-2 px-6 w-full justify-center"
          >
            Record Result
          </button>
        </div>
      )}
    </div>
  );
}

// --- 4. MEMORY MATCH GAME ---
export function MemoryMatch({ onComplete, currentUser, partnerUser }) {
  const [cards, setCards] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("user"); // 'user' or 'partner'
  const [scores, setScores] = useState({ user: 0, partner: 0 });
  const [winner, setWinner] = useState(null); // 'user', 'partner', 'draw', or null
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Select 8 random emojis
    const selectedEmojis = [...EMOJIS].sort(() => 0.5 - Math.random()).slice(0, 8);
    // Double them
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => 0.5 - Math.random())
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    setCards(deck);
    setSelectedIndices([]);
    setCurrentPlayer("user");
    setScores({ user: 0, partner: 0 });
    setWinner(null);
    setIsLocked(false);
  };

  const handleCardClick = (idx) => {
    if (isLocked || cards[idx].isFlipped || cards[idx].isMatched || selectedIndices.length >= 2) return;

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newSelections = [...selectedIndices, idx];
    setSelectedIndices(newSelections);

    if (newSelections.length === 2) {
      const [firstIdx, secondIdx] = newSelections;
      setIsLocked(true);

      if (newCards[firstIdx].emoji === newCards[secondIdx].emoji) {
        // Match found!
        setTimeout(() => {
          const matchedCards = newCards.map((card, i) => {
            if (i === firstIdx || i === secondIdx) {
              return { ...card, isMatched: true };
            }
            return card;
          });
          setCards(matchedCards);
          
          const newScores = {
            ...scores,
            [currentPlayer]: scores[currentPlayer] + 1
          };
          setScores(newScores);
          setSelectedIndices([]);
          setIsLocked(false);

          // Check if all matched
          if (matchedCards.every(c => c.isMatched)) {
            if (newScores.user > newScores.partner) setWinner("user");
            else if (newScores.partner > newScores.user) setWinner("partner");
            else setWinner("draw");
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          const flippedBackCards = newCards.map((card, i) => {
            if (i === firstIdx || i === secondIdx) {
              return { ...card, isFlipped: false };
            }
            return card;
          });
          setCards(flippedBackCards);
          setSelectedIndices([]);
          setCurrentPlayer(currentPlayer === "user" ? "partner" : "user");
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const activeName = currentPlayer === "user" 
    ? (currentUser ? currentUser.name : "You")
    : (partnerUser ? partnerUser.name : "Partner");

  return (
    <div className="flex flex-col items-center gap-4 w-full text-center">
      <div className="flex justify-between items-center text-xs w-full border-b border-[#2D2A26] pb-2 px-2">
        <span className="text-[#D9885C] font-bold">You: {scores.user}</span>
        {!winner ? (
          <span className={`font-bold uppercase tracking-widest text-[10px] ${currentPlayer === "user" ? "text-[#D9885C]" : "text-[#6C8EEF]"}`}>
            {activeName}'s Turn
          </span>
        ) : (
          <span className="text-white font-bold text-[10px]">Game Over</span>
        )}
        <span className="text-[#6C8EEF] font-bold">Partner: {scores.partner}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
        {cards.map((card, idx) => {
          const showEmoji = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl transition-all duration-300 border cursor-pointer ${
                showEmoji 
                  ? "bg-[#1E1C1A] border-[#2D2A26]" 
                  : "bg-[#2D2A26] border-[#3D3933] hover:bg-[#3D3933]"
              }`}
            >
              {showEmoji ? card.emoji : "❤️"}
            </button>
          );
        })}
      </div>

      {winner && (
        <div className="space-y-4 mt-2">
          <p className="text-base font-bold text-white">
            {winner === "draw" ? (
              "It's a Tied Game!"
            ) : (
              <span>
                🏆 Winner:{" "}
                <span className={winner === "user" ? "text-[#D9885C]" : "text-[#6C8EEF]"}>
                  {winner === "user" ? (currentUser ? currentUser.name : "You") : (partnerUser ? partnerUser.name : "Partner")}
                </span>
              </span>
            )}
          </p>
          <button
            onClick={() => onComplete(winner)}
            className="btn btn-primary text-xs py-2 px-6 w-full justify-center"
          >
            Record Result
          </button>
        </div>
      )}
    </div>
  );
}
