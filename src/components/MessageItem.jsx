import React from "react";

export default function MessageItem({
  message,
  mine,
  author,
  avatar,
  stage,
  onDelete,
}) {
  return (
    <div
      className={`msg-row ${mine ? "me" : "them"}`}
      style={{ justifyContent: mine ? "flex-end" : "flex-start" }}
    >
      {!mine && (
        <img
          className="msg-avatar"
          src={avatar}
          alt={`${author} avatar`}
          loading="lazy"
        />
      )}
      <div style={{ display: "grid", gap: 4, maxWidth: 400 }}>
        <div className="meta" style={{ textAlign: mine ? "right" : "left" }}>
          <span>{author}</span>
          <span> • </span>
          <time dateTime={message.createdAt}>
            {new Date(message.createdAt).toLocaleString()}
          </time>
          {mine && (
            <span
              className={`ticks ticks--${stage}`}
              title={
                stage === "sending"
                  ? "Sending"
                  : stage === "read"
                  ? "Read"
                  : "Sent"
              }
              aria-label={stage}
            >
              {/* deliverySymbol(stage) */}
            </span>
          )}
        </div>
        <div
          className={`bubble ${mine ? "bubble--me" : "bubble--them"}`}
          style={{ textAlign: mine ? "right" : "left" }}
          dangerouslySetInnerHTML={{
            __html: message.text.replace(/\n/g, "<br/>"),
          }}
        />
        <div className="actions" style={{ textAlign: mine ? "right" : "left" }}>
          <button onClick={() => onDelete(message.id)}>Delete</button>
        </div>
      </div>
      {mine && (
        <img
          className="msg-avatar"
          src={avatar}
          alt={`${author} avatar`}
          loading="lazy"
        />
      )}
    </div>
  );
}
