import { useDeferredValue, useId, useMemo, useState } from 'react';
import { IconButton, Popover, PopoverContent, Search } from '@carbon/react';
import Image from '@carbon/icons-react/es/Image';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../empty-state';
import { Icon } from '../icon';
import {
    ICON_GROUPS,
    IconCatalogGroup,
    IconName,
    coerceIconName,
    formatIconLabel,
    isIconName,
} from '../icons';
import styles from './icon-picker.module.scss';

const TOOLTIP_ENTER_DELAY_MS = 400;
const SEARCH_RESULTS_GROUP_ID = 'search-results';
const ICONS_SET_GROUP_ID = 'icons-set';

export type IconPickerControlProps = {
    /** Currently selected icon name (API-opaque; empty/unknown shows placeholder). */
    readonly value: string;
    /** Called with a curated icon name when the user picks an icon. */
    readonly onChange: (name: IconName) => void;
    /**
     * Group ids to show (`accounts`, `expenses`, `income`, `general`).
     * Ignored when empty; combined with {@link icons} when both are set.
     */
    readonly groups?: readonly string[];
    /**
     * Explicit allowlist of curated icon names.
     * When set (non-empty), only these icons appear (optionally intersected with {@link groups}).
     */
    readonly icons?: readonly string[];
    /**
     * Id of a visible label associated via `aria-labelledby`.
     * Prefer this over {@link 'aria-label'} when a visible label is present.
     */
    readonly 'aria-labelledby'?: string;
    /** Accessible name for the trigger when no visible label is associated. */
    readonly 'aria-label'?: string;
    /** Disables the trigger and options. */
    readonly disabled?: boolean;
    /** Optional class on the trigger row wrapper. */
    readonly className?: string;
    /** Carbon {@link IconButton} kind. Default `secondary`; fluid uses `ghost`. */
    readonly kind?: 'secondary' | 'ghost';
};

type VisibleGroup = {
    readonly id: string;
    readonly title: string;
    readonly icons: readonly IconName[];
};

function uniqueValidIconNames(iconsFilter: readonly string[]): IconName[] {
    const unique: IconName[] = [];
    const seen = new Set<string>();

    for (const name of iconsFilter) {
        if (seen.has(name) || !isIconName(name)) {
            continue;
        }

        seen.add(name);
        unique.push(name);
    }

    return unique;
}

function catalogFromIconAllowlist(iconsFilter: readonly string[]): readonly IconCatalogGroup[] {
    const unique = uniqueValidIconNames(iconsFilter);

    if (unique.length === 0) {
        return [];
    }

    return [
        {
            id: ICONS_SET_GROUP_ID,
            icons: unique,
        },
    ];
}

function filterCatalogByGroups(
    catalog: readonly IconCatalogGroup[],
    groupsFilter: readonly string[],
): readonly IconCatalogGroup[] {
    const allowedGroups = new Set(groupsFilter);
    return catalog.filter((group) => allowedGroups.has(group.id));
}

function filterCatalogByIcons(
    catalog: readonly IconCatalogGroup[],
    iconsFilter: readonly string[],
): readonly IconCatalogGroup[] {
    const allowedIcons = new Set(iconsFilter);

    return catalog
        .map((group) => ({
            ...group,
            icons: group.icons.filter((name) => allowedIcons.has(name)),
        }))
        .filter((group) => group.icons.length > 0);
}

/**
 * Scopes the curated catalog by optional group ids and/or icon names.
 * When neither filter is provided (or both are empty), returns the full catalog.
 */
export function scopeIconCatalog(
    groupsFilter?: readonly string[],
    iconsFilter?: readonly string[],
): readonly IconCatalogGroup[] {
    const hasGroups = Boolean(groupsFilter && groupsFilter.length > 0);
    const hasIcons = Boolean(iconsFilter && iconsFilter.length > 0);

    if (!hasGroups && !hasIcons) {
        return ICON_GROUPS;
    }

    if (hasIcons && !hasGroups && iconsFilter) {
        return catalogFromIconAllowlist(iconsFilter);
    }

    let catalog: readonly IconCatalogGroup[] = ICON_GROUPS;

    if (hasGroups && groupsFilter) {
        catalog = filterCatalogByGroups(catalog, groupsFilter);
    }

    if (hasIcons && iconsFilter) {
        catalog = filterCatalogByIcons(catalog, iconsFilter);
    }

    return catalog;
}

function groupTitle(
    group: IconCatalogGroup,
    translateGroup: (id: string) => string,
): string {
    if (group.id === ICONS_SET_GROUP_ID) {
        return translateGroup('custom');
    }

    return translateGroup(group.id);
}

function flattenVisibleGroups(
    catalog: readonly IconCatalogGroup[],
    translateGroup: (id: string) => string,
): readonly VisibleGroup[] {
    return catalog.map((group) => ({
        id: group.id,
        title: groupTitle(group, translateGroup),
        icons: group.icons,
    }));
}

