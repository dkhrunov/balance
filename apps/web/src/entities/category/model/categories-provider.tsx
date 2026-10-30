import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    ReactNode,
} from 'react';
import { Category } from '@balance/dto/categories';
import { useTranslation } from 'react-i18next';
import { CategoriesApi } from '../../../shared/api';
import { useAuth } from '../../../shared/auth';
import { LoadState } from '../../../shared/lib/load-state';

/**
 * Shared in-memory categories catalog for the authenticated session.
 * Consumers read via {@link useCategories}; mutations must call
 * {@link ICategories.upsertCategory} / {@link ICategories.removeCategory} after API success.
 */
export interface ICategories {
    readonly categories: readonly Category[];
    readonly categoriesMap: ReadonlyMap<Category['id'], Category>;
    readonly income: readonly Category[];
    readonly expense: readonly Category[];
    readonly loadState: LoadState;
    readonly loadError: string | null;
    reloadCategories: () => Promise<void>;
    upsertCategory: (category: Category) => void;
    removeCategory: (categoryId: Category['id']) => void;
}

const CategoriesContext = createContext<ICategories | null>(null);

const EMPTY: readonly Category[] = [];
const EMPTY_MAP: ReadonlyMap<Category['id'], Category> = new Map();

function buildCategoriesMap(
    categories: readonly Category[],
): ReadonlyMap<Category['id'], Category> {
    const map = new Map<Category['id'], Category>();

    for (const category of categories) {
        map.set(category.id, category);
    }

    return map;
}

function partitionByType(categories: readonly Category[]): {
    readonly income: readonly Category[];
    readonly expense: readonly Category[];
} {
    const income: Category[] = [];
    const expense: Category[] = [];

    for (const category of categories) {
        if (category.type === 'INCOME') {
            income.push(category);
        } else {
            expense.push(category);
        }
    }

    return { income, expense };
}

/**
 * Loads and owns the space categories list while the user is authenticated.
 */
export function CategoriesProvider({ children }: { children: ReactNode }) {
    const { t } = useTranslation();
    const { status: authStatus } = useAuth();
    const [categories, setCategories] = useState<readonly Category[]>(EMPTY);
    const [loadState, setLoadState] = useState<LoadState>('idle');
    const [loadError, setLoadError] = useState<string | null>(null);
    // Keep `t` out of the fetch effect deps — locale apply after preferences would refetch.
    const tRef = useRef(t);
    tRef.current = t;

    useEffect(() => {
        if (authStatus !== 'authenticated') {
            setCategories(EMPTY);
            setLoadState('idle');
            setLoadError(null);
            return;
        }

        let cancelled = false;

        setLoadState('loading');
        setLoadError(null);

        CategoriesApi.queryCategories()
            .then((response) => {
                if (!cancelled) {
                    setCategories(response.items);
                    setLoadState('ready');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setCategories(EMPTY);
                    setLoadState('error');
                    setLoadError(tRef.current('categories.loadError'));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [authStatus]);

    const reloadCategories = useCallback(async () => {
        if (authStatus !== 'authenticated') {
            setCategories(EMPTY);
            setLoadState('idle');
            setLoadError(null);
            return;
        }

        setLoadState('loading');
        setLoadError(null);

        try {
            const response = await CategoriesApi.queryCategories();
            setCategories(response.items);
            setLoadState('ready');
        } catch {
            setCategories(EMPTY);
            setLoadState('error');
            setLoadError(tRef.current('categories.loadError'));
        }
    }, [authStatus]);

    const upsertCategory = useCallback((category: Category) => {
        setCategories((current) => {
            const index = current.findIndex((item) => item.id === category.id);

            if (index === -1) {
                return [...current, category];
            }

            return current.map((item) => (item.id === category.id ? category : item));
        });
    }, []);

    const removeCategory = useCallback((categoryId: Category['id']) => {
        setCategories((current) => current.filter((category) => category.id !== categoryId));
    }, []);

    const value = useMemo((): ICategories => {
        const { income, expense } = partitionByType(categories);

        return {
            categories,
            categoriesMap: categories.length === 0 ? EMPTY_MAP : buildCategoriesMap(categories),
            income,
            expense,
            loadState,
            loadError,
            reloadCategories,
            upsertCategory,
            removeCategory,
        };
    }, [categories, loadState, loadError, reloadCategories, upsertCategory, removeCategory]);

    return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

/** Returns the shared categories catalog. Requires {@link CategoriesProvider}. */
export function useCategories(): ICategories {
    const context = useContext(CategoriesContext);

    if (!context) {
        throw new Error('useCategories must be used within CategoriesProvider');
    }

    return context;
}
