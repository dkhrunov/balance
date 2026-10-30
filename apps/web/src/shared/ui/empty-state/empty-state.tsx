import { ReactNode } from 'react';
import { Button, Link } from '@carbon/react';
import { CarbonIconType } from '@carbon/icons-react';
import { EmptyStateIllustrationKind, resolveEmptyStateIllustration } from './illustrations';
import styles from './empty-state.module.scss';

/** Primary call to action under the empty-state body. */
type EmptyStateAction = {
    /** Visible button label. */
    readonly label: string;
    /** Click handler for the primary call to action. */
    readonly onClick: () => void;
    /**
     * Button kind. Spec default is `primary`. Prefer `tertiary` when several
     * empty states may show at once (Carbon Empty States).
     */
    readonly kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
    /** Optional Carbon icon rendered on the button. */
    readonly renderIcon?: CarbonIconType;
    /** Disables the action while a mutation is in flight. */
    readonly disabled?: boolean;
};

/** Secondary call to action (documentation / follow-up link). */
type EmptyStateLink = {
    /** Visible link text. */
    readonly label: string;
    /** Destination URL. */
    readonly href: string;
};

type EmptyStateProps = {
    /** Short positive/concise title (Carbon Empty States anatomy). */
    readonly title: string;
    /** Body copy explaining next steps or why the space is empty. */
    readonly body?: ReactNode;
    /**
     * Built-in illustration. When omitted (and
     * `illustration` is also omitted), no illustration is shown.
     */
    readonly illustrationKind?: EmptyStateIllustrationKind;
    /**
     * Custom decorative illustration. When omitted (and `illustrationKind` is
     * also omitted), no illustration is shown. Pass `false`/`null` to force hide
     * even if a kind were provided later via spread.
     */
    readonly illustration?: ReactNode | false | null;
    /** Optional primary call to action under the body. */
    readonly action?: EmptyStateAction;
    /** Optional secondary documentation / follow-up link. */
    readonly link?: EmptyStateLink;
    /** Heading element for the title. Default `p` to avoid breaking page hierarchy. */
    readonly headingAs?: 'h3' | 'h4' | 'p';
    /** Optional extra class on the root. */
    readonly className?: string;
};

/**
 * Resolves whether to render an illustration and which node to use.
 * No illustration unless `illustration` or `illustrationKind` is explicitly set.
 */
function resolveIllustration(
    illustration: EmptyStateProps['illustration'],
    illustrationKind: EmptyStateProps['illustrationKind'],
): ReactNode | null {
    if (illustration === false || illustration === null) {
        return null;
    }

    if (illustration !== undefined) {
        return illustration;
    }

    if (illustrationKind !== undefined) {
        return resolveEmptyStateIllustration(illustrationKind);
    }

    return null;
}

/**
 * Basic empty state (md) per Carbon Empty States / IoT empty-state layout:
 * optional illustration (80px) → title → body → optional primary button → optional link.
 * Illustrations are decorative (`aria-hidden`).
 *
 * @see https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states
 */
export function EmptyState({
    title,
    body,
    illustrationKind,
    illustration,
    action,
    link,
    headingAs: Heading = 'p',
    className,
}: EmptyStateProps) {
    const resolvedIllustration = resolveIllustration(illustration, illustrationKind);

    const rootClass = className ? `${styles.root} ${className}` : styles.root;

    return (
        <div className={rootClass}>
            {resolvedIllustration ? (
                <div className={styles.illustration} aria-hidden>
                    {resolvedIllustration}
                </div>
            ) : null}

            <div className={styles.content}>
                <Heading className={styles.title}>{title}</Heading>
                {body ? <div className={styles.body}>{body}</div> : null}

                {action ? (
                    <div className={styles.action}>
                        <Button
                            kind={action.kind ?? 'primary'}
                            size="md"
                            renderIcon={action.renderIcon}
                            disabled={action.disabled}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    </div>
                ) : null}

                {link ? (
                    <div className={styles.link}>
                        <Link href={link.href}>{link.label}</Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
