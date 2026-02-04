const resolveEnabled = () => {
  const explicit = import.meta.env.VITE_LOGGING;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return import.meta.env.DEV;
};

const enabled = resolveEnabled();

export const logger = {
  debug(...args) {
    if (!enabled) return;
    console.debug(...args);
  },
  info(...args) {
    if (!enabled) return;
    console.info(...args);
  },
  warn(...args) {
    if (!enabled) return;
    console.warn(...args);
  },
  error(...args) {
    if (!enabled) return;
    console.error(...args);
  },
};
