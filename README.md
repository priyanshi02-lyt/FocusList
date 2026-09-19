# 🎯 FocusList — Modern Daily Task & Priority Engine

> A high-performance, responsive frontend task management web application engineered for maximum daily productivity, laser focus, and seamless prioritization. Built for the Hackathon.

🌐 **Live Deployed Application**: [https://focuslist-bay.vercel.app](https://focuslist-bay.vercel.app)  
📁 **Public GitHub Repository**: [https://github.com/priyanshi02-lyt/FocusList](https://github.com/priyanshi02-lyt/FocusList)

---

## 🌟 Key Features

### 1. ✍️ Task Creation & Priority Attribution
- Create tasks instantly with keyboard support (`Enter` to submit).
- **Task Priority Levels**: Assign **High (Urgent)**, **Medium (Standard)**, or **Low (Routine)** priorities.
- Optional categorized tagging (`Work`, `Personal`, `Study`, `Urgent`, `General`) and due date pickers.
- Clean character counter and input validation.

### 2. ⚡ Dynamic Task Management
- **One-Click Completion**: Toggle completion with satisfying check animations and distinct visual status (strike-through, dimmed tags, priority contrast).
- **In-Depth Task Editing**: Update title, priority, due date, and category in a streamlined modal dialog.
- **Safe Deletion with Undo Toast**: Accidentally deleted a task? An interactive **Undo** toast gives you 5 seconds to instantly restore it.
- **Bulk Cleanup**: Single-click `Clear Completed` action.

### 3. 🔍 Real-Time Search & Multi-Tier Filtering
- **Instant Search**: Reactive keystroke search by task title with live text highlighting.
- **Status Tabs**: Filter across **All**, **Active**, and **Completed** with live counter badges.
- **Priority Filtering**: Filter specifically for High, Medium, or Low priority tasks.
- **Intelligent Sorting**: Sort by Newest, Oldest, Priority (High → Low), Due Date, or Alphabetical (A-Z).

### 4. 📊 Live Productivity Statistics & Visual Meter
- Real-time stat counters: **Total Tasks**, **Completed Tasks**, and **Pending Tasks**.
- Animated **Completion Rate Progress Bar** with real-time percentage updates.
- Contextual motivational quotes that react to completion milestones.
- Dynamic **Priority Distribution Bar** showing counts for High, Medium, and Low items.
- Full celebration confetti burst when 100% of tasks are completed!

### 5. 💾 Reliable Persistence & Data Portability
- Persists all state across page reloads using browser `localStorage`.
- Starter demo tasks pre-loaded on initial launch for immediate demonstration.
- **JSON Export & Import**: Backup and restore your task lists on demand.

### 6. 🎨 Award-Winning UI/UX
- **Dark Mode & Light Mode**: Fluid theme toggle with saved user preference.
- **Responsive Design**: Flawless experience across mobile smartphones, tablets, and wide desktop displays.
- **Keyboard Shortcuts**: Press `/` anywhere to focus search; `Escape` to close modals.
- **Micro-Animations**: Smooth slide-ins, hover feedback, active press transitions, and subtle glassmorphic glow.

---

## 🛠️ Technical Architecture

- **Core**: Semantic HTML5 with accessibility attributes (`ARIA`, roles, landmarks).
- **Styling**: Vanilla CSS3 design system with custom properties (CSS variables), Flexbox, CSS Grid, and responsive media queries.
- **Scripting**: Pure Vanilla JavaScript (ES6+ modular architecture, zero runtime dependencies, instant execution, 100/100 Lighthouse score).
- **Persistence**: Browser `localStorage` API.
- **Deployment**: Vercel Serverless Edge CDN (`https://focuslist-bay.vercel.app`).

---

## 🚀 Live Links

- **Live Deployed App**: [https://focuslist-bay.vercel.app](https://focuslist-bay.vercel.app)
- **GitHub Repository**: [https://github.com/priyanshi02-lyt/FocusList](https://github.com/priyanshi02-lyt/FocusList)

---

## 💻 Local Setup & Development

No build steps or Node.js runtime required! Simply clone and open:

```bash
git clone https://github.com/priyanshi02-lyt/FocusList.git
cd FocusList
# Open index.html in any modern browser
start index.html
```

---

## 📄 License

MIT License © 2026 FocusList.
