import React from "react";

export default function ConversationList({
  conversations,
  selectedId,
  setSelectedId,
  titleMap,
  shortGuid,
  results,
  inviteKnownUserId,
  searchTerm,
  setSearchTerm,
  onSearchUsers,
  searching,
  localNewConvId,
  setBanner,
  createNewConversationLocally,
}) {
  return (
    <section className="chat-sidebar">
      <div className="row">
        <button
          className="btn btn--success"
          onClick={createNewConversationLocally}
        >
          + New conversation
        </button>
      </div>

      {localNewConvId && (
        <div className="hint" style={{ marginTop: 8 }}>
          New GUID: <code>{localNewConvId}</code>
          <br />
          Invite someone so it becomes a shared thread.
        </div>
      )}

      <h3 style={{ marginTop: 12 }}>Find users</h3>
      <form className="row" onSubmit={onSearchUsers}>
        <input
          placeholder="Search by username…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn" type="submit" disabled={searching}>
          {searching ? "…" : "Search"}
        </button>
      </form>
      <ul className="list" style={{ marginTop: 8 }}>
        {results.map((u) => (
          <li key={u.userId}>
            <button
              title={`userId ${u.userId}`}
              onClick={() => inviteKnownUserId(Number(u.userId))}
            >
              Invite {u.username} (id: {u.userId})
            </button>
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: 12 }}>Your conversations</h3>
      <ul className="list">
        {conversations.map((c) => {
          const t = titleMap[c.conversationId] || shortGuid(c.conversationId);
          return (
            <li key={c.conversationId}>
              <button
                className={selectedId === c.conversationId ? "active" : ""}
                onClick={() => {
                  setSelectedId(c.conversationId);
                  setBanner && setBanner(null);
                }}
                title={c.conversationId}
              >
                {t}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
