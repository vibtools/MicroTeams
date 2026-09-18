export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('dd-toast', {
        detail: { message, type },
      })
    );
  }
}
