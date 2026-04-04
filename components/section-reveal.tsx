'use client';

import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

type SectionRevealProps = PropsWithChildren<{
    delay?: number;
    className?: string;
}>;

export function SectionReveal({ children, delay = 0, className }: SectionRevealProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
        >
            {children}
        </motion.div>
    );
}