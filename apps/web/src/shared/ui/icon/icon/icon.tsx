import { resolveIcon } from '../icons';

type IconProps = {
    /** Opaque Carbon icon name from an account or category. */
    readonly name: string;
    /** Icon pixel size passed to the Carbon glyph (default 20). */
    readonly size?: number;
    /** Optional CSS class on the SVG. */
    readonly className?: string;
};

/**
 * Renders a curated Carbon icon by stored name.
 * Unknown names fall back to the default Wallet glyph.
 */
export function Icon({ name, size = 20, className }: IconProps) {
    const Glyph = resolveIcon(name);

    return <Glyph size={size} className={className} aria-hidden />;
}
