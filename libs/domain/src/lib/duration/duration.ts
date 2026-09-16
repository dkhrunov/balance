const DURATION_PATTERN = /^([1-9]\d*)([smhd])$/u;
const MAX_DURATION_SECONDS = 366 * 24 * 60 * 60;

const UNITS_IN_SECONDS: Readonly<Record<string, number>> = {
    // eslint-disable-next-line code-complete/enforce-meaningful-names
    s: 1,
    // eslint-disable-next-line code-complete/enforce-meaningful-names
    m: 60,
    // eslint-disable-next-line code-complete/enforce-meaningful-names
    h: 60 * 60,
    // eslint-disable-next-line code-complete/enforce-meaningful-names
    d: 24 * 60 * 60,
};

export class DurationValidationError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'DurationValidationError';
    }
}

/**
 * A positive duration parsed from a compact config string such as `15m` or `30d`.
 */
export class Duration {
    private readonly totalSeconds: number;

    public constructor(value: string) {
        this.totalSeconds = Duration.parseToSeconds(value);
    }

    /**
     * Returns the duration in seconds.
     */
    public toSeconds(): number {
        return this.totalSeconds;
    }

    private static parseToSeconds(value: string): number {
        const { amount, multiplier } = Duration.parseDurationParts(value);
        const seconds = amount * multiplier;

        Duration.assertAllowedDurationSeconds(seconds);

        return seconds;
    }

    private static parseDurationParts(value: string): { amount: number; multiplier: number } {
        const match = DURATION_PATTERN.exec(value);

        if (!match) {
            throw new DurationValidationError('Duration must use a positive integer with s, m, h, or d suffix');
        }

        const multiplier = UNITS_IN_SECONDS[match[2]];

        if (!multiplier) {
            throw new DurationValidationError('Duration has an unsupported duration unit');
        }

        return { amount: Number(match[1]), multiplier };
    }

    private static assertAllowedDurationSeconds(seconds: number): void {
        if (!Number.isSafeInteger(seconds) || seconds > MAX_DURATION_SECONDS) {
            throw new DurationValidationError('Duration is outside the allowed duration range');
        }
    }
}
