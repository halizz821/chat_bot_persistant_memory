"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [messages, setMessages] = useState([
    { type: "ai", content: "Hello! I am your persistent memory chatbot powered by LangGraph. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { type: "human", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, thread_id: "portfolio_thread_fresh_17" })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { type: "ai", content: data.reply, used_tool: data.used_tool }]);
      } else if (data.detail) {
        setMessages(prev => [...prev, { type: "ai", content: `Error: ${data.detail}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: "ai", content: "Error connecting to the backend. Please ensure the FastAPI server is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.chatPanel}>
        <div className={styles.header}>
          <h1>Nexus Agent</h1>
          <div className={styles.badge}>Developed by Hamed Alizadeh</div>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.messageWrapper} ${m.type === "human" ? styles.user : styles.ai}`}>
              <div className={styles.bubble}>
                {m.used_tool && <div className={styles.toolBadge}>🌐 Used Internet Search</div>}
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.messageWrapper} ${styles.ai}`}>
              <div className={styles.bubble}>
                <span className={styles.dots}>...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <form onSubmit={sendMessage} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message to the agent..."
            className={styles.inputBox}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className={styles.sendButton}>
            Send
          </button>
        </form>
      </main>

      <aside className={styles.archPanel}>
        <div className={styles.panelSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.archTitle}>System Architecture</h2>
            <p className={styles.archSub}>Powered by LangGraph & Persistent Memory</p>
          </div>
          <div className={styles.graphContainer}>
            <img
              src="http://localhost:8000/graph"
              alt="LangGraph Architecture Diagram"
              className={styles.graphImage}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<p style="color: rgba(255,255,255,0.4)">Start the backend to view the generated architecture diagram.</p>';
              }}
            />
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.panelSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.archTitle}>Tech Stack</h2>
            <p className={styles.archSub}>Modern & Scalable Components</p>
          </div>
          <div className={styles.techStack}>
            <div className={styles.techItem}>
              <div className={styles.techLabel}>
                <strong>Frontend</strong>
              </div>
              <div className={styles.techValue}>
                <span>Next.js & React</span>
                <div className={styles.logoGroup}>
                  <img src="https://cdn.simpleicons.org/nextdotjs/white" alt="Next.js" className={styles.techLogo} />
                  <img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" className={styles.techLogo} />
                </div>
              </div>
            </div>
            <div className={styles.techItem}>
              <div className={styles.techLabel}>
                <strong>Backend</strong>
              </div>
              <div className={styles.techValue}>
                <span>FastAPI & Python</span>
                <div className={styles.logoGroup}>
                  <img src="https://cdn.simpleicons.org/fastapi/009688" alt="FastAPI" className={styles.techLogo} />
                  <img src="https://cdn.simpleicons.org/python/3776AB" alt="Python" className={styles.techLogo} />
                </div>
              </div>
            </div>
            <div className={styles.techItem}>
              <div className={styles.techLabel}>
                <strong>Agent Engine</strong>
              </div>
              <div className={styles.techValue}>
                <span>LangGraph</span>
                <div className={styles.logoGroup}>
                  <img src="https://cdn.simpleicons.org/langchain/white" alt="LangGraph" className={styles.techLogo} />
                </div>
              </div>
            </div>
            <div className={styles.techItem}>
              <div className={styles.techLabel}>
                <strong>LLM</strong>
              </div>
              <div className={styles.techValue}>
                <span>llama-3.1 8b (Groq)</span>  {/* Gemini 1.5 Flash */}
                <div className={styles.logoGroup}>
                  <img src="https://cdn.simpleicons.org/meta/white" alt="Llama Meta" className={styles.techLogo} />
                </div>
              </div>
            </div>
            <div className={styles.techItem}>
              <div className={styles.techLabel}>
                <strong>Search Tool</strong>
              </div>
              <div className={styles.techValue}>
                <span>Tavily Internet Search</span>
                <div className={styles.logoGroup}>
                  <img src="https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@latest/icons/tavily-color.svg" alt="Tavily" className={styles.techLogo} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
