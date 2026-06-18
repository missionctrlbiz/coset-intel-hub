const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const LOG_LEVEL_MAP: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

function currentLevel(): LogLevel {
    const envLevel = (process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug')).toLowerCase();
    return LOG_LEVELS.includes(envLevel as LogLevel) ? (envLevel as LogLevel) : 'info';
}

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_MAP[level] >= LOG_LEVEL_MAP[currentLevel()];
}

interface LogContext {
    [key: string]: unknown;
}

function formatEntry(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()} ${message}${ctx}`;
}

export const logger = {
    debug(message: string, context?: LogContext) {
        if (shouldLog('debug')) console.debug(formatEntry('debug', message, context));
    },
    info(message: string, context?: LogContext) {
        if (shouldLog('info')) console.info(formatEntry('info', message, context));
    },
    warn(message: string, context?: LogContext) {
        if (shouldLog('warn')) console.warn(formatEntry('warn', message, context));
    },
    error(message: string, error?: unknown, context?: LogContext) {
        if (shouldLog('error')) {
            const errObj = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
            console.error(formatEntry('error', message, { error: errObj, ...context }));
        }
    },
};
