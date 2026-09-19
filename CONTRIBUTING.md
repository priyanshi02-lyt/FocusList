# 🤝 Contributing to FocusList

Thank you for your interest in contributing to **FocusList**! We welcome bug reports, feature suggestions, documentation enhancements, and code contributions.

---

## 🚀 Getting Started

1. **Fork the Repository**: Fork the repository on GitHub.
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/<your-username>/FocusList.git
   cd FocusList
   ```
3. **Run local test suite**:
   ```bash
   node tests/run-tests.js
   ```
4. **Open in Browser**:
   - Simply open `index.html` in your favorite web browser (no build steps needed!).
   - Or run `npm start` to spin up a local preview server.

---

## 🧪 Testing Guidelines

- All business logic changes MUST be accompanied by unit tests in `tests/taskManager.test.js` or `tests/storage.test.js`.
- Run all tests before submitting a Pull Request:
  ```bash
  npm test
  ```
- Ensure 100% of test assertions pass.

---

## 🎨 Code Style & Quality Standards

- **Zero External Dependencies**: All core client code must remain pure Vanilla HTML5, CSS3, and ES6+ JavaScript.
- **Accessibility**: Maintain WCAG AA standards. Interactive elements must be keyboard-operable, include proper ARIA attributes, and have visible `:focus-visible` outlines.
- **Performance**: Maintain 100/100 Lighthouse score. Avoid heavy synchronous loops or blocking DOM mutations.

---

## 📬 Submitting Changes

1. Create a feature branch (`git checkout -b feature/my-feature`).
2. Commit your changes with clear, semantic commit messages.
3. Push to your branch (`git push origin feature/my-feature`).
4. Open a Pull Request against the `main` branch.
