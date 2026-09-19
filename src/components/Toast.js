let toastTimer = null;

export function showToast(message, actionText, actionCallback) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  container.innerHTML = '';
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  if (actionText && actionCallback) {
    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.id = 'toast-undo-btn';
    actionBtn.setAttribute('data-testid', 'toast-undo-btn');
    actionBtn.className = 'toast-undo-btn';
    actionBtn.textContent = actionText;
    actionBtn.addEventListener('click', () => {
      actionCallback();
      toast.remove();
      if (toastTimer) clearTimeout(toastTimer);
    });
    toast.appendChild(actionBtn);
  }

  container.appendChild(toast);

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.remove();
  }, 4500);
}
