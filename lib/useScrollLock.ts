import { useEffect } from "react";

/**
 * Locks page scroll while `locked` is true.
 *
 * `html` (not `body`) is the real scrolling box here — globals.css sets
 * `overflow-y: scroll` + `scrollbar-gutter: stable` on it, which reserves
 * the scrollbar's gutter permanently, whether or not a scrollbar is
 * actually drawn. That means toggling `overflow` between "scroll" and
 * "hidden" never changes `clientWidth` — zero-width delta, no JS padding
 * math needed (a prior version computed and applied a `paddingRight`
 * compensation here, which — now that the CSS gutter already reserves
 * that same space — double-compensated and was the actual source of a
 * visible shift every time a modal/drawer opened or closed).
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
    };
  }, [locked]);
}
