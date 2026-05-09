import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, X, Sparkles } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

export function AIChatBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "أهلاً! I'm Nūr, your Arabic learning companion. Ask me anything — translations, grammar, or how to navigate the academy." },
  ]);

  const send = () => {
    if (!input.trim()) return;
    const user = input.trim();
    setMessages((m) => [...m, { role: "user", text: user }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Beautiful question. (Connect Lovable AI to enable live responses.)" },
      ]);
    }, 600);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-3xl border bg-card shadow-elegant"
          >
            <div className="flex items-center justify-between gradient-emerald px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-serif text-base leading-tight">Nūr · AI Assistant</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-70">Always here to help</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-3">
              <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask in English or العربية..."
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button onClick={send} className="grid h-8 w-8 place-items-center rounded-full gradient-gold">
                  <Send className="h-4 w-4 text-gold-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Assistant"
        className="fixed bottom-6 right-6 z-50 grid h-16 w-16 place-items-center rounded-full gradient-emerald shadow-elegant ring-4 ring-gold/30"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
        <Brain className="relative h-7 w-7 text-primary-foreground" />
      </motion.button>
    </>
  );
}
