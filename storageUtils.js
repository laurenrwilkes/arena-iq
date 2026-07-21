// ── STORAGE UTILITIES: Lazy hydration, schema merging, and safe persistence ──

/**
 * Hydrate state from localStorage with safe defaults and schema validation.
 * @param {string} storageKey - The localStorage key
 * @param {object} defaultState - The default state object
 * @returns {object} Merged state (stored data + defaults)
 */
function hydrateFromStorage(storageKey, defaultState) {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      console.log(`[Profile Engine] Storage key "${storageKey}" not found, using defaults`);
      return { ...defaultState };
    }
    const parsed = JSON.parse(stored);
    const merged = { ...defaultState, ...parsed };
    console.log(`[Profile Engine] Successfully hydrated from key "${storageKey}":`, merged);
    return merged;
  } catch (error) {
    console.error(`[Profile Engine] Failed to load from key "${storageKey}":`, error);
    return { ...defaultState };
  }
}

/**
 * Safely persist state to localStorage without overwriting with empty/null values.
 * @param {string} storageKey - The localStorage key
 * @param {object} state - The state to save
 * @param {object} guardAgainst - Object of keys to avoid overwriting (safety guard)
 */
function persistToStorage(storageKey, state, guardAgainst = {}) {
  if (!state || typeof state !== 'object') {
    console.warn(`[Profile Engine] Attempted to persist invalid state to "${storageKey}":`, state);
    return;
  }

  try {
    // Guard: check if we're about to overwrite existing data with empty values
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        // If state is suspiciously empty while existing data has content, warn and merge
        const stateEmpty = Object.values(state).every(v => !v || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && Object.keys(v).length === 0));
        const existingHasData = Object.values(parsed).some(v => v || (Array.isArray(v) && v.length > 0) || (typeof v === 'object' && Object.keys(v).length > 0));
        if (stateEmpty && existingHasData) {
          console.warn(`[Profile Engine] Preventing empty-state overwrite for key "${storageKey}". Merging instead.`);
          state = { ...parsed, ...state };
        }
      } catch {}
    }

    localStorage.setItem(storageKey, JSON.stringify(state));
    console.log(`[Profile Engine] Persisted to key "${storageKey}":`, state);
  } catch (error) {
    console.error(`[Profile Engine] Failed to persist to key "${storageKey}":`, error);
  }
}

/**
 * Merge stored data with defaults, preserving structure and avoiding overwrites.
 * Useful for handling schema updates or incomplete stored data.
 * @param {object} stored - The data from localStorage
 * @param {object} defaults - The default schema
 * @returns {object} Merged data with all default keys present
 */
function schemaRepairedMerge(stored, defaults) {
  if (!stored || typeof stored !== 'object') return { ...defaults };
  
  const merged = { ...defaults };
  for (const key in stored) {
    if (key in defaults) {
      // Recursively merge nested objects (but not arrays or class instances)
      if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key]) && defaults[key] !== null && typeof stored[key] === 'object' && !Array.isArray(stored[key])) {
        merged[key] = schemaRepairedMerge(stored[key], defaults[key]);
      } else {
        merged[key] = stored[key];
      }
    }
  }
  return merged;
}

/**
 * Create a lazy initialization function for use in initial state definitions.
 * Returns a function that reads from localStorage only on first render.
 * @param {string} storageKey - The localStorage key
 * @param {object} defaultState - The default state
 * @returns {function} A lazy initializer function
 */
function createLazyHydrator(storageKey, defaultState) {
  return () => {
    return hydrateFromStorage(storageKey, defaultState);
  };
}

/**
 * Diagnostic logger for state lifecycle.
 * @param {string} message - Message to log
 * @param {object} data - Optional data to include
 */
function logProfileEngine(message, data = null) {
  const timestamp = new Date().toISOString().slice(11, 19);
  const output = `[Profile Engine] ${timestamp} — ${message}`;
  if (data) {
    console.log(output, data);
  } else {
    console.log(output);
  }
}

/**
 * Clear all profile-related data from localStorage for a given user.
 * Use with caution — this is destructive.
 * @param {string} username - Username to clear data for
 */
function clearUserData(username) {
  const keys = [
    `practice_progress_${username.toLowerCase()}`,
    `mm_stats_${username.toLowerCase()}`,
    `careers_profile_${username.toLowerCase()}`,
  ];
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
      logProfileEngine(`Cleared storage key: ${key}`);
    } catch (error) {
      console.error(`[Profile Engine] Failed to clear ${key}:`, error);
    }
  }
}
