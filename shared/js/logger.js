const EVENT_TYPES = new Set([
  'session_started', 'task_started', 'product_searched', 'product_viewed',
  'filter_applied', 'product_added_to_cart', 'cart_updated', 'checkout_started',
  'checkout_completed', 'task_completed', 'product_removed_from_cart'
]);

const VERSION = document.documentElement.dataset.prototype || 'traditional';
const PARTICIPANT_KEY = 'lowkey:anonymous-participant';

function getParticipantId() {
  try {
    let id = sessionStorage.getItem(PARTICIPANT_KEY);
    if (!id) {
      id = `anon-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
      sessionStorage.setItem(PARTICIPANT_KEY, id);
    }
    return id;
  } catch {
    return `anon-session-${Date.now()}`;
  }
}

/** Local-only, opt-in mock event sink. No network requests are made. */
export function createEventLogger({ enabled = false, taskId = null } = {}) {
  return {
    log(type, metadata = {}) {
      if (!enabled || !EVENT_TYPES.has(type)) return null;
      const event = {
        participantId: getParticipantId(),
        prototypeVersion: VERSION,
        taskId,
        eventType: type,
        timestamp: new Date().toISOString(),
        metadata
      };
      try {
        const events = JSON.parse(localStorage.getItem('lowkey:mock-events') || '[]');
        events.push(event);
        localStorage.setItem('lowkey:mock-events', JSON.stringify(events));
      } catch (error) {
        console.warn('LOWKEY mock logger could not save this event.', error);
      }
      return event;
    },
    clear() {
      try { localStorage.removeItem('lowkey:mock-events'); } catch { /* storage may be unavailable */ }
    }
  };
}
