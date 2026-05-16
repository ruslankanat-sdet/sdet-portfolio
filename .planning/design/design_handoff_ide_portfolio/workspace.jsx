const { useState: useS2, useEffect: useE2, useRef: useR2 } = React;

// ─────────────── EDITOR ───────────────
function Editor({ tabs, activeFile, setActiveFile, closeTab }) {
  const file = window.FILES[activeFile];
  const tokens = window.tokenize(file.content, file.lang);
  const lines = file.content.split("\n");

  return h("div", { className: "editor-wrap" },
    h("div", { className: "tabbar" },
      tabs.map(name => {
        const f = window.FILES[name];
        const FIcon = ICONS_FOR_FILE[f.icon];
        const active = name === activeFile;
        return h("div", {
          key: name,
          className: "tab" + (active ? " active" : ""),
          onClick: () => setActiveFile(name),
        },
          h("span", { className: "tab-icon" }, h(FIcon)),
          h("span", { className: "tab-name" }, name),
          h("span", {
            className: "tab-close",
            onClick: (e) => { e.stopPropagation(); closeTab(name); },
          }, h(Icon.close)),
        );
      }),
      h("div", { className: "tab-spacer" }),
    ),
    h("div", { className: "editor" },
      h("div", { className: "gutter" },
        lines.map((_, i) =>
          h("div", { key: i, className: "ln" + (i === 1 ? " active" : "") }, i + 1)
        ),
      ),
      h("pre", { className: "code lang-" + file.lang },
        h("code", null, ...tokens),
      ),
    ),
  );
}

