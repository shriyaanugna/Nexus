/**
 * useUsername — reads the logged-in user's display name from sessionStorage.
 *
 * Fallback chain:
 *   stored display name → 'there'
 *
 * Not a stateful hook (username doesn't change mid-session).
 * Safe to call anywhere inside the authenticated app shell.
 */
export function useUsername() {
  const stored = sessionStorage.getItem('nexus-session-user');
  return stored || 'there';
}