function filterIconsByQuery(
    catalog: readonly IconCatalogGroup[],
    query: string,
): IconName[] {
    const matches: IconName[] = [];
    const seen = new Set<string>();

    for (const group of catalog) {
        for (const iconName of group.icons) {
            if (seen.has(iconName)) {
                continue;
            }

            const label = formatIconLabel(iconName).toLocaleLowerCase();

            if (iconName.toLocaleLowerCase().includes(query) || label.includes(query)) {
                seen.add(iconName);
                matches.push(iconName);
            }
        }
    }

    return matches;
}

/**
 * Trigger + popover catalog for the curated icon set (no field label chrome).
 * Used by {@link IconPicker} and {@link FluidIconPicker}.
 */
export function IconPickerControl({
    value,
    onChange,
    groups,
    icons,
    'aria-labelledby': ariaLabelledBy,
    'aria-label': ariaLabel,
    disabled = false,
    className,
    kind = 'secondary',
}: IconPickerControlProps) {
    const { t } = useTranslation();
    const searchId = useId();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
    const hasSelection = Boolean(value) && isIconName(value);
    const selected = hasSelection ? coerceIconName(value) : null;
    const groupLabel = ariaLabel ?? t('icon.pickerLabel');

    const scopedCatalog = useMemo(
        () => scopeIconCatalog(groups, icons),
        [groups, icons],
    );

    const visibleGroups = useMemo((): readonly VisibleGroup[] => {
        if (!deferredQuery) {
            return flattenVisibleGroups(scopedCatalog, (id) => t(`icon.groups.${id}`));
        }

        const matches = filterIconsByQuery(scopedCatalog, deferredQuery);

        if (matches.length === 0) {
            return [];
        }

        return [
            {
                id: SEARCH_RESULTS_GROUP_ID,
                title: t('icon.searchResults', { count: matches.length }),
                icons: matches,
            },
        ];
    }, [deferredQuery, scopedCatalog, t]);

    const onPick = (name: IconName) => {
        onChange(name);
        setOpen(false);
        setQuery('');
    };

    const closePicker = () => {
        setOpen(false);
        setQuery('');
    };

    return (
        <div className={className ? `${styles.triggerRow} ${className}` : styles.triggerRow}>
            <Popover open={open} onRequestClose={closePicker} align="bottom-start" autoAlign>
                <IconButton
                    kind={kind}
                    size="md"
                    label={selected ? formatIconLabel(selected) : t('icon.placeholder')}
                    align="right"
                    enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                    disabled={disabled}
                    aria-labelledby={ariaLabelledBy}
                    aria-label={ariaLabelledBy ? undefined : groupLabel}
                    aria-expanded={open}
                    aria-haspopup="dialog"
                    onClick={() => setOpen((current) => !current)}
                >
                    {selected ? <Icon name={selected} size={16} /> : <Image />}
                </IconButton>
                {open ? (
                    <PopoverContent className={styles.popoverPanel}>
                        <Search
                            id={searchId}
                            size="sm"
                            labelText={t('icon.search')}
                            placeholder={t('icon.search')}
                            value={query}
                            closeButtonLabelText={t('icon.clearSearch')}
                            onChange={(event) => setQuery(event.target.value)}
                            onClear={() => setQuery('')}
                            disabled={disabled}
                        />
                        <div className={styles.catalog} aria-label={groupLabel}>
                            {visibleGroups.length === 0 ? (
                                <EmptyState
                                    illustrationKind="noResults"
                                    title={t('icon.noResults')}
                                />
                            ) : (
                                visibleGroups.map((group) => (
                                    <section
                                        key={group.id}
                                        className={styles.group}
                                        aria-labelledby={`${searchId}-${group.id}`}
                                    >
                                        <h3
                                            id={`${searchId}-${group.id}`}
                                            className={styles.groupHeader}
                                        >
                                            {group.title}
                                        </h3>
                                        <div className={styles.groupSplitter} role="separator" />
                                        <IconGrid
                                            icons={group.icons}
                                            selected={selected}
                                            disabled={disabled}
                                            onPick={onPick}
                                        />
                                    </section>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                ) : null}
            </Popover>
        </div>
    );
}

type IconGridProps = {
    readonly icons: readonly IconName[];
    readonly selected: string | null;
    readonly disabled: boolean;
    readonly onPick: (name: IconName) => void;
};

function IconGrid({ icons, selected, disabled, onPick }: IconGridProps) {
    return (
        <div className={styles.grid}>
            {icons.map((name) => (
                <div key={name} className={styles.cell}>
                    <IconButton
                        kind="ghost"
                        size="sm"
                        label={formatIconLabel(name)}
                        align="top"
                        enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                        isSelected={selected === name}
                        disabled={disabled}
                        onClick={() => onPick(name)}
                    >
                        <Icon name={name} size={16} />
                    </IconButton>
                </div>
            ))}
        </div>
    );
}
