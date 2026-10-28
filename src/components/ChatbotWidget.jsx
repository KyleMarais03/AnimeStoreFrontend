import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "./ChatbotWidget.css";

const STARTER_MESSAGE = {
    role: "bot",
    text: "Hi, I am AniBot. Ask me about products, stock, delivery, or recommendations."
};

function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState([STARTER_MESSAGE]);
    const [latestSuggestions, setLatestSuggestions] = useState([]);
    const [provider, setProvider] = useState("fallback");
    const messageAreaRef = useRef(null);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const buildHistory = () =>
        messages
            .filter((message) => message.role === "user" || message.role === "bot")
            .slice(-8)
            .map((message) => ({
                role: message.role === "bot" ? "assistant" : "user",
                content: message.text
            }));

    const appendToLatestBot = (chunk) => {
        setMessages((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
                if (next[i].role === "bot") {
                    next[i] = { ...next[i], text: `${next[i].text}${chunk}` };
                    break;
                }
            }
            return next;
        });
    };

    const replaceLatestBot = (text) => {
        setMessages((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
                if (next[i].role === "bot") {
                    next[i] = { ...next[i], text };
                    break;
                }
            }
            return next;
        });
    };

    const handleSseEvent = (rawEvent) => {
        const lines = rawEvent.split("\n").filter((line) => line.length > 0);
        const eventLine = lines.find((line) => line.startsWith("event:"));
        const dataLines = lines.filter((line) => line.startsWith("data:"));

        const eventType = eventLine ? eventLine.slice(6).trim() : "message";
        const data = dataLines
            .map((line) => {
                let value = line.slice(5);
                if (value.startsWith(" ")) {
                    value = value.slice(1);
                }
                return value;
            })
            .join("\n");

        if (eventType === "meta") {
            const meta = JSON.parse(data);
            setProvider(meta.provider || "fallback");
            setLatestSuggestions(meta.suggestions || []);
            return false;
        }

        if (eventType === "chunk") {
            appendToLatestBot(data);
            return false;
        }

        if (eventType === "error") {
            throw new Error(data || "Streaming failed");
        }

        return eventType === "done";
    };

    const streamResponse = async (trimmed, history) => {
        const token = localStorage.getItem("userToken");
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${api.defaults.baseURL}/chatbot/stream`, {
            method: "POST",
            headers,
            body: JSON.stringify({ message: trimmed, history })
        });

        if (!response.ok) {
            throw new Error(`STREAM_HTTP_${response.status}`);
        }
        if (!response.body) {
            throw new Error("Streaming not supported by this browser");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let doneEventReceived = false;

        while (!doneEventReceived) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            buffer = buffer.replace(/\r/g, "");
            let separatorIndex = buffer.indexOf("\n\n");

            while (separatorIndex !== -1) {
                const rawEvent = buffer.slice(0, separatorIndex);
                buffer = buffer.slice(separatorIndex + 2);

                if (rawEvent.trim()) {
                    doneEventReceived = handleSseEvent(rawEvent);
                }
                separatorIndex = buffer.indexOf("\n\n");
            }
        }
    };

    const nonStreamingFallback = async (trimmed, history) => {
        const response = await api.post("/chatbot/ask", { message: trimmed, history });
        const answer = response.data?.answer || "I could not generate a response right now.";
        const suggestions = response.data?.suggestions || [];
        const responseProvider = response.data?.provider || "fallback";

        setLatestSuggestions(suggestions);
        setProvider(responseProvider);
        replaceLatestBot(answer);
    };

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        const history = buildHistory();

        setMessages((prev) => [...prev, { role: "user", text: trimmed }, { role: "bot", text: "" }]);
        setInput("");
        setSending(true);
        setLatestSuggestions([]);

        try {
            await streamResponse(trimmed, history);
        } catch (error) {
            console.error("Chatbot streaming failed:", error);
            if (String(error?.message || "").includes("STREAM_HTTP_429")) {
                replaceLatestBot("Too many requests. Please wait a moment and try again.");
            } else {
                try {
                    await nonStreamingFallback(trimmed, history);
                } catch (fallbackError) {
                    console.error("Chatbot fallback failed:", fallbackError);
                    replaceLatestBot("I am having trouble responding right now. Please try again shortly.");
                }
            }
        } finally {
            setSending(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage(input);
    };

    const quickAsk = (text) => {
        sendMessage(text);
    };

    return (
        <>
            <button
                type="button"
                className="chatbot-fab btn btn-primary rounded-circle shadow"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
            >
                <i className={`bi ${isOpen ? "bi-x-lg" : "bi-chat-dots-fill"}`}></i>
            </button>

            {isOpen && (
                <section className="chatbot-panel card shadow-lg border-0">
                    <header className="chatbot-header card-header text-white d-flex align-items-center justify-content-between">
                        <div className="fw-semibold">
                            <i className="bi bi-robot me-2"></i>
                            AniBot Assistant
                        </div>
                        <span className="badge bg-light text-dark">{provider === "openai" ? "AI" : "Local"}</span>
                    </header>

                    <div className="chatbot-body card-body" ref={messageAreaRef}>
                        {messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={`chatbot-message ${message.role === "user" ? "user" : "bot"}`}
                            >
                                {message.text}
                            </div>
                        ))}

                    </div>

                    {latestSuggestions.length > 0 && (
                        <div className="chatbot-suggestions px-3 pb-2">
                            {latestSuggestions.map((item) => (
                                <Link
                                    key={item.productId}
                                    className="chatbot-product-link"
                                    to={`/product/${item.productId}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name} - R {Number(item.price).toFixed(2)}
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="chatbot-quick-actions px-3 pb-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => quickAsk("recommend products")}>
                            Recommend
                        </button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => quickAsk("delivery info")}>
                            Delivery
                        </button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => quickAsk("show hoodies")}>
                            Hoodies
                        </button>
                    </div>

                    <form className="chatbot-input border-top p-2" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Type your question..."
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                disabled={sending}
                            />
                            <button className="btn btn-primary" type="submit" disabled={sending || !input.trim()}>
                                Send
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
}

export default ChatbotWidget;
