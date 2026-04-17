'use client';

import { useEffect } from 'react';

type ReportViewTrackerProps = {
    reportId: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ReportViewTracker({ reportId }: ReportViewTrackerProps) {
    useEffect(() => {
        if (!UUID_RE.test(reportId) || typeof window === 'undefined') {
            return;
        }

        const storageKey = `report-viewed:${reportId}`;

        if (window.sessionStorage.getItem(storageKey)) {
            return;
        }

        window.sessionStorage.setItem(storageKey, '1');

        void fetch(`/api/reports/${reportId}?view=1`, {
            method: 'POST',
            keepalive: true,
        }).catch(() => {
            window.sessionStorage.removeItem(storageKey);
        });
    }, [reportId]);

    return null;
}