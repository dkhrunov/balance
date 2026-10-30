import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { UserAvatar } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/auth';
import { ROUTES } from '../../../../shared/routes';

/**
 * Header account menu (profile / settings / log out) via Carbon OverflowMenu.
 * Private to the app layout (not re-exported from the layout barrel).
 */
export function HeaderAccountActions() {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const onLogout = async () => {
        await logout();
        navigate(ROUTES.login, { replace: true });
    };

    return (
        <OverflowMenu
            flipped
            renderIcon={UserAvatar}
            iconDescription={t('nav.account')}
            aria-label={t('nav.account')}
            size="lg"
            align="bottom-end"
        >
            <OverflowMenuItem
                itemText={t('nav.profile')}
                onClick={() => navigate(ROUTES.profile)}
            />
            <OverflowMenuItem
                itemText={t('nav.settings')}
                onClick={() => navigate(ROUTES.settings)}
            />
            <OverflowMenuItem hasDivider itemText={t('nav.logOut')} onClick={onLogout} />
        </OverflowMenu>
    );
}
