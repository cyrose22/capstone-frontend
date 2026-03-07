import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Tag,
  Send,
  Bot,
  MessageCircle,
  Sparkles,
  Phone,
  Truck,
  CreditCard,
  House,
} from "lucide-react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.fullname || storedUser?.username || "there";

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `👋 Hello <span style="color:#4f46e5; font-weight:700;">${userName}</span>! I’m Oscar, your assistant. How can I help you today?`,
      time: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const [lastUserInteraction, setLastUserInteraction] = useState(Date.now());
  const [suggestionShown, setSuggestionShown] = useState(false);

  const quickReplies = [
    { label: "Home", icon: <House size={14} /> },
    { label: "Products", icon: <ShoppingBag size={14} /> },
    { label: "Payment", icon: <CreditCard size={14} /> },
    { label: "Delivery", icon: <Truck size={14} /> },
    { label: "Contact", icon: <Phone size={14} /> },
  ];

  const formatFallbackReply = () =>
    `🤔 I didn't quite understand that.<br/><br/>
     You can ask me about:<br/>
     • 🛍️ Products<br/>
     • 🚚 Delivery<br/>
     • 💳 Payment methods<br/>
     • 📞 Contact information`;

  const sendMessage = async (msg) => {
    const userText = msg || input;
    if (!userText.trim()) return;

    const userMsg = {
      sender: "user",
      text: userText,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setLastUserInteraction(Date.now());
    setSuggestionShown(false);

    try {
      const res = await fetch("https://capstone-backend-kiax.onrender.com/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          userName,
        }),
      });

      const data = await res.json();
      let botReply = data.reply;

      if (!botReply) {
        botReply = formatFallbackReply();
      }

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: botReply,
            time: new Date(),
          },
        ]);
      }, 700);
    } catch (err) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "⚠️ I’m having trouble connecting right now. Please try again in a moment.",
            time: new Date(),
          },
        ]);
      }, 500);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (suggestionShown || !open) return;

    const timer = setTimeout(() => {
      const now = Date.now();
      if (now - lastUserInteraction > 50000) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "💡 Still there? I can help with products, delivery, payments, or contact details.",
            time: new Date(),
          },
        ]);
        setSuggestionShown(true);
      }
    }, 50000);

    return () => clearTimeout(timer);
  }, [lastUserInteraction, suggestionShown, open]);

  const renderMessageContent = (message) => {
    if (message.text?.type === "products") {
      return (
        <div>
          <div
            style={{
              marginBottom: "10px",
              fontWeight: 800,
              color: "#111827",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={15} color="#4f46e5" />
            {message.text.heading || "Available Products"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "10px",
            }}
          >
            {message.text.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "10px",
                  boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "54px",
                        height: "54px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        flexShrink: 0,
                        background: "#fff",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "12px",
                        background: "rgba(79,70,229,0.10)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ShoppingBag size={18} color="#4f46e5" />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#111827",
                        fontSize: "13px",
                        lineHeight: 1.35,
                        marginBottom: "6px",
                      }}
                    >
                      {item.name}
                    </div>

                    {item.category && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#f8fafc",
                          color: "#475569",
                          padding: "5px 9px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          fontSize: "11px",
                          marginBottom: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <ShoppingBag size={12} />
                        {item.category}
                      </div>
                    )}

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(34,197,94,0.10)",
                        color: "#15803d",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontWeight: 800,
                        fontSize: "12px",
                      }}
                    >
                      <Tag size={13} />
                      {item.price || "No price available"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <span dangerouslySetInnerHTML={{ __html: String(message.text) }} />;
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg, #6366f1, #7c3aed)",
          color: "#fff",
          boxShadow: "0 16px 30px rgba(99,102,241,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "fixed",
              bottom: "94px",
              right: "20px",
              width: "380px",
              height: "620px",
              maxWidth: "calc(100vw - 24px)",
              maxHeight: "calc(100vh - 120px)",
              background: "#ffffff",
              borderRadius: "26px",
              boxShadow: "0 30px 60px rgba(15,23,42,0.22)",
              overflow: "hidden",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                color: "#fff",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <Bot size={20} />
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: "14px" }}>Oscar Assistant</div>
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.9,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#86efac",
                        display: "inline-block",
                      }}
                    />
                    Online • Instant help
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#fff",
                  width: "34px",
                  height: "34px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: "#f8fafc",
                borderBottom: "1px solid #e5e7eb",
                color: "#64748b",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Ask about products, delivery, payments, or contact details.
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px",
                background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: m.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: m.text?.type === "products" ? "88%" : "80%",
                      background:
                        m.sender === "user"
                          ? "linear-gradient(135deg,#6366f1,#7c3aed)"
                          : "#ffffff",
                      color: m.sender === "user" ? "#ffffff" : "#111827",
                      border: m.sender === "bot" ? "1px solid #e5e7eb" : "none",
                      borderRadius:
                        m.sender === "user"
                          ? "20px 20px 8px 20px"
                          : "20px 20px 20px 8px",
                      padding: "12px 14px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
                    }}
                  >
                    {renderMessageContent(m)}
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                      marginTop: "4px",
                      padding: "0 4px",
                    }}
                  >
                    {m.time
                      ? new Date(m.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: "flex-start",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "20px 20px 20px 8px",
                    padding: "12px 14px",
                    boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
                  }}
                >
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.9,
                          delay: dot * 0.12,
                        }}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#94a3b8",
                          display: "inline-block",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderTop: "1px solid #e5e7eb",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "8px",
                  marginBottom: "8px",
                }}
              >
                {quickReplies.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => sendMessage(btn.label)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      padding: "8px 12px",
                      borderRadius: "999px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setLastUserInteraction(Date.now());
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    height: "46px",
                    borderRadius: "16px",
                    border: "1px solid #dbe2ea",
                    background: "#f8fafc",
                    padding: "0 14px",
                    outline: "none",
                    fontSize: "14px",
                    color: "#111827",
                  }}
                />

                <button
                  onClick={() => sendMessage()}
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "16px",
                    border: "none",
                    cursor: "pointer",
                    background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 20px rgba(99,102,241,0.28)",
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;