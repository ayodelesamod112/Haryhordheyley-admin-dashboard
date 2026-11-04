import { useEffect, useRef } from "react";

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Calls onTimeout if no mouse/keyboard/touch/scroll activity happens
 * for `timeoutMs`. Resets the countdown on every bit of activity.
 *
 * Uses a ref for the callback so the listener setup only runs ONCE,
 * even if the caller passes a new function reference on every render.
 */
export function useInactivityLogout(onTimeout, timeoutMs = DEFAULT_TIMEOUT_MS, enabled = true) {
  const timerRef = useRef(null);
  const lastActivityRef = useRef(0);
  const expiredRef = useRef(false);
  const callbackRef = useRef(onTimeout);

  // Always keep the ref pointing at the latest callback, without
  // re-running the effect below (which would keep resetting the timer)
  useEffect(() => {
    callbackRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!enabled) return undefined;

    const clearTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    const checkTimeout = () => {
      clearTimer();
      if (expiredRef.current) return;

      const remaining = timeoutMs - (Date.now() - lastActivityRef.current);
      if (remaining <= 0) {
        expiredRef.current = true;
        callbackRef.current?.();
        return;
      }
      timerRef.current = window.setTimeout(checkTimeout, remaining);
    };

    const recordActivity = () => {
      if (expiredRef.current) return;
      lastActivityRef.current = Date.now();
      checkTimeout();
    };

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") checkTimeout();
    };

    const activityEvents = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel", "scroll"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    window.addEventListener("focus", checkWhenVisible);
    document.addEventListener("visibilitychange", checkWhenVisible);
    lastActivityRef.current = Date.now();
    checkTimeout();

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      window.removeEventListener("focus", checkWhenVisible);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      clearTimer();
    };
  }, [timeoutMs, enabled]);
}
