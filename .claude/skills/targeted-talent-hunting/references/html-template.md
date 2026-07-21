# HTML Template for Talent Map Deliverable

Use this pattern to build the interactive HTML output. Adapt the CSS variables,
tree data, and report content for each target.

## Structure

Single `.html` file with:
- `<style>` block with dark theme CSS
- Two `<div>` panels: `#mindmapPanel` (active by default) and `#reportPanel`
- Fixed tab bar at top for switching
- Pure HTML `<details>/<summary>` tree — zero JS dependencies
- Minimal JavaScript for tab switching, expand/collapse, and search

## CSS Color System

```css
:root {
  --bg: #0d1117; --surface: #161b22; --border: #30363d;
  --text: #c9d1d9; --text-secondary: #8b949e; --accent: #58a6ff;
  --green: #3fb950; --yellow: #d2991d; --red: #f85149;
  --purple: #a371f7; --orange: #db6d28;
}
```

### Priority Color Coding

| CSS Class | Color | Meaning |
|-----------|-------|---------|
| `.dot-p0` / `.tag-p0` | `#3fb950` green + glow | P0 — strong match, contactable |
| `.dot-p1` / `.tag-p1` | `#58a6ff` blue | P1 — good match, reachable |
| `.dot-p2` / `.tag-p2` | `#484f58` gray | P2 — map node, watch, verify |
| `.dot-new` / `.tag-new` | `#a371f7` purple + glow | New joiner / recent return |
| `.dot-left` / `.tag-left` | `#f85149` red | Departed / left company |
| `.dot-warn` / `.tag-warn` | `#d2991d` yellow + glow | Risk signal / warning |
| `.dot-section` | `#1f6feb` dark blue | Section header |
| `.dot-root` | `#39c5cf` teal | Root node |

## Mind Map Tree Structure

Each tree node is a `<details>` (collapsible section) or a `<div>` (leaf):

```html
<div class="tree">
  <details open>
    <summary><span class="dot dot-root"></span><span class="section-icon">🧬</span>Root Name</summary>
    <div class="tree">

      <!-- Section header -->
      <details open>
        <summary><span class="dot dot-section"></span><span class="section-icon">🧠</span>Section Name</summary>
        <div class="tree">

          <!-- Leaf node (person) -->
          <div>
            <span class="dot dot-p0"></span>
            <span class="node-name">⭐ Person Name</span>
            <span class="tag tag-p0">P0</span>
            <span class="node-detail">Role · Background · Key evidence</span>
            <span class="email-link">📧 email@example.com</span>
            <span class="url-link">🌐 personal.site</span>
          </div>

          <!-- Another leaf -->
          <div>
            <span class="dot dot-p1"></span>
            <span class="node-name">Person Name</span>
            <span class="tag tag-p1">P1</span>
            <span class="node-detail">Role · Background</span>
          </div>

        </div>
      </details>

    </div>
  </details>
</div>
```

### Key CSS Classes for Tree Nodes

- `.dot` — colored circle indicator (requires second class like `.dot-p0`)
- `.section-icon` — emoji icon for section headers
- `.node-name` — bold white name text
- `.node-detail` — gray secondary detail text
- `.tag` — priority/status badge (requires second class like `.tag-p0`)
- `.email-link` — green email display
- `.url-link` — blue URL display

## Report Tab Structure

The report tab contains the detailed content:

```html
<div id="reportPanel" class="panel">
  <h1>🔬 Target Name — 人才地图</h1>
  <div class="meta"><!-- badges, date, sources --></div>
  <div class="warn-box"><!-- risk alert --></div>

  <h2>1. 组织架构</h2>
  <div class="org-chart"><!-- monospace tree --></div>

  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-date">DATE</div>
      <div class="timeline-text">Event description</div>
    </div>
  </div>

  <h2>2. P0 — 强匹配 · 可触达</h2>
  <div class="p0-card">
    <div class="card-header">
      <div><div class="card-name">Name</div><div class="card-direction">Direction</div></div>
      <span class="badge badge-green">P0</span>
    </div>
    <div class="card-body"><p>Description</p></div>
    <div class="card-links">
      <a href="...">Link 1</a><a href="...">Link 2</a>
    </div>
  </div>

  <h2>3. 开源项目入口</h2>
  <table><!-- project table with GitHub links --></table>

  <h2>4. Next Actions</h2>
  <ol class="next-actions">
    <li><strong>Action</strong> — detail</li>
  </ol>
</div>
```

## Tab Switching JavaScript

Minimal JS for tab switching, tree expand/collapse, and search:

```javascript
function switchTab(name) {
  document.querySelectorAll('#tab-bar button').forEach((b, i) => {
    b.classList.toggle('active', (name === 'mindmap' && i === 1) || (name === 'report' && i === 2));
  });
  document.getElementById('mindmapPanel').classList.toggle('active', name === 'mindmap');
  document.getElementById('reportPanel').classList.toggle('active', name === 'report');
}

function expandAll() {
  document.querySelectorAll('#mindmapPanel details').forEach(d => d.setAttribute('open', ''));
}
function collapseAll() {
  document.querySelectorAll('#mindmapPanel details').forEach((d, i) => {
    if (i > 1) d.removeAttribute('open');
  });
}

function doSearch(q) {
  const query = (q || '').toLowerCase().trim();
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  if (!query) return;
  expandAll();
  const items = document.querySelectorAll('#mindmapPanel .tree details > summary, #mindmapPanel .tree > details > .tree > div');
  items.forEach(el => {
    if (el.textContent.toLowerCase().includes(query)) {
      el.style.background = 'rgba(210,153,29,0.18)';
      el.style.borderRadius = '4px';
      if (!window._scrolled) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); window._scrolled = true; }
    }
  });
  setTimeout(() => { window._scrolled = false; }, 1000);
}
```

## Building the Deliverable

1. Collect all intelligence via web searches, GitHub API, paper author lists.
2. Structure the tree data: root → sections → candidates (leaves).
3. Write the HTML file to `~/Desktop/{Target}_Talent_Map.html`.
4. Also write the `.md` version for reference.
5. Open with `open ~/Desktop/{Target}_Talent_Map.html`.
6. After deep-dive follow-up (Next Actions), update the HTML with new findings and re-open.

## Design Principles

- **Zero dependencies**: No CDN, no npm, no external fonts. Pure HTML/CSS/JS.
- **Dark theme**: GitHub-style dark colors for extended reading comfort.
- **Dense but scannable**: Color coding + tags let users scan fast.
- **One file**: Everything self-contained — share by sending a single `.html`.
- **Two views, one truth**: Mind map for exploration, report for detail. Same data.
