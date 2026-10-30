import { useMemo, useState } from 'react';
import {
    Column,
    ContentSwitcher,
    Grid,
    InlineNotification,
    SkeletonPlaceholder,
    SkeletonText,
    Switch,
    Tile,
} from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { AccountBalance } from '@balance/domain/transactions';
import { useTranslation } from 'react-i18next';
import { useAccounts } from '../../../../entities/account';
import { formatMoney } from '../../../../shared/lib/money';
import { LoadState } from '../../../../shared/lib/load-state';
import { usePreferences } from '../../../../shared/preferences';
import { EmptyState } from '../../../../shared/ui/empty-state';
import { DateRangePreset, isDateInRange, resolveDateRangePreset } from './date-range';
import styles from './summary-section.module.scss';

type SummarySectionProps = {
    readonly account: Account | null;
    readonly transactions: readonly Transaction[];
    readonly transactionsLoadState: LoadState;
};

const PRESETS: readonly DateRangePreset[] = ['thisMonth', 'last30Days', 'last90Days', 'all'];

/**
 * Per-selected-account summary tiles (balance / income / expenses) + charts placeholder.
 * Balance uses full history; income/expense tiles respect the date preset (transfers excluded).
 */
export function SummarySection({
    account,
    transactions,
    transactionsLoadState,
}: SummarySectionProps) {
    const { t } = useTranslation();
    const { locale } = usePreferences();
    const { loadState: accountsLoadState } = useAccounts();
    const [preset, setPreset] = useState<DateRangePreset>('thisMonth');

    const range = useMemo(() => resolveDateRangePreset(preset), [preset]);

    const inRange = useMemo(
        () => transactions.filter((transaction) => isDateInRange(transaction.transactionDate, range)),
        [transactions, range],
    );

    const showSkeleton =
        accountsLoadState === 'loading' ||
        transactionsLoadState === 'loading' ||
        (transactionsLoadState === 'idle' && !account);

    if (!account && !showSkeleton) {
        return (
            <section className={styles.section} aria-labelledby="dashboard-summary-heading">
                <h4 id="dashboard-summary-heading" className={styles.title}>
                    {t('summary.title')}
                </h4>
                <EmptyState
                    title={t('summary.selectAccountTitle')}
                    body={t('summary.selectAccountBody')}
                />
            </section>
        );
    }

    const balance =
        account == null
            ? null
            : formatMoney(
                AccountBalance.derive(account.initialBalance, account.currency, transactions),
                account.currency,
                locale,
            );

    const income =
        account == null
            ? null
            : `+${formatMoney(
                AccountBalance.sumByTypes(account.currency, inRange, ['INCOME']),
                account.currency,
                locale,
            )}`;

    const expenses =
        account == null
            ? null
            : `−${formatMoney(
                AccountBalance.sumByTypes(account.currency, inRange, ['EXPENSE']),
                account.currency,
                locale,
            )}`;

    return (
        <section className={styles.section} aria-labelledby="dashboard-summary-heading">
            <div className={styles.header}>
                <h4 id="dashboard-summary-heading" className={styles.title}>
                    {t('summary.title')}
                </h4>
                <ContentSwitcher
                    size="sm"
                    selectedIndex={PRESETS.indexOf(preset)}
                    onChange={(event) => {
                        const index = typeof event.index === 'number' ? event.index : 0;
                        const next = PRESETS[index];

                        if (next) {
                            setPreset(next);
                        }
                    }}
                >
                    {PRESETS.map((value) => (
                        <Switch key={value} name={value} text={t(`summary.presets.${value}`)} />
                    ))}
                </ContentSwitcher>
            </div>

            {transactionsLoadState === 'error' && !showSkeleton ? (
                <InlineNotification
                    kind="error"
                    title={t('summary.cannotLoad')}
                    subtitle={t('summary.loadError')}
                    lowContrast
                    hideCloseButton
                />
            ) : null}

            {showSkeleton ? <SummarySkeleton /> : null}

            {!showSkeleton && transactionsLoadState !== 'error' && balance && income && expenses ? (
                <>
                    <Grid fullWidth className={styles.tilesGrid}>
                        <Column sm={4} md={8} lg={5}>
                            <Tile className={styles.tile}>
                                <p className={styles.tileLabel}>{t('summary.tiles.balance')}</p>
                                <p className={styles.tileValue}>{balance}</p>
                            </Tile>
                        </Column>
                        <Column sm={4} md={8} lg={6}>
                            <Tile className={styles.tile}>
                                <p className={styles.tileLabel}>{t('summary.tiles.income')}</p>
                                <p className={`${styles.tileValue} ${styles.amountPositive}`}>{income}</p>
                            </Tile>
                        </Column>
                        <Column sm={4} md={8} lg={5}>
                            <Tile className={styles.tile}>
                                <p className={styles.tileLabel}>{t('summary.tiles.expenses')}</p>
                                <p className={`${styles.tileValue} ${styles.amountNegative}`}>{expenses}</p>
                            </Tile>
                        </Column>
                    </Grid>
                    <div className={styles.chartPlaceholder} aria-label={t('summary.chart.aria')}>
                        <p className={styles.chartText}>{t('summary.chart.placeholder')}</p>
                    </div>
                </>
            ) : null}
        </section>
    );
}

function SummarySkeleton() {
    return (
        <>
            <Grid fullWidth className={styles.tilesGrid}>
                <Column sm={4} md={8} lg={5}>
                    <Tile className={styles.tile}>
                        <SkeletonText className={styles.tileLabel} width="40%" />
                        <SkeletonText className={styles.tileValue} heading width="70%" />
                    </Tile>
                </Column>
                <Column sm={4} md={8} lg={6}>
                    <Tile className={styles.tile}>
                        <SkeletonText className={styles.tileLabel} width="40%" />
                        <SkeletonText className={styles.tileValue} heading width="70%" />
                    </Tile>
                </Column>
                <Column sm={4} md={8} lg={5}>
                    <Tile className={styles.tile}>
                        <SkeletonText className={styles.tileLabel} width="40%" />
                        <SkeletonText className={styles.tileValue} heading width="70%" />
                    </Tile>
                </Column>
            </Grid>
            <SkeletonPlaceholder className={styles.chartSkeleton} />
        </>
    );
}
