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

// Mock @google/genai
vi.mock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: {
            generateContent: vi.fn().mockResolvedValue({
                text: '{"title":"Test","summary":"Test","category":["Test"],"tags":["test"]}',
            }),
            generateContentStream: vi.fn(),
            embedContent: vi.fn().mockResolvedValue({
                embeddings: [{ values: new Array(768).fill(0.1) }],
            }),
        },
    })),
}));
