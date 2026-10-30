import { useMemo, useState } from 'react';
import {
    Column,
    ContentSwitcher,
    Grid,
    InlineNotification,
    Switch,
    Tile,
} from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { AccountBalance } from '@balance/domain/transactions';
import { AsciiReveal, AsciiSkeleton } from 'ascii-reveal';
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

    const showSelectPrompt = !account && !showSkeleton;
    const showError = Boolean(account) && transactionsLoadState === 'error' && !showSkeleton;

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

    const showContent =
        !showSkeleton &&
        !showError &&
        balance != null &&
        income != null &&
        expenses != null;

    return (
        <section className={styles.section} aria-labelledby="dashboard-summary-heading">
            <div className={styles.header}>
                <h4 id="dashboard-summary-heading" className={styles.title}>
                    {t('summary.title')}
                </h4>
                {!showSelectPrompt ? (
                    <AsciiReveal>
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
                            data-ascii="fade"
                        >
                            {PRESETS.map((value) => (
                                <Switch
                                    key={value}
                                    name={value}
                                    text={t(`summary.presets.${value}`)}
                                />
                            ))}
                        </ContentSwitcher>
                    </AsciiReveal>
                ) : null}
            </div>

            <AsciiReveal loading={showSkeleton} className={styles.stack}>
                {showSelectPrompt ? (
                    <EmptyState
                        title={t('summary.selectAccountTitle')}
                        body={t('summary.selectAccountBody')}
                    />
                ) : null}

                {showSkeleton ? <SummarySkeleton /> : null}

                {showError ? (
                    <InlineNotification
                        kind="error"
                        title={t('summary.cannotLoad')}
                        subtitle={t('summary.loadError')}
                        lowContrast
                        hideCloseButton
                    />
                ) : null}

                {showContent ? (
                    <>
                        <Grid fullWidth className={styles.tilesGrid}>
                            <Column sm={4} md={8} lg={5}>
                                <Tile className={styles.tile} data-ascii="surface">
                                    <p className={styles.tileLabel}>{t('summary.tiles.balance')}</p>
                                    <p className={styles.tileValue} data-ascii-digits>
                                        {balance}
                                    </p>
                                </Tile>
                            </Column>
                            <Column sm={4} md={8} lg={6}>
                                <Tile className={styles.tile} data-ascii="surface">
                                    <p className={styles.tileLabel}>{t('summary.tiles.income')}</p>
                                    <p
                                        className={`${styles.tileValue} ${styles.amountPositive}`}
                                        data-ascii-digits
                                    >
                                        {income}
                                    </p>
                                </Tile>
                            </Column>
                            <Column sm={4} md={8} lg={5}>
                                <Tile className={styles.tile} data-ascii="surface">
                                    <p className={styles.tileLabel}>{t('summary.tiles.expenses')}</p>
                                    <p
                                        className={`${styles.tileValue} ${styles.amountNegative}`}
                                        data-ascii-digits
                                    >
                                        {expenses}
                                    </p>
                                </Tile>
                            </Column>
                        </Grid>
                        <div
                            className={styles.chartPlaceholder}
                            aria-label={t('summary.chart.aria')}
                            data-ascii="surface"
                        >
                            <p className={styles.chartText}>{t('summary.chart.placeholder')}</p>
                        </div>
                    </>
                ) : null}
            </AsciiReveal>
        </section >
    );
}

function SummarySkeleton() {
    return (
        <>
            <Grid fullWidth className={styles.tilesGrid}>
                <Column sm={4} md={8} lg={5}>
                    <Tile className={styles.tile}>
                        <div className={styles.tileLabel}>
                            <AsciiSkeleton lines={1} widths={['40%']} seed={1} />
                        </div>
                        <div className={styles.tileValue}>
                            <AsciiSkeleton lines={1} widths={['70%']} seed={2} />
                        </div>
                    </Tile >
                </Column >
                <Column sm={4} md={8} lg={6}>
                    <Tile className={styles.tile}>
                        <div className={styles.tileLabel}>
                            <AsciiSkeleton lines={1} widths={['40%']} seed={3} />
                        </div>
                        <div className={styles.tileValue}>
                            <AsciiSkeleton lines={1} widths={['70%']} seed={4} />
                        </div>
                    </Tile >
                </Column >
                <Column sm={4} md={8} lg={5}>
                    <Tile className={styles.tile}>
                        <div className={styles.tileLabel}>
                            <AsciiSkeleton lines={1} widths={['40%']} seed={5} />
                        </div>
                        <div className={styles.tileValue}>
                            <AsciiSkeleton lines={1} widths={['70%']} seed={6} />
                        </div>
                    </Tile>
                </Column>
            </Grid>
            <div className={styles.chartSkeleton} aria-hidden>
                <AsciiSkeleton rows={12} width="100%" seed={10} />
            </div>
        </>
    );
}
