import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Tag } from "lucide-react"; // ✅ Added icons

function Chatbot() {
  const [open, setOpen] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.fullname || storedUser?.username || "there";
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: `👋 Hello <span style="color:#2563eb; font-weight:bold; text-decoration:underline;">${userName}</span>! I’m Oscar, your assistant. How can I help?` 

    }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // ✅ Track idle time
  const [idleTimer, setIdleTimer] = useState(null);
  const [lastUserInteraction, setLastUserInteraction] = useState(Date.now());
  const [suggestionShown, setSuggestionShown] = useState(false);

  const sendMessage = async (msg) => {
    const userText = msg || input;
    if (!userText.trim()) return;

    const userMsg = { sender: "user", text: userText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLastUserInteraction(Date.now()); // reset idle timer

    try {
      const res = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();

      let botReply = data.reply?.trim();

      if (!botReply) {
        botReply = "🤔 I didn’t catch that. What would you like to do next?";
      }

      // 🛒 Detect products
      if (botReply.includes("₱")) {
        const productText = botReply.trim();
        const products = productText
          .replace("Available Products:", "")
          .trim()
          .split(/🛒\s*/)
          .filter(Boolean)
          .map((item) => {
            const parts = item.split("–");
            return {
              name: parts[0]?.trim(),
              price: parts[1]?.trim(),
            };
          });

        botReply = { type: "product", heading: "Available Products:", items: products };
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, time: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error: Cannot connect.", time: new Date() },
      ]);
    }

    setInput("");
  };

  // ✅ Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Auto bot follow-up if idle
  useEffect(() => {
    if (suggestionShown) return; // ✅ stop if already shown

    const timer = setTimeout(() => {
    const now = Date.now();
      if (now - lastUserInteraction > 50000) { // 50 sec idle
        // const suggestions = [
        //   "🛍️ Want to see our Products?",
        //   "🚚 Need info about Payment?",
        //   "📞 Or Contact us directly?"
        // ];
        // const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

        setMessages((prev) => [
          ...prev,
          // { sender: "bot", text: randomSuggestion, time: new Date() },
          { sender: "bot", text: "💡 Still there? Need help with something?", time: new Date() } // ✅ always added
        ]);

        setSuggestionShown(true); // only once
      }
    }, 50000); // wait 10s idle

    return () => clearTimeout(timer);
  }, [lastUserInteraction, suggestionShown]);

  return (
    <>
      {/* Floating button */}
      <motion.div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          cursor: "pointer",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #9333ea)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            color: "white",
          }}
        >
          💬
        </div>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            style={{
              position: "fixed",
              bottom: "90px",
              right: "20px",
              width: "360px",
              height: "500px",
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 9999,
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1, #9333ea)",
                color: "white",
                padding: "14px",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              🛍️ Oscar Assistant
              <X
                size={20}
                style={{ cursor: "pointer" }}
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: "12px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "#f9fafb",
              }}
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                    background:
                      m.sender === "user"
                        ? "linear-gradient(135deg, #6366f1, #9333ea)"
                        : "#e5e7eb",
                    color: m.sender === "user" ? "white" : "black",
                    padding: "10px 14px",
                    borderRadius:
                      m.sender === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    maxWidth: "75%",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    fontSize: "14px",
                  }}
                >
                  {/* ✅ Render products */}
                  {m.text?.type === "product" ? (
                    <div>
                      <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
                        {m.text.heading}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                        }}
                      >
                        {m.text.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "white",
                              border: "1px solid #ddd",
                              borderRadius: "10px",
                              padding: "8px",
                              fontSize: "13px",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <ShoppingBag size={14} color="#6366f1" />
                              <span style={{ fontWeight: "bold" }}>{item.name}</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "green",
                                fontWeight: "600",
                              }}
                            >
                              <Tag size={14} color="green" />
                              {item.price}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                     <span dangerouslySetInnerHTML={{ __html: m.text }} />
                  )}

                  <div
                    style={{
                      fontSize: "10px",
                      marginTop: "4px",
                      opacity: 0.6,
                      textAlign: m.sender === "user" ? "right" : "left",
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
              <div ref={chatEndRef} />
            </div>

            {/* Quick replies */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                padding: "8px",
                background: "#f1f5f9",
                borderTop: "1px solid #ddd",
                justifyContent: "center",
              }}
            >
              {["🏠 Home", "📞 Contact", "🚚 Payment", "🛍️ Products"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => sendMessage(btn)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "16px",
                    border: "1px solid #ddd",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "13px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Input */}
            <div
              style={{
                display: "flex",
                padding: "10px",
                background: "white",
                borderTop: "1px solid #eee",
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setLastUserInteraction(Date.now()); // reset idle timer when typing
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  border: "1px solid #ddd",
                  borderRadius: "20px",
                  padding: "10px 14px",
                  outline: "none",
                  fontSize: "14px",
                  marginRight: "8px",
                }}
              />
              <button
                onClick={() => sendMessage()}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #9333ea)",
                  color: "white",
                  border: "none",
                  padding: "0 18px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;
