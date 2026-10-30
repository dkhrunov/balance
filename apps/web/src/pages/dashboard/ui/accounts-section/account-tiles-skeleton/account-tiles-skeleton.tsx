import { AsciiSkeleton } from 'ascii-reveal';
import styles from './account-tiles-skeleton.module.scss';

const ACCOUNT_SKELETON_COUNT = 5;

type AccountTileSkeletonProps = {
    readonly seed: number;
    readonly animate: boolean;
};

/** Loading placeholder matching a single account tile layout. */
function AccountTileSkeleton({ seed, animate }: AccountTileSkeletonProps) {
    return (
        <div className={styles.account}>
            <div className={styles.header}>
                <AsciiSkeleton
                    variant="dither"
                    rows={2}
                    width="1rem"
                    height="1rem"
                    circle
                    seed={seed}
                    animate={animate}
                />
                <div className={styles.accountName}>
                    <AsciiSkeleton
                        variant="dither"
                        lines={1}
                        widths={['5rem']}
                        seed={seed + 1}
                        animate={animate}
                    />
                </div>
            </div>

            <div className={styles.accountBalance}>
                <AsciiSkeleton
                    variant="dither"
                    lines={1}
                    widths={['100%']}
                    seed={seed + 2}
                    animate={animate}
                />
            </div>

            <div className={styles.actions}>
                <AsciiSkeleton
                    variant="dither"
                    rows={2}
                    width="2rem"
                    height="2rem"
                    seed={seed + 3}
                    animate={false}
                />
                <AsciiSkeleton
                    variant="dither"
                    rows={2}
                    width="2rem"
                    height="2rem"
                    seed={seed + 4}
                    animate={false}
                />
            </div>
        </div>
    );
}

/**
 * Horizontal loading strip matching {@link AccountTiles} carousel layout.
 */
export function AccountTilesSkeleton() {
    return (
        <div className={styles.carousel} aria-hidden>
            {Array.from({ length: ACCOUNT_SKELETON_COUNT }, (_, index) => (
                <AccountTileSkeleton key={index} seed={index * 5} animate={index < 3} />
            ))}
        </div>
    );
}
