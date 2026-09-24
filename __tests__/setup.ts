/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
    cookies: () => ({
        get: vi.fn(),
        set: vi.fn(),
        getAll: vi.fn(),
    }),
    headers: () => new Map(),
}));

// Mock openai (provider SDK used by lib/ai — Agnes/Poolside/OpenRouter all
// speak the OpenAI-compatible API)
vi.mock('openai', () => ({
    default: vi.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content:
                                    '{"title":"Test","summary":"Test","category":["Test"],"tags":["test"]}',
                            },
                        },
                    ],
                }),
            },
        },
        embeddings: {
            create: vi.fn().mockResolvedValue({
                data: [{ index: 0, embedding: new Array(1024).fill(0.1) }],
            }),
        },
    })),
}));
