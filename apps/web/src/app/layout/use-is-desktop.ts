import { useEffect, useState } from 'react';
import { breakpoints } from '@carbon/layout';

const IS_DESKTOP = `(min-width: ${breakpoints.lg.width})`;

/** Is desktop screen size. */
export function useIsDesktop(): boolean {
    const [matches, setMatches] = useState(() =>
        typeof window === 'undefined' ? true : window.matchMedia(IS_DESKTOP).matches,
    );

    useEffect(() => {
        const mediaQueryList = window.matchMedia(IS_DESKTOP);

        const onChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        mediaQueryList.addEventListener('change', onChange);

        setMatches(mediaQueryList.matches);

        return () => mediaQueryList.removeEventListener('change', onChange);
    }, []);

    return matches;
}
