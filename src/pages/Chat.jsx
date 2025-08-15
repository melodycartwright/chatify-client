import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  listConversations,
  listMessages,
  sendMessage,
  deleteMessage,
  inviteUser,
} from "../api/client.js";
import { sanitize } from "../utils/sanitize.js";


function fallbackGuid() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;}


export default function Chat() {
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //invite  multiple converstions
    const [inviteUserId, setInviteUserId] = useState("");
    const [localNewConvId, setLocalNewConvId] = useState('')

    const bottomRef = useRef(null);

    
  useEffect(() => {
    refreshConversations()
  }, [])

  useEffect(() => {
    if (selectedId) refreshMessages(selectedId)
  }, [selectedId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function refreshConversations() {
    setError(null)
    try {
      const data = await listConversations()
      setConversations(data || [])
      if (!selectedId && data?.length) setSelectedId(data[0].conversationId)
    } catch (e) {
      setError('Failed to load conversations')
    }
  }

  async function refreshMessages(conversationId) {
    setLoading(true)
    setError(null)
    try {
      const data = await listMessages(conversationId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (e) {
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  async function onSend(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value || !selectedId) return
    try {
      await sendMessage({ conversationId: selectedId, text: value })
      setText('')
      await refreshMessages(selectedId)
    } catch {
      setError('Failed to send message')
    }
  }

  async function onDeleteMessage(id) {
    try {
      await deleteMessage(id)
      await refreshMessages(selectedId)
    } catch {
      setError('Failed to delete message')
    }
  }

  function createNewConversationLocally() {
    const id = (crypto?.randomUUID?.() || fallbackGuid())
    setLocalNewConvId(id)
    setSelectedId(id)
    setMessages([]) // nothing yet
  }

  async function onInvite() {
    if (!selectedId || !inviteUserId) return
    try {
      await inviteUser({ userId: Number(inviteUserId), conversationId: selectedId })
      setInviteUserId('')
      await refreshConversations()
    } catch (e) {
      setError('Invite failed (use a unique GUID and a valid userId)')
    }
  }
  const selectedConversationLabel = useMemo(() => {
    if (!selectedId) return 'Select a conversation';
    return `Conversation: ${selectedId}`
  }, [selectedId])
  return (
       <div className="chat-grid">
      {/* left: conversations */}
      <section className="chat-sidebar">
        <div className="row">
          <button onClick={createNewConversationLocally}>+ New conversation</button>
        </div>

        {localNewConvId && (
          <div className="hint">
            New GUID: <code>{localNewConvId}</code><br/>
            Invite someone below so it becomes a shared thread.
          </div>
        )}

        <h3 style={{ marginTop: 12 }}>Your conversations</h3>
        <ul className="list">
          {conversations.map((c) => (
            <li key={c.conversationId}>
              <button
                className={selectedId === c.conversationId ? 'active' : ''}
                onClick={() => setSelectedId(c.conversationId)}
              >
                {c.conversationId}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* right: messages */}
      <section className="chat-main">
        <header className="row space">
          <h2>{selectedConversationLabel}</h2>
          {error && <div className="error">{error}</div>}
        </header>

        <div className="row">
          <input
            inputMode="numeric"
            placeholder="Invite userId (e.g. 55)"
            value={inviteUserId}
            onChange={(e) => setInviteUserId(e.target.value)}
            style={{ maxWidth: 220 }}
          />
          <button onClick={onInvite}>Invite to this conversation</button>
        </div>

        <div className="messages">
          {loading ? <p>Loading…</p> : null}
          {!loading && messages.length === 0 ? <p>No messages yet.</p> : null}

          {messages.map((m) => (
            <article className="message" key={m.id}>
              <div className="meta">
                <span>{m.username || m.user?.username || 'user'}</span>
                <span> • </span>
                <time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString()}</time>
              </div>
              <div
                className="bubble"
                dangerouslySetInnerHTML={{
                  __html: sanitize(String(m.text || '').replace(/\n/g, '<br/>'))
                }}
              />
              <div className="actions">
                <button onClick={() => onDeleteMessage(m.id)}>Delete</button>
              </div>
            </article>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="row" onSubmit={onSend}>
          <input
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" disabled={!selectedId || !text.trim()}>Send</button>
        </form>
      </section>
    </div>
  )}
