export type AuditLevel = 'info' | 'warning' | 'error' | 'security';

interface AuditEntry {
  id: string;
  time: string;
  userId?: string | null;
  action: string;
  level: AuditLevel;
  details?: Record<string, any>;
}

const STORAGE_KEY = 'evworld_audit_log';

function nowISO() { return new Date().toISOString(); }

function persist(entry: AuditEntry) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch (e) {
    // ignore
  }
}

export const auditLog = {
  log: (action: string, level: AuditLevel = 'info', userId?: string | null, details?: Record<string, any>) => {
    const entry: AuditEntry = { id: Math.random().toString(36).slice(2,9), time: nowISO(), userId: userId ?? null, action, level, details };
    // Console output for developer visibility
    if (level === 'security' || level === 'error') {
      // eslint-disable-next-line no-console
      console.warn('[AUDIT]', entry);
    } else {
      // eslint-disable-next-line no-console
      console.info('[AUDIT]', entry);
    }
    persist(entry);
  },

  getRecent: (limit = 50) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return existing.slice(0, limit);
    } catch (e) { return []; }
  }
};

export default auditLog;
