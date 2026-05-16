const { useState: useSA, useEffect: useEA, useCallback: useCA } = React;

function App() {
  const [activeFile, setActiveFile] = useSA("bio.json");
  const [tabs, setTabs] = useSA(["bio.json", "test_suites.py", "ai_architectures.md"]);
  const [termHeight, setTermHeight] = useSA(220);
  const [termTab, setTermTab] = useSA("TERMINAL");
  const [running, setRunning] = useSA(false);
  const [logs, setLogs] = useSA(SAMPLE_LOGS.slice(0, 8));
  const [lastRun, setLastRun] = useSA("3m ago");
  const [theme, setTheme] = useSA(() => {
    try { return localStorage.getItem("portfolio-theme") || "dark"; } catch { return "dark"; }
  });

  useEA(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("portfolio-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = useCA(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

  const openTab = useCA((name) => {
    setTabs(t => t.includes(name) ? t : [...t, name]);
  }, []);

  const closeTab = useCA((name) => {
    setTabs(t => {
      const next = t.filter(x => x !== name);
      if (activeFile === name && next.length) setActiveFile(next[next.length - 1]);
      return next;
    });
  }, [activeFile]);

  const runSmoke = useCA(() => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setTermTab("TERMINAL");
    let i = 0;
    const tick = () => {
      if (i >= SAMPLE_LOGS.length) {
        setRunning(false);
        setLastRun("just now");
        return;
      }
      setLogs(prev => [...prev, SAMPLE_LOGS[i]]);
      i++;
      setTimeout(tick, 280 + Math.random() * 260);
    };
    setTimeout(tick, 300);
  }, [running]);

  // ⌘↵ shortcut
  useEA(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runSmoke();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runSmoke]);

  return h(React.Fragment, null,
    h(TopBar, { onRun: runSmoke, running, theme, toggleTheme }),
    h("div", { className: "ide-body" },
      h(Sidebar, { activeFile, setActiveFile, openTab }),
      h("main", { className: "main" },
        h(Editor, { tabs, activeFile, setActiveFile, closeTab }),
        h(Terminal, { logs, running, height: termHeight, setHeight: setTermHeight, tab: termTab, setTab: setTermTab }),
      ),
    ),
    h(StatusStrip, { activeFile, running }),
    h(AIChat),
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
