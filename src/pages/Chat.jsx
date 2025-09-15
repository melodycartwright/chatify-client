import MessageItem from "../components/MessageItem.jsx";
import MessageList from "../components/MessageList.jsx";
import ConversationList from "../components/ConversationList.jsx";
import ChatHeader from "../components/ChatHeader.jsx";

function extractAuthorId(msg) {
  const m = msg || {};
  if (m.userId != null) return m.userId;
  if (m.userid != null) return m.userid;
  if (m.userID != null) return m.userID;
  if (m.authorId != null) return m.authorId;
  if (m.senderId != null) return m.senderId;
  if (typeof m.user === "number") return m.user;
  if (m.user?.userId != null) return m.user.userId;
  if (m.user?.id != null) return m.user.id;
  if (typeof m.createdBy === "number") return m.createdBy;
  if (m.createdBy?.userId != null) return m.createdBy.userId;
  if (m.createdBy?.id != null) return m.createdBy.id;
  return null;
}
function deriveParticipants(messages, me) {
  const set = new Set();
  for (const m of messages) {
    const u = extractAuthorName(m) || "";
    if (u && u.toLowerCase() !== (me || "").toLowerCase()) set.add(u);
  }
  return Array.from(set);
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  listConversations,
  listMessages,
  sendMessage,
  deleteMessage,
  inviteUser,
  listUsers,
  getUserById,
} from "../api/client.js";
import { sanitize } from "../utils/sanitize.js";
import Banner from "../components/Banner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getTitle, setTitle, getAllTitles } from "../utils/titles.js";
import { logError, logInfo } from "../logging/sentry.js";

