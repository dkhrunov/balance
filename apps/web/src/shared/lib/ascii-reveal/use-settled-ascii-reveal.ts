import { useLayoutEffect, RefObject } from 'react';
import { AsciiRevealHandle } from 'ascii-reveal';

/**
 * Waits for document fonts and two animation frames so layout (Carbon tiles,
 * scrollbars, selection chrome) can settle before measuring.
 */
async function waitForLayoutSettle(): Promise<void> {
    try {
        if (typeof document !== 'undefined' && document.fonts?.ready) {
            await document.fonts.ready;
        }
    } catch {
        // Font readiness is best-effort; reveal still runs after rAF.
    }

    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}

/**
 * Hides content immediately, waits for layout to settle, then reveals.
 *
 * With `revealOnMount={false}`, children are visible until an imperative
 * `reveal()`. Settling alone would flash raw DOM; `hide({ instant: true })`
 * first avoids that. Deferring past fonts + paint still avoids ResizeObserver
 * abort from Carbon TileGroup / RadioTile selection and carousel scrollbars.
 *
 * Pair with `<AsciiReveal revealOnMount={false}>` and do **not** drive reveal
 * via the `loading` prop (that path also reveals before layout settles).
 *
 * @param handleRef - Ref from `<AsciiReveal ref={…} />`
 * @param enabled - When true, schedules hide → settle → reveal; when false, cancels
 */
export function useSettledAsciiReveal(
    handleRef: RefObject<AsciiRevealHandle | null>,
    enabled: boolean,
): void {
    useLayoutEffect(() => {
        if (!enabled) {
            return;
        }

        const handle = handleRef.current;

        if (!handle) {
            return;
        }

        let cancelled = false;

        void (async () => {
            await handle.hide({ instant: true });
            await waitForLayoutSettle();

            if (!cancelled) {
                await handleRef.current?.reveal();
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [enabled, handleRef]);
}
