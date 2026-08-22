"use client";

import React, { useState, useRef } from "react";

export default function ProfilePage({
  user = null,
  partner = null,
  inviteCode = "VPRSQSYV",
  onConnectPartner,
  onNavigate,
  onOpenSettings,
  profileImagePreview = null,
  onProfileImageChange = null,
}) {
  const [partnerCode, setPartnerCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const profileImageInputRef = useRef(null);

  const displayName =
    user?.name ||
    user?.displayName ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    "Abdallah";
    
  const email =
    user?.email ||
    user?.user_metadata?.email ||
    "leagend323@gmail.com";

  const handleConnect = async () => {
    const code = partnerCode.trim().toUpperCase();
    if (!code) return;
    try {
      setConnecting(true);
      if (typeof onConnectPartner === "function") {
        await onConnectPartner(code);
      }
    } catch (error) {
      console.error("Partner connection failed:", error);
    } finally {
      setConnecting(false);
    }
  };

  const copyInviteCode = async () => {
    const cleanCode = inviteCode.replace(/\s+/g, "");
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cleanCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        return;
      }
    } catch (error) {
      console.warn("navigator.clipboard failed, trying fallback", error);
    }

    // Fallback copy logic
    try {
      const textArea = document.createElement("textarea");
      textArea.value = cleanCode;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        alert("Could not copy code. Code: " + cleanCode);
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      alert("Could not copy code. Code: " + cleanCode);
    }
  };

  return (
    <main className="profile-page">
      {/* Profile Header */}
      <section className="profile-header">
        <button
          className="avatar-button"
          type="button"
          aria-label="Profile picture"
          onClick={() => profileImageInputRef.current?.click()}
        >
          {profileImagePreview ? (
            <img 
              src={profileImagePreview} 
              alt="Preview" 
              className="avatar object-cover" 
            />
          ) : (
            <div className="avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="avatar-camera">
            📷
          </span>
          <input 
            type="file" 
            ref={profileImageInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={onProfileImageChange} 
          />
        </button>
        <div className="profile-identity">
          <h1>{displayName}</h1>
          <p>{email}</p>
        </div>
        <button
          className="settings-button"
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
        >
          ⚙
        </button>
      </section>

      {/* Partner */}
      <section className="profile-section">
        <div className="section-title">
          <h2>Partner</h2>
          <span />
        </div>
        <div className="partner-card">
          {partner ? (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="flex items-center justify-center gap-6 md:gap-12 w-full">
                {/* User Info */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#704e37] bg-[#302923] flex items-center justify-center text-xl md:text-2xl font-bold text-[#d98d52]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <strong className="text-sm font-semibold text-white">{displayName}</strong>
                </div>

                {/* Heart Connection */}
                <div className="flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-rose-500 text-3xl animate-pulse">favorite</span>
                  <span className="text-[10px] font-bold text-[#d98d52] uppercase tracking-widest mt-1">Paired</span>
                </div>

                {/* Partner Info */}
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/10 flex items-center justify-center text-xl md:text-2xl font-bold text-white"
                    style={{ background: partner.avatarColor || "#d98d52" }}
                  >
                    {(partner.name || partner.displayName || "P").charAt(0).toUpperCase()}
                  </div>
                  <strong className="text-sm font-semibold text-white">{partner.name || partner.displayName}</strong>
                </div>
              </div>

              <div className="w-full mt-4 p-4 bg-black/20 rounded-2xl border border-white/5 text-center">
                <p className="text-sm text-stone-300">
                  Successfully linked spaces! Answer the question of the day together to build your relationship streak.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#d98d52]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Connected Private Space</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="invite-description">
                Your invite code — share with your partner
              </p>
              <button
                className={`invite-envelope ${
                  showInvite ? "opened" : ""
                }`}
                type="button"
                onClick={() => {
                  setShowInvite(!showInvite);
                  if (navigator.share) {
                    navigator.share({
                      title: "Join me on BetweenUs",
                      text: `Here is my invite code: ${inviteCode}`,
                      url: `${window.location.origin}/?code=${inviteCode}`
                    }).catch(() => {});
                  }
                }}
              >
                <div className="envelope-flap" />
                <div className="wax-seal">
                  <span>♥️</span>
                </div>
                <div className="envelope-message">
                  to your person
                </div>
              </button>
              
              <button
                className="invite-code"
                type="button"
                onClick={copyInviteCode}
                title="Copy invite code"
              >
                {inviteCode}
              </button>
              <p className="tap-envelope">
                {copySuccess ? "Copied to clipboard!" : "tap envelope to share / copy"}
              </p>

              <div className="or-divider">
                <span />
                <strong>or</strong>
                <span />
              </div>

              <label className="partner-input-label">
                Enter your partner's code
              </label>
              <div className="partner-connect-row">
                <input
                  value={partnerCode}
                  onChange={(event) =>
                    setPartnerCode(
                      event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 16)
                    )
                  }
                  placeholder="BU-XXXX-XX"
                  maxLength={16}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="partner-code-input"
                />
                <button
                  className="connect-button"
                  type="button"
                  disabled={
                    partnerCode.length === 0 || connecting
                  }
                  onClick={handleConnect}
                >
                  {connecting ? "Connecting..." : "Connect"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

    </main>
  );
}
