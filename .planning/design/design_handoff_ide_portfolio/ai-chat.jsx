const { useState: useS3, useRef: useR3, useEffect: useE3 } = React;

// ─────────────── AI CHAT WIDGET ───────────────
function AIChat() {
  const [open, setOpen] = useS3(false);
  const [messages, setMessages] = useS3([
    { role: "ai", text: "Hi — I'm Alex's portfolio assistant. Ask me about test strategy, AI eval pipelines, or hiring me." },
  ]);
  const [input, setInput] = useS3("");
  const [busy, setBusy] = useS3(false);
  const inputRef = useR3(null);
  const bodyRef = useR3(null);

  useE3(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, busy]);

  const send = async (q) => {
    const text = (q ?? input).trim();
    if (!text || busy) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const sys = `You are the AI assistant on the portfolio site of Alex Morgan — a Senior SDET & AI Automation Engineer with 9 years of experience. Alex specializes in: Playwright/Pytest test frameworks, self-healing selector agents, LLM eval pipelines (LangGraph, Braintrust), and observability copilots. Currently Staff SDET on the AI Platform team at Lumen Systems. Previously: Northwind Robotics, Helix Health. Metrics: 98.2% coverage, 0.4% flake rate, p95 4m12s suite runtime. Stack: Python, TypeScript, Go, Rust, LangGraph, Qdrant, GitHub Actions, Kubernetes, Terraform. Open to staff-level roles. Reply in 2-4 short sentences, confident and technical, no lists, no preamble.`;
      const reply = await window.claude.complete({
        messages: [{ role: "user", content: sys + "\n\nVisitor asks: " + text }],
      });
      setMessages(m => [...m, { role: "ai", text: reply.trim() }]);
    } catch (e) {
      setMessages(m => [...m, { role: "ai", text: "Hmm, my model endpoint is throttled. Try again in a sec." }]);
    } finally {
      setBusy(false);
    }
  };

  const quickPrompts = [
    "Walk me through your eval pipeline",
    "How do you keep flake rate under 1%?",
    "Are you open to staff roles?",
  ];

  return h("div", { className: "ai-widget" + (open ? " open" : "") },
    open && h("div", { className: "ai-panel" },
      h("div", { className: "ai-header" },
        h("div", { className: "ai-avatar" },
          h("div", { className: "ai-avatar-inner" }, h(Icon.spark)),
          h("span", { className: "ai-status-dot" }),
        ),
        h("div", { className: "ai-header-text" },
          h("div", { className: "ai-name" }, "Ask my AI Assistant"),
          h("div", { className: "ai-sub" },
            h("span", { className: "ai-pulse" }), "online · claude-haiku-4-5",
          ),
        ),
        h("button", { className: "ai-close", onClick: () => setOpen(false) }, h(Icon.close)),
      ),
      h("div", { className: "ai-body", ref: bodyRef },
        messages.map((m, i) => h("div", { key: i, className: "ai-msg ai-msg-" + m.role },
          m.role === "ai" && h("div", { className: "ai-msg-avatar" }, h(Icon.spark)),
          h("div", { className: "ai-bubble" }, m.text),
        )),
        busy && h("div", { className: "ai-msg ai-msg-ai" },
          h("div", { className: "ai-msg-avatar" }, h(Icon.spark)),
          h("div", { className: "ai-bubble typing" },
            h("span", { className: "dot" }), h("span", { className: "dot" }), h("span", { className: "dot" }),
          ),
        ),
      ),
      messages.length === 1 && !busy && h("div", { className: "ai-quick" },
        quickPrompts.map(q => h("button", {
          key: q, className: "ai-quick-btn", onClick: () => send(q),
        }, q)),
      ),
      h("form", {
        className: "ai-input",
        onSubmit: (e) => { e.preventDefault(); send(); },
      },
        h("input", {
          ref: inputRef,
          value: input,
          onChange: (e) => setInput(e.target.value),
          placeholder: "Ask about test strategy, hiring, AI evals…",
          disabled: busy,
        }),
        h("button", { type: "submit", className: "ai-send", disabled: busy || !input.trim() }, h(Icon.send)),
      ),
      h("div", { className: "ai-foot" },
        "responses generated live via ", h("span", { className: "mono" }, "window.claude.complete"),
      ),
    ),

    !open && h("button", { className: "ai-fab", onClick: () => setOpen(true), "aria-label": "Ask my AI Assistant" },
      h("span", { className: "ai-fab-glow" }),
      h("span", { className: "ai-fab-icon" }, h(Icon.spark)),
    ),
  );
}

window.AIChat = AIChat;
