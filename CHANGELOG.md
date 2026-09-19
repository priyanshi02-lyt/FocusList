# 📝 Changelog

All notable changes to the **FocusList** project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-09-19

### Added
- **Production Architecture**: Introduced `package.json`, ESLint, Prettier, EditorConfig, and JSConfig.
- **Automated Unit Testing Suite**: Comprehensive unit test coverage for TaskManager (`tests/taskManager.test.js`), Storage (`tests/storage.test.js`), and zero-dependency Node test runner (`tests/run-tests.js`).
- **Continuous Integration (CI)**: Added GitHub Actions automated workflow (`.github/workflows/ci.yml`).
- **PWA & Offline Resilience**: Added Web App Manifest (`manifest.json`) and Cache-First Service Worker (`service-worker.js`).
- **Dual Task Creation Flow**: Integrated prominent Quick-Add task bar on desktop/main view while preserving mobile floating FAB + modal.
- **Enhanced Accessibility**: Added "Skip to main content" landmark link, native accessible checkboxes with ARIA labels, and live announcement regions (`aria-live="polite"`).
- **System Documentation**: Added comprehensive `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and upgraded `README.md`.

### Changed
- Refactored `app.js` into cleanly isolated modules (`StorageModule`, `TaskManager`, `AudioModule`, `UIModule`).
- Enhanced Vercel headers in `vercel.json` with immutable static asset caching and strict security policies.

---

## [1.1.0] - 2026-09-19

### Added
- Mobile-first dark violet obsidian theme.
- Interactive 7-day calendar week ribbon with dynamic date selection.
- Chronological timeline view with vertical connecting spine and free-time intervals.
- Category projects view with animated SVG completion rings.
- Audio feedback using Web Audio API synthesizers.

---

## [1.0.0] - 2026-09-19

### Added
- Initial Hackathon release of FocusList frontend task manager.
- Task CRUD: Add, complete, edit, delete with 5-second undo toast.
- Task priorities: High, Medium, Low.
- Multi-tier filtering (All, Active, Completed) and search by title.
- Live productivity statistics and completion progress bar.
- LocalStorage persistence and JSON backup export/import.
