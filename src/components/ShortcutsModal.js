export function renderShortcutsModal() {
  let modal = document.getElementById('shortcuts-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-shortcuts-title');

    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2 id="modal-shortcuts-title" class="modal-title">Keyboard Shortcuts</h2>
          <button type="button" class="icon-btn" id="close-modal-btn" aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <table class="shortcuts-table">
          <tbody>
            <tr>
              <td>Add new task / Submit</td>
              <td style="text-align: right;"><kbd class="key-badge">Enter</kbd></td>
            </tr>
            <tr>
              <td>Search tasks</td>
              <td style="text-align: right;"><kbd class="key-badge">/</kbd></td>
            </tr>
            <tr>
              <td>Toggle Dark / Light theme</td>
              <td style="text-align: right;"><kbd class="key-badge">T</kbd></td>
            </tr>
            <tr>
              <td>Cancel editing / Close modal</td>
              <td style="text-align: right;"><kbd class="key-badge">Esc</kbd></td>
            </tr>
            <tr>
              <td>Open shortcuts guide</td>
              <td style="text-align: right;"><kbd class="key-badge">?</kbd></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-modal-btn');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  return {
    open: () => modal.classList.add('active'),
    close: () => modal.classList.remove('active'),
    toggle: () => modal.classList.toggle('active')
  };
}
