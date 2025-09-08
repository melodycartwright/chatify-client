import React from "react";
import MessageItem from "./MessageItem.jsx";

export default function MessageList({
  messages,
  loading,
  isMine,
  authorNameOf,
  avatarUrlOf,
  deliveryStageOf,
  onDeleteMessage,
  bottomRef,
}) {
  return (
    <div className="messages">
      {loading && <p>Loading…</p>}
      {!loading && messages.length === 0 && <p>No messages yet.</p>}
      {messages.map((m) => (
        <MessageItem
          key={m.id}
          message={m}
          mine={isMine(m)}
          author={authorNameOf(m)}
          avatar={avatarUrlOf(m)}
          stage={deliveryStageOf(m)}
          onDelete={onDeleteMessage}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
