import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Mic, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FRONTEND_API_BASE_URL } from "../constants";
import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello. I am **Naruto**. How can I assist you with your studies today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Knowledge Base
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const messagesEndRef = useRef(null);

  // Speech
  const SpeechRecognition =
    window.SpeechRecognition || window['webkitSpeechRecognition'];
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    fetch("/knowledge_base.json")
      .then((res) => res.json())
      .then((data) => setKnowledgeBase(data))
      .catch((err) => console.error("KB Error:", err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (!recognition)
      return alert("Browser does not support speech recognition.");
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  if (recognition) {
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
  }

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ""));
    synth.speak(utterance);
  };

  const getContext = (query) => {
    if (!knowledgeBase.length) return "";
    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 3);
    const scores = [];
    knowledgeBase.forEach((doc) => {
      let score = 0;
      if (keywords.some((k) => doc.title.toLowerCase().includes(k))) score = 1;
      if (score > 0) scores.push({ chunk: `(File: ${doc.title})`, score });
    });
    return scores
      .slice(0, 3)
      .map((c) => c.chunk)
      .join("\n");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const context = getContext(userMessage.text);

      // Call backend API instead of Gemini directly
      const response = await fetch(`${FRONTEND_API_BASE_URL}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          context: context,
        }),
      });

      if (!response.ok) {
        let errorDetails = `Backend error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorDetails = errorData.error;
          if (errorData.details)
            console.error("Backend Error Details:", errorData.details);
        } catch (e) {
          // Could not parse JSON, stick with status code
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "ai", text: data.response },
      ]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: `Error: ${error.message}.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-title-group">
            <div className="bot-avatar-large">
              <Bot size={24} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                  color: "var(--text-main)",
                }}
              >
                Naruto Sensie
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                <span className="status-dot"></span> Online
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === "ai" ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="message-bubble">
                {msg.sender === "ai" && (
                  <button
                    className="category-btn"
                    style={{
                      width: "auto",
                      padding: 4,
                      float: "right",
                      marginLeft: 8,
                    }}
                    onClick={() => speakText(msg.text)}
                  >
                    <Volume2 size={14} />
                  </button>
                )}
                {msg.sender === "ai" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper ai">
              <div className="message-avatar">
                <Bot size={18} />
              </div>
              <div
                className="message-bubble"
                style={{ color: "var(--text-muted)" }}
              >
                <Loader2
                  className="animate-spin"
                  size={16}
                  style={{ marginRight: 8 }}
                />{" "}
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask a question..."
            rows={1}
            className="chat-input"
          />
          <button
            className={`voice-btn ${isListening ? "listening" : ""}`}
            onClick={toggleListening}
          >
            <Mic size={18} />
          </button>
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
