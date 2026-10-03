import { useState, useCallback } from 'react';

const SESSION_KEY  = 'nexus-session-active';
const USERNAME_KEY = 'nexus-session-user';

/**
 * Derives a clean display name from an email / username string.
 * Priority: email local-part → raw input → 'there'
 */
function deriveDisplayName(input) {
  if (!input) return '';
  const local = input.includes('@') ? input.split('@')[0] : input;
  // Replace dots, underscores, hyphens with spaces then title-case each word
  return local
    .replace(/[._-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Frontend-only auth state.
 * Stores session flag + derived display name in sessionStorage.
 * No backend calls, no emails, no tokens sent to a server.
 */
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );

  const login = useCallback((email, password) => {
    if (!email || !password) return false;
    const displayName = deriveDisplayName(email);
    sessionStorage.setItem(SESSION_KEY,  'true');
    sessionStorage.setItem(USERNAME_KEY, displayName);
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
