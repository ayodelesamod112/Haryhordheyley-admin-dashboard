import { useEffect, useRef } from "react";

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Calls onTimeout if no mouse/keyboard/touch/scroll activity happens
 * for `timeoutMs`. Resets the countdown on every bit of activity.
 *
 * Uses a ref for the callback so the listener setup only runs ONCE,
 * even if the caller passes a new function reference on every render.
 */
export function useInactivityLogout(onTimeout, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const timerRef = useRef(null);
  const callbackRef = useRef(onTimeout);

  // Always keep the ref pointing at the latest callback, without
  // re-running the effect below (which would keep resetting the timer)
  useEffect(() => {
    callbackRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current?.(), timeoutMs);
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeoutMs]);
}