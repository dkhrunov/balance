import { useEffect, RefObject } from 'react';
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
 * Starts {@link AsciiRevealHandle.reveal} only after layout has settled.
 *
 * ascii-reveal aborts an in-flight reveal when its wrapper resizes by more than
 * 1px (ResizeObserver). Carbon TileGroup / RadioTile selection and carousel
 * scrollbars often change size right after mount, which makes mount reveals
 * look instant. Deferring past fonts + paint avoids that abort.
 *
 * Pair with `<AsciiReveal revealOnMount={false}>` and do **not** drive reveal
 * via the `loading` prop (that path also reveals before layout settles).
 *
 * @param handleRef - Ref from `<AsciiReveal ref={…} />`
 * @param enabled - When true, schedules a reveal; when false, cancels pending work
 */
export function useSettledAsciiReveal(
    handleRef: RefObject<AsciiRevealHandle | null>,
    enabled: boolean,
): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;

        void (async () => {
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
