const { useState, useEffect, useRef, useCallback } = React;

// ─────────────── ICONS ───────────────
const Icon = {
  chevron: (open) => h("svg", { width: 10, height: 10, viewBox: "0 0 10 10", style: { transform: `rotate(${open ? 90 : 0}deg)`, transition: "transform .15s" } },
    h("path", { d: "M3 1.5L6.5 5L3 8.5", stroke: "currentColor", strokeWidth: 1.4, fill: "none", strokeLinecap: "round" })),
  folder: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("path", { d: "M1 3.5C1 2.67 1.67 2 2.5 2H5l1.5 1.5h5C12.33 3.5 13 4.17 13 5v5.5c0 .83-.67 1.5-1.5 1.5h-9C1.67 12 1 11.33 1 10.5v-7z", fill: "#d4ad6a" })),
  fileJson: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("rect", { x: 2, y: 1, width: 10, height: 12, rx: 1, fill: "#1c2230", stroke: "#3b4453" }),
    h("text", { x: 7, y: 9, fontSize: 5, fill: "#3ddc84", textAnchor: "middle", fontFamily: "monospace", fontWeight: 700 }, "{}")),
  filePy: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("rect", { x: 2, y: 1, width: 10, height: 12, rx: 1, fill: "#1c2230", stroke: "#3b4453" }),
    h("text", { x: 7, y: 9, fontSize: 5, fill: "#79b8ff", textAnchor: "middle", fontFamily: "monospace", fontWeight: 700 }, "py")),
  fileMd: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("rect", { x: 2, y: 1, width: 10, height: 12, rx: 1, fill: "#1c2230", stroke: "#3b4453" }),
    h("text", { x: 7, y: 9, fontSize: 4.5, fill: "#c9d178", textAnchor: "middle", fontFamily: "monospace", fontWeight: 700 }, "MD")),
  fileYaml: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("rect", { x: 2, y: 1, width: 10, height: 12, rx: 1, fill: "#1c2230", stroke: "#3b4453" }),
    h("text", { x: 7, y: 9, fontSize: 4.5, fill: "#ff7eb6", textAnchor: "middle", fontFamily: "monospace", fontWeight: 700 }, "YM")),
  fileToml: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("rect", { x: 2, y: 1, width: 10, height: 12, rx: 1, fill: "#1c2230", stroke: "#3b4453" }),
    h("text", { x: 7, y: 9, fontSize: 4.5, fill: "#ffab70", textAnchor: "middle", fontFamily: "monospace", fontWeight: 700 }, "TM")),
  search: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("circle", { cx: 6, cy: 6, r: 4, stroke: "currentColor", strokeWidth: 1.3, fill: "none" }),
    h("path", { d: "M9 9L12 12", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" })),
  git: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("circle", { cx: 4, cy: 3, r: 1.5, stroke: "currentColor", strokeWidth: 1.2, fill: "none" }),
    h("circle", { cx: 4, cy: 11, r: 1.5, stroke: "currentColor", strokeWidth: 1.2, fill: "none" }),
    h("circle", { cx: 10, cy: 7, r: 1.5, stroke: "currentColor", strokeWidth: 1.2, fill: "none" }),
    h("path", { d: "M4 4.5v5M5.3 4c2 .5 3.4 1.7 3.4 3", stroke: "currentColor", strokeWidth: 1.2, fill: "none" })),
  play: () => h("svg", { width: 11, height: 11, viewBox: "0 0 11 11" },
    h("path", { d: "M2 1.5v8L9 5.5z", fill: "currentColor" })),
  close: () => h("svg", { width: 10, height: 10, viewBox: "0 0 10 10" },
    h("path", { d: "M2 2l6 6M8 2l-6 6", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" })),
  spark: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("path", { d: "M7 1L8.4 5.6 13 7l-4.6 1.4L7 13l-1.4-4.6L1 7l4.6-1.4z", fill: "currentColor" })),
  send: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("path", { d: "M1 13L13 7L1 1L3 7zM3 7H8", stroke: "currentColor", strokeWidth: 1.3, fill: "none", strokeLinejoin: "round" })),
  bell: () => h("svg", { width: 12, height: 12, viewBox: "0 0 12 12" },
    h("path", { d: "M3 5a3 3 0 016 0v3l1 1H2l1-1V5z M5 11h2", stroke: "currentColor", strokeWidth: 1.2, fill: "none", strokeLinejoin: "round" })),
  sun: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("circle", { cx: 7, cy: 7, r: 2.6, stroke: "currentColor", strokeWidth: 1.4, fill: "none" }),
    h("g", { stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" },
      h("path", { d: "M7 1.5v1.6M7 10.9v1.6M1.5 7h1.6M10.9 7h1.6M3.1 3.1l1.1 1.1M9.8 9.8l1.1 1.1M3.1 10.9l1.1-1.1M9.8 4.2l1.1-1.1" }),
    )),
  moon: () => h("svg", { width: 14, height: 14, viewBox: "0 0 14 14" },
    h("path", { d: "M11.5 8.2A4.5 4.5 0 015.8 2.5a.5.5 0 00-.6-.6 5.5 5.5 0 106.9 6.9.5.5 0 00-.6-.6z", fill: "currentColor" })),
};

const ICONS_FOR_FILE = { json: Icon.fileJson, py: Icon.filePy, md: Icon.fileMd, yaml: Icon.fileYaml, toml: Icon.fileToml };

// ─────────────── SIDEBAR ───────────────
function Sidebar({ activeFile, setActiveFile, openTab }) {
  const [open, setOpen] = useState({ portfolio: true, suites: false });

  const fileRow = (name) => {
    const f = window.FILES[name];
    const FIcon = ICONS_FOR_FILE[f.icon];
    const active = activeFile === name;
    return h("div", {
      key: name,
      className: "tree-row" + (active ? " active" : ""),
      onClick: () => { setActiveFile(name); openTab(name); },
    },
      h("span", { className: "tree-indent" }),
      h("span", { className: "tree-icon" }, h(FIcon)),
      h("span", { className: "tree-label" }, name),
    );
  };

  return h("aside", { className: "sidebar" },
    h("div", { className: "explorer" },
      h("div", { className: "explorer-header" },
        h("span", null, "EXPLORER"),
      ),
      h("div", { className: "tree" },
        h("div", { className: "tree-group" },
          h("div", { className: "tree-folder", onClick: () => setOpen(s => ({ ...s, portfolio: !s.portfolio })) },
            h("span", { className: "tree-chev" }, Icon.chevron(open.portfolio)),
            h("span", { className: "tree-label bold" }, "portfolio"),
          ),
          open.portfolio && h("div", { className: "tree-children" },
            fileRow("bio.json"),
            fileRow("experience.yaml"),
            fileRow("stack.toml"),
            fileRow("test_suites.py"),
            fileRow("ai_architectures.md"),
            fileRow("README.md"),
          ),
        ),
      ),
    ),
  );
}

window.Sidebar = Sidebar;