// ─────────────── TOP BAR ───────────────
function TopBar({ onRun, running, theme, toggleTheme }) {

  return h("header", { className: "topbar" },
    h("div", { className: "topbar-l" },
      h("div", { className: "logo" },
        h("div", { className: "logo-mark" },
          h("svg", { width: 18, height: 18, viewBox: "0 0 18 18" },
            h("path", { d: "M2 9L6 5L8 7L12 3M12 3H15M12 3V6", stroke: "currentColor", strokeWidth: 1.8, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
            h("circle", { cx: 14, cy: 13, r: 2, stroke: "currentColor", strokeWidth: 1.5, fill: "none" }),
          )),
        h("div", { className: "logo-text" },
          h("div", { className: "logo-name" }, "alex.morgan"),
        ),
      ),
    ),

    h("div", { className: "status-rail" },
      h(StatusBadge, { tone: "green", label: "Build", value: "Passing", pulse: true }),
      h(StatusBadge, { tone: "green", label: "Coverage", value: "98%", hideAt: "badge-rail-1" }),
    ),

    h("div", { className: "topbar-r" },
      h("button", {
        className: "icon-btn",
        onClick: toggleTheme,
        "aria-label": "Toggle theme",
        title: theme === "dark" ? "Switch to light" : "Switch to dark",
      }, h(theme === "dark" ? Icon.sun : Icon.moon)),
      h("button", {
        className: "run-btn" + (running ? " running" : ""),
        onClick: onRun,
        disabled: running,
      },
        h("span", { className: "run-glow" }),
        h("span", { className: "run-icon" }, h(Icon.play)),
        h("span", { className: "run-label" }, running ? "Running…" : "Run Smoke Test"),
      ),
    ),
  );
}

function StatusBadge({ tone, label, value, pulse, hideAt }) {
  return h("div", { className: "badge tone-" + tone + (hideAt ? " " + hideAt : "") },
    h("span", { className: "badge-dot" + (pulse ? " pulse" : "") }),
    h("span", { className: "badge-label" }, label),
    h("span", { className: "badge-sep" }, ":"),
    h("span", { className: "badge-value" }, value),
  );
}

// ─────────────── TERMINAL ───────────────
const SAMPLE_LOGS = [
  { kind: "info",  text: "$ npx playwright test --grep smoke --reporter=line" },
  { kind: "info",  text: "Running 12 tests using 6 workers" },
  { kind: "pass",  test: "Smoke Test: Navigation",     detail: "checked / 142ms" },
  { kind: "pass",  test: "Smoke Test: Auth Flow",      detail: "checked / 318ms" },
  { kind: "pass",  test: "API Health: 200 OK",         detail: "p95 41ms / 89ms" },
  { kind: "pass",  test: "Checkout: Add to Cart",      detail: "checked / 412ms" },
  { kind: "pass",  test: "Checkout: Payment Sheet",    detail: "checked / 624ms" },
  { kind: "pass",  test: "i18n: locale switcher",      detail: "14 locales / 1.2s" },
  { kind: "warn",  text: "⚠ Self-healing selector rewrote `#cart-btn` → `[data-testid=cart]` (auto-PR #4821)" },
  { kind: "pass",  test: "AI Eval: response semantic match", detail: "score 0.97 / 612ms" },
  { kind: "pass",  test: "Perf: TTI under 800ms",      detail: "742ms / budget 800ms" },
  { kind: "pass",  test: "A11y: WCAG AA contrast",     detail: "0 violations" },
  { kind: "pass",  test: "Visual: hero-section",       detail: "0px diff" },
  { kind: "info",  text: "──────────────────────────────────────────" },
  { kind: "ok",    text: "✓ 12 passed (8.4s)  ·  0 failed  ·  0 flaky" },
];

function Terminal({ logs, running, height, setHeight, tab, setTab }) {
  const ref = useR2(null);
  const dragRef = useR2(null);
  useE2(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  // resizer
  const onDrag = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = height;
    const move = (ev) => setHeight(Math.max(120, Math.min(500, startH - (ev.clientY - startY))));
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return h("div", { className: "terminal", style: { height: height + "px" } },
    h("div", { className: "term-resizer", onMouseDown: onDrag, ref: dragRef }),
    h("div", { className: "term-tabs" },
      h("div", { className: "term-tab active" }, "TERMINAL",
        running && h("span", { className: "term-tab-dot" }),
      ),
      h("div", { className: "term-spacer" }),
      h("div", { className: "term-meta" }, "playwright"),
    ),
    h("div", { className: "term-body", ref },
      logs.map((l, i) => h(LogRow, { key: i, log: l })),
      running && h("div", { className: "term-cursor" },
        h("span", { className: "term-prompt" }, "alex"),
        h("span", { className: "term-prompt-sep" }, "@"),
        h("span", { className: "term-prompt-host" }, "ci"),
        h("span", { className: "term-prompt-arrow" }, "❯"),
        h("span", { className: "blink" }, "▌"),
      ),
    ),
  );
}

function LogRow({ log }) {
  if (log.kind === "info") return h("div", { className: "log log-info" }, log.text);
  if (log.kind === "warn") return h("div", { className: "log log-warn" }, log.text);
  if (log.kind === "ok")   return h("div", { className: "log log-ok" }, log.text);
  if (log.kind === "fail") return h("div", { className: "log log-fail" },
    h("span", { className: "log-tag fail" }, "[FAIL]"),
    h("span", { className: "log-test" }, " " + log.test),
    log.detail && h("span", { className: "log-detail" }, "  " + log.detail),
  );
  // pass
  return h("div", { className: "log log-pass" },
    h("span", { className: "log-tag pass" }, "[PASS]"),
    h("span", { className: "log-test" }, " " + log.test),
    log.detail && h("span", { className: "log-detail" }, "  " + log.detail),
  );
}

// ─────────────── STATUS BAR (bottom OS strip) ───────────────
function StatusStrip({ activeFile, running }) {
  const f = window.FILES[activeFile];
  const lines = f.content.split("\n").length;
  return h("footer", { className: "statusbar" },
    h("div", { className: "sb-l" },
      h("div", { className: "sb-item green" }, h(Icon.git), " main"),
      h("div", { className: "sb-item" }, running ? "● running" : "✓ ready"),
    ),
    h("div", { className: "sb-r" },
      h("div", { className: "sb-item" }, "Ln 1, Col 1"),
      h("div", { className: "sb-item lang" }, f.lang.toUpperCase()),
      h("div", { className: "sb-item" }, lines + " lines"),
    ),
  );
}

Object.assign(window, { Editor, TopBar, Terminal, StatusStrip });
