import { EmptyStateIllustrationKind } from './kinds';
import { EmptyStateDefaultIcon } from './empty-state-default-icon';
import { EmptyStateErrorIcon } from './empty-state-error-icon';
import { EmptyStateNoResultsIcon } from './empty-state-no-results-icon';
import { EmptyStateNotAuthorizedIcon } from './empty-state-not-authorized-icon';
import { EmptyStateNotFoundIcon } from './empty-state-not-found-icon';
import { EmptyStateSuccessIcon } from './empty-state-success-icon';

/**
 * Renders a built-in empty-state illustration by kind.
 *
 * @param kind - Illustration kind from static set
 */
export function resolveEmptyStateIllustration(kind: EmptyStateIllustrationKind) {
    switch (kind) {
        case 'noResults':
            return <EmptyStateNoResultsIcon />;
        case 'error':
            return <EmptyStateErrorIcon />;
        case 'notFound':
            return <EmptyStateNotFoundIcon />;
        case 'notAuthorized':
            return <EmptyStateNotAuthorizedIcon />;
        case 'success':
            return <EmptyStateSuccessIcon />;
        case 'default':
        default:
            return <EmptyStateDefaultIcon />;
    }
}
