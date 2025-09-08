import React from "react";

export default function ChatHeader({
  editingTitle,
  headerTitle,
  titleInput,
  setTitleInput,
  saveTitle,
  setEditingTitle,
  selectedId,
  shortGuid,
  showFullId,
  setShowFullId,
  copyIdToClipboard,
  inviteUserId,
  setInviteUserId,
  onInviteNumeric,
  inviteUsername,
  setInviteUsername,
  onInviteByUsername,
  getTitle,
}) {
  return (
    <header className="chat-header">
      <div style={{ display: "grid", gap: 6 }}>
        {!editingTitle ? (
          <div className="row space">
            <h2 style={{ margin: 0 }}>{headerTitle}</h2>
            <button className="btn" onClick={() => setEditingTitle(true)}>
              Rename
            </button>
          </div>
        ) : (
          <div className="row">
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Conversation title"
              style={{ maxWidth: 360 }}
            />
            <button className="btn" onClick={saveTitle}>
              Save
            </button>
            <button
              className="btn"
              onClick={() => {
                setEditingTitle(false);
                setTitleInput(getTitle(selectedId) || "");
              }}
            >
              Cancel
            </button>
          </div>
        )}
        <div className="id-chip">
          <span>ID</span>
          <code title={selectedId || ""}>{shortGuid(selectedId || "")}</code>
          <button
            className="btn btn--outline"
            onClick={() => setShowFullId((v) => !v)}
          >
            {showFullId ? "Hide" : "Reveal"}
          </button>
          {showFullId && <code title="full">{selectedId}</code>}
          <button className="btn btn--outline" onClick={copyIdToClipboard}>
            Copy
          </button>
        </div>
      </div>

      <div className="row">
        <input
          inputMode="numeric"
          placeholder="Invite userId (e.g. 55 — not a GUID)"
          value={inviteUserId}
          onChange={(e) => setInviteUserId(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <button className="btn" onClick={onInviteNumeric}>
          Invite
        </button>
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <input
          placeholder="Invite by username (e.g. alice)"
          value={inviteUsername}
          onChange={(e) => setInviteUsername(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <button className="btn" onClick={onInviteByUsername}>
          Invite
        </button>
      </div>
    </header>
  );
}