function fallbackGuid() {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
function shortGuid(id) {
  return id ? id.slice(0, 4) + "…" + id.slice(-4) : "";
}
function fallbackAvatar(seed) {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(
    String(seed || "U")
  )}`;
}
function normalizeConversationsPayload(data) {
  const ids = new Set();
  const add = (val) => {
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (typeof item === "string") ids.add(item);
        else if (item?.conversationId) ids.add(item.conversationId);
        else if (item?.id) ids.add(item.id);
      });
    } else if (typeof val === "string") {
      ids.add(val);
    } else if (val && typeof val === "object") {
      add(val.participating);
      add(val.invites?.sent);
      add(val.invites?.received);
      add(val.invitesSent);
      add(val.invitesReceived);
      add(val.items);
    }
  };
  add(data);
  return Array.from(ids).map((id) => ({ conversationId: id }));
}

function extractAuthorName(msg) {
  return (
    msg?.username ||
    msg?.userName ||
    msg?.user?.username ||
    msg?.user?.name ||
    msg?.author?.username ||
    msg?.sender?.username ||
    msg?.createdBy?.username ||
    msg?.createdByName ||
    msg?.name ||
    msg?.userid ||
    msg?.author?.name ||
    null
  );
}

// ...existing code...

function authorNameOf(m) {
  const mid = extractAuthorId(m);
  if (mid != null) {
    if (user?.userId != null && String(mid) === String(user.userId)) {
      return user?.username || "Me";
    }
    // Always use cached username for recipient if available
    const cached = peopleCache[String(mid)]?.username;
    if (cached && cached !== "user") return cached;
    // If not cached, fetch and update cache (async side effect)
    if (!cached) {
      getUserById(Number(mid)).then((u) => {
        if (u?.username) {
          setPeopleCache((prev) => ({
            ...prev,
            [String(mid)]: {
              username: u.username,
              avatar:
                (u?.avatar && String(u.avatar).trim()) ||
                fallbackAvatar(u.username || mid),
            },
          }));
          setForceUpdate((f) => f + 1); // force re-render
        }
      });
    }
    // While fetching, show 'Loading…' for clarity
    return "Loading…";
  }
  // Fallback to extracting from message
  const explicit = extractAuthorName(m);
  if (explicit) return explicit;
  // If only one participant, use conversation title as fallback
  if (participants.length === 1) {
    return headerTitle;
  }
  return "Loading…";
}
// Returns the delivery stage for a message (e.g., sent, delivered, read)
function deliveryStageOf(message) {
  // Example logic: you may want to adjust this based on your app's message schema
  if (message.readAt) return "read";
  if (message.deliveredAt) return "delivered";
  if (message.sentAt) return "sent";
  return "pending";
}
// Returns a symbol or emoji for the delivery stage
function deliverySymbol(stage) {
  switch (stage) {
    case "read":
      return "✅";
    case "delivered":
      return "📬";
    case "sent":
      return "✉️";
    case "pending":
      return "⏳";
    default:
      return "";
  }
}

export default function Chat() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);

  const [titleMap, setTitleMap] = useState(getAllTitles());
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const [localNewConvId, setLocalNewConvId] = useState("");
  const [showFullId, setShowFullId] = useState(false);

  const [peopleCache, setPeopleCache] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0);

  const bottomRef = useRef(null);

  useEffect(() => {
    refreshConversations();
  }, []);
  useEffect(() => {
    if (selectedId) initialLoadMessages(selectedId);
  }, [selectedId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cache user info
  useEffect(() => {
    if (!user?.userId) return;
    setPeopleCache((prev) => ({
      ...prev,
      [String(user.userId)]: {
        username: user.username || "me",
        avatar:
          (user?.avatar && String(user.avatar).trim()) ||
          fallbackAvatar(user?.username || user?.userId),
      },
    }));
  }, [user?.userId, user?.username, user?.avatar]);

  const inflightRef = useRef(false);
  const msgsSigRef = useRef("");
  const msgTimerRef = useRef(null);
  const convTimerRef = useRef(null);

  useEffect(() => {
    clearInterval(msgTimerRef.current);
    clearInterval(convTimerRef.current);
    if (!selectedId) return;

    const tickMsgs = async () => {
      if (document.visibilityState !== "visible") return;
      if (inflightRef.current) return;
      inflightRef.current = true;
      try {
        await refreshMessages(selectedId, true);
      } catch (e) {
        logError(e, { where: "tickMsgs", selectedId });
      } finally {
        inflightRef.current = false;
      }
    };
    const tickConvos = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        await refreshConversations(true);
      } catch (e) {
        logError(e, { where: "tickConvos" });
      }
    };

    msgTimerRef.current = setInterval(tickMsgs, 4000);
    convTimerRef.current = setInterval(tickConvos, 10000);
    return () => {
      clearInterval(msgTimerRef.current);
      clearInterval(convTimerRef.current);
    };
  }, [selectedId]);

  async function refreshConversations(silent = false) {
    try {
      const raw = await listConversations();
      const normalized = normalizeConversationsPayload(raw);
      setConversations(normalized);
      if (!selectedId && normalized.length)
        setSelectedId(normalized[0].conversationId);
    } catch (e) {
      logError(e, { where: "refreshConversations" });
      if (!silent)
        setBanner({ kind: "error", msg: "Failed to load conversations." });
      setConversations([]);
    }
  }

  async function initialLoadMessages(conversationId) {
    setLoading(true);
    await refreshMessages(conversationId, false);
    setLoading(false);
  }

  async function refreshMessages(conversationId, silent = true) {
    try {
      const raw = await listMessages(conversationId);
      let msgs = [];
      if (Array.isArray(raw)) msgs = raw;
      else if (Array.isArray(raw?.messages)) msgs = raw.messages;
      else if (Array.isArray(raw?.items)) msgs = raw.items;

      const last = msgs[msgs.length - 1];
      const sig = `${msgs.length}:${last?.id ?? ""}:${last?.createdAt ?? ""}`;
      if (silent && sig === msgsSigRef.current) return;
      msgsSigRef.current = sig;

      setMessages(msgs);
      if (!silent) {
        setTitleInput(getTitle(conversationId) || "");
        setEditingTitle(false);
      }
      try {
        await ensurePeople(msgs);
      } catch (e) {
        logError(e, { where: "ensurePeople", count: msgs.length });
      }
    } catch (e) {
      logError(e, { where: "refreshMessages", conversationId });
      if (!silent) {
        setMessages([]);
        setBanner({ kind: "error", msg: "Failed to load messages." });
      }
    }
  }

  async function ensurePeople(msgs) {
    const toFetch = new Set();
    for (const m of msgs) {
      const id = extractAuthorId(m);
      if (id == null) continue;
      const key = String(id);
      // Always fetch if not cached, even if message lacks username
      if (!peopleCache[key]) {
        toFetch.add(key);
      } else {
        if (!peopleCache[key].avatar) toFetch.add(key);
      }
      if (toFetch.size >= 10) break;
    }
    if (!toFetch.size) return;

    const results = await Promise.allSettled(
      Array.from(toFetch).map(async (key) => {
        const u = await getUserById(Number(key));
        const username =
          u?.username || u?.userName || peopleCache[key]?.username || null;
        const avatar = (u?.avatar && String(u.avatar).trim()) || null;
        return [key, { username, avatar }];
      })
    );

    const updates = {};
    for (const r of results) {
      if (r.status === "fulfilled") {
        const [key, rec] = r.value;
        const final = {
          username: rec.username || peopleCache[key]?.username || "user",
          avatar:
            rec.avatar ||
            peopleCache[key]?.avatar ||
            fallbackAvatar(rec.username || key),
        };
        updates[key] = final;
      }
    }
    if (Object.keys(updates).length) {
      setPeopleCache((prev) => ({ ...prev, ...updates }));
    }
  }

  async function onSend(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value || !selectedId) return;
    try {
      const tempId = "temp_" + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          text: value,
          username: user?.username || undefined,
          userId: user?.userId ?? undefined,
          createdAt: new Date().toISOString(),
        },
      ]);
      setText("");
      await sendMessage({ conversationId: selectedId, text: value });
      await refreshMessages(selectedId, true);
      setBanner(null);
    } catch (e) {
      logError(e, { where: "onSend", selectedId });
      setBanner({ kind: "error", msg: "Failed to send message." });
    }
  }

  async function onDeleteMessage(id) {
    if (String(id).startsWith("temp_")) return;
    try {
      await deleteMessage(id);
      await refreshMessages(selectedId, true);
      setBanner({ kind: "success", msg: "Message deleted." });
    } catch (e) {
      logError(e, { where: "onDeleteMessage", id });
      setBanner({ kind: "error", msg: "Failed to delete message." });
    }
  }

  function createNewConversationLocally() {
    const id = crypto?.randomUUID?.() || fallbackGuid();
    setLocalNewConvId(id);
    setSelectedId(id);
    setMessages([]);
    setTitleInput("");
    setEditingTitle(true);
    setBanner({
      kind: "info",
      msg: "New conversation created. Invite a user to start chatting.",
    });
    logInfo("local conversation created", { conversationId: id });
  }

  async function inviteKnownUserId(id) {
    if (!selectedId) {
      setBanner({
        kind: "error",
        msg: "Select or create a conversation first.",
      });
      return;
    }
    try {
      await inviteUser({ userId: id, conversationId: selectedId });
      try {
        const invited = await getUserById(id);
        if (invited?.username) {
          setTitle(selectedId, invited.username);
          setTitleMap(getAllTitles());
          setTitleInput(invited.username);
          // Cache invited user's name and avatar for display
          setPeopleCache((prev) => ({
            ...prev,
            [String(id)]: {
              username: invited.username,
              avatar:
                (invited?.avatar && String(invited.avatar).trim()) ||
                fallbackAvatar(invited.username || id),
            },
          }));
        }
      } catch {}
      setInviteUserId("");
      await refreshConversations(true);
      setBanner({ kind: "success", msg: "Invite sent." });
    } catch (e) {
      logError(e, { where: "inviteKnownUserId", id, selectedId });
      const msg =
        e?.response?.data?.error ||
        "Invite failed (use a unique GUID and a valid userId)";
      if (String(msg).toLowerCase().includes("already exists")) {
        setBanner({
          kind: "error",
          msg: "Invite with this conversation ID already exists. Click “New conversation” for a fresh GUID.",
        });
      } else {
        setBanner({ kind: "error", msg });
      }
    }
  }
  async function onInviteNumeric() {
    const id = Number(inviteUserId);
    if (!Number.isInteger(id)) {
      setBanner({
        kind: "error",
        msg: "UserId must be a number (e.g. 55), not a GUID.",
      });
      return;
    }
    await inviteKnownUserId(id);
  }
  async function onInviteByUsername() {
    const name = inviteUsername.trim();
    if (!name) return;
    if (!selectedId) {
      setBanner({
        kind: "error",
        msg: "Select or create a conversation first.",
      });
      return;
    }
    try {
      const data = await listUsers({ username: name, limit: 10 });
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : [];
      const exact =
        arr.find(
          (u) => (u.username || "").toLowerCase() === name.toLowerCase()
        ) || arr[0];
      if (!exact) {
        setBanner({ kind: "error", msg: `No user found for “${name}”.` });
        return;
      }
      await inviteKnownUserId(Number(exact.userId));
      setInviteUsername("");
    } catch (e) {
      logError(e, { where: "onInviteByUsername", name });
      const msg = e?.response?.data?.error || "Invite failed.";
      setBanner({ kind: "error", msg });
    }
  }
  async function onSearchUsers(e) {
    e?.preventDefault?.();
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await listUsers({ username: searchTerm.trim(), limit: 10 });
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : [];
      setResults(arr);
    } catch (e) {
      logError(e, { where: "onSearchUsers", q: searchTerm.trim() });
      setBanner({ kind: "error", msg: "Search failed." });
    } finally {
      setSearching(false);
    }
  }

  function saveTitle() {
    const t = titleInput.trim();
    setTitle(selectedId, t || null);
    setTitleMap(getAllTitles());
    setEditingTitle(false);
  }
  function copyIdToClipboard() {
    if (!selectedId) return;
    navigator.clipboard?.writeText(selectedId).then(() => {
      setBanner({ kind: "success", msg: "Conversation ID copied." });
      setTimeout(() => setBanner(null), 1200);
    });
  }

  const participants = useMemo(
    () => deriveParticipants(messages, user?.username),
    [messages, user?.username]
  );
  const headerTitle = useMemo(() => {
    if (!selectedId) return "No conversation selected";
    const custom = getTitle(selectedId);
    if (custom) return custom;
    if (participants.length > 0)
      return participants.length === 1
        ? participants[0]
        : `Group: ${participants.join(", ")}`;
    return "New conversation";
  }, [selectedId, participants, titleMap]);

  function isMine(m) {
    const mid = extractAuthorId(m);
    if (mid != null && user?.userId != null)
      return String(mid) === String(user.userId);
    const name = extractAuthorName(m);
    return !!(
      name &&
      user?.username &&
      name.toLowerCase() === user.username.toLowerCase()
    );
  }
  function authorNameOf(m) {
    const mid = extractAuthorId(m);
    if (mid != null) {
      if (user?.userId != null && String(mid) === String(user.userId)) {
        return user?.username || "Me";
      }
      const cached = peopleCache[String(mid)]?.username;
      if (cached && cached !== "user") return cached;
      if (!cached) {
        console.log("authorNameOf: Fetching user for userId:", mid, m);
        getUserById(Number(mid)).then((u) => {
          console.log("authorNameOf: getUserById result for", mid, u);
          if (u?.username) {
            setPeopleCache((prev) => ({
              ...prev,
              [String(mid)]: {
                username: u.username,
                avatar:
                  (u?.avatar && String(u.avatar).trim()) ||
                  fallbackAvatar(u.username || mid),
              },
            }));
            setForceUpdate((f) => f + 1); // force re-render
          }
        });
      }
      if (participants.length === 1) {
        return headerTitle;
      }
      return "";
    }
    const explicit = extractAuthorName(m);
    if (explicit) return explicit;
    if (participants.length === 1) {
      return headerTitle;
    }
    return "";
  }
  function avatarUrlOf(m) {
    const mine = isMine(m);
    if (mine) {
      return (
        (user?.avatar && String(user.avatar).trim()) ||
        fallbackAvatar(user?.username || user?.userId)
      );
    }
    const direct =
      m?.avatar ||
      m?.user?.avatar ||
      m?.author?.avatar ||
      m?.sender?.avatar ||
      m?.createdBy?.avatar ||
      null;
    if (direct && String(direct).trim()) return direct;
    const mid = extractAuthorId(m);
    if (mid != null) {
      const cached = peopleCache[String(mid)]?.avatar;
      if (cached) return cached;
      const name =
        peopleCache[String(mid)]?.username || extractAuthorName(m) || mid;
      return fallbackAvatar(name);
    }
    const seed = extractAuthorName(m) || "user";
    return fallbackAvatar(seed);
  }

  return (
    <div className="chat-grid">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        titleMap={titleMap}
        shortGuid={shortGuid}
        results={results}
        inviteKnownUserId={inviteKnownUserId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchUsers={onSearchUsers}
        searching={searching}
        localNewConvId={localNewConvId}
        setBanner={setBanner}
        createNewConversationLocally={createNewConversationLocally}
      />

      <section className="chat-main">
 
        <ChatHeader
          editingTitle={editingTitle}
          headerTitle={headerTitle}
          titleInput={titleInput}
          setTitleInput={setTitleInput}
          saveTitle={saveTitle}
          setEditingTitle={setEditingTitle}
          selectedId={selectedId}
          shortGuid={shortGuid}
          showFullId={showFullId}
          setShowFullId={setShowFullId}
          copyIdToClipboard={copyIdToClipboard}
          inviteUserId={inviteUserId}
          setInviteUserId={setInviteUserId}
          onInviteNumeric={onInviteNumeric}
          inviteUsername={inviteUsername}
          setInviteUsername={setInviteUsername}
          onInviteByUsername={onInviteByUsername}
          getTitle={getTitle}
        />
        {banner && (
          <Banner kind={banner.kind} onClose={() => setBanner(null)}>
            {banner.msg}
          </Banner>
        )}
        <MessageList
          messages={messages}
          loading={loading}
          isMine={isMine}
          authorNameOf={authorNameOf}
          avatarUrlOf={avatarUrlOf}
          deliveryStageOf={deliveryStageOf}
          onDeleteMessage={onDeleteMessage}
          bottomRef={bottomRef}
        />
        <form className="form-row" onSubmit={onSend}>
          <input
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="btn"
            disabled={!selectedId || !text.trim()}
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
