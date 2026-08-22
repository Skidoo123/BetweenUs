"use client";

import React from "react";

export default function SettingsPage({
  user = null,
  onBack,
  onSubscription,
  onRestorePurchases,
  onNotifications,
  onWidgets,
  onDisplayName,
  onSignOut,
  onDeleteAccount,
  onFeedback,
  onTerms,
  onPrivacy,
}) {
  const displayName =
    user?.name ||
    user?.displayName ||
    user?.user_metadata?.display_name ||
    "Abdallah";

  const handleEditName = () => {
    const newName = prompt("Enter your new display name:", displayName);
    if (newName && newName.trim()) {
      onDisplayName(newName.trim());
    }
  };

  return (
    <main className="settings-page pb-32 overflow-y-auto scroll-smooth">
      {/* Header */}
      <header className="settings-header">
        <button
          className="back-button"
          type="button"
          onClick={onBack}
          aria-label="Go back"
        >
          ‹
        </button>
        <h1>Settings</h1>
      </header>

      {/* Subscription */}
      <SettingsSection title="Subscription">
        <SettingsRow
          title="BetweenUs Pro"
          subtitle="Upgrade to unlock the full space"
          arrow
          onClick={onSubscription}
        />
        <SettingsRow
          title="Restore purchases"
          subtitle="Already subscribed? Tap to restore"
          arrow
          onClick={onRestorePurchases}
        />
      </SettingsSection>

      {/* Account */}
      <SettingsSection title="Account">
        <SettingsRow
          title="Notifications"
          subtitle="Choose what you hear about"
          arrow
          onClick={onNotifications}
        />
        <SettingsRow
          title="Widgets"
          subtitle="Set up Countdown and Canvas"
          arrow
          onClick={onWidgets}
        />
        <SettingsRow
          title="Display name"
          subtitle={displayName}
          pencil
          onClick={handleEditName}
        />
        <button
          className="danger-row"
          type="button"
          onClick={onSignOut}
        >
          Sign out
        </button>
        <button
          className="danger-row"
          type="button"
          onClick={onDeleteAccount}
        >
          Delete account
        </button>
      </SettingsSection>

      {/* Feedback */}
      <SettingsSection title="Feedback">
        <SettingsRow
          title="Leave feedback"
          subtitle="Tell us what to improve or what you want next"
          description="Share ideas, report bugs, vote on features"
          external
          onClick={onFeedback}
        />
      </SettingsSection>

      {/* Legal */}
      <SettingsSection title="Legal">
        <SettingsRow
          title="Terms of Service"
          external
          onClick={onTerms}
        />
        <SettingsRow
          title="Privacy Policy"
          external
          onClick={onPrivacy}
        />
      </SettingsSection>

      <footer className="settings-footer">
        BetweenUs · v1.0
      </footer>
    </main>
  );
}

/* Section */
function SettingsSection({ title, children }) {
  return (
    <section className="settings-section">
      <div className="settings-section-title">
        <h2>{title}</h2>
        <span />
      </div>
      <div className="settings-card">
        {children}
      </div>
    </section>
  );
}

/* Row */
function SettingsRow({
  title,
  subtitle,
  description,
  arrow,
  pencil,
  external,
  onClick,
}) {
  return (
    <button
      className="settings-row"
      type="button"
      onClick={onClick}
    >
      <div className="settings-row-content">
        <div className="settings-row-title">
          {title}
        </div>
        {subtitle && (
          <div className="settings-row-subtitle">
            {subtitle}
          </div>
        )}
        {description && (
          <div className="settings-row-description">
            {description}
          </div>
        )}
      </div>
      {arrow && (
        <span className="row-icon arrow">
          ›
        </span>
      )}
      {pencil && (
        <span className="row-icon" style={{ fontSize: "20px" }}>
          ✎
        </span>
      )}
      {external && (
        <span className="row-icon external">
          ↗️
        </span>
      )}
    </button>
  );
}
