'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export function SearchForm({ dark }: { dark?: boolean }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        setQuery(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/reports?q=${encodeURIComponent(query.trim())}`);
        } else {
            router.push('/reports');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn('hidden items-center gap-2 rounded-full px-4 py-2 lg:flex', dark ? 'bg-white/10' : 'bg-mist')}>
            <Search className="h-4 w-4" />
            <input
                aria-label="Search intelligence"
                className="w-48 bg-transparent text-sm outline-none placeholder:text-current/50"
                placeholder="Search intelligence..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </form>
    );
}
