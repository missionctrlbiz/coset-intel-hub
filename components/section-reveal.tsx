'use client';

import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

type SectionRevealProps = PropsWithChildren<{
    delay?: number;
    className?: string;
    yOffset?: number;
}>;

export function SectionReveal({ children, delay = 0, className, yOffset = 30 }: SectionRevealProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.1 }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerReveal({ children, delay = 0, className }: SectionRevealProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: 0.15,
                        delayChildren: delay,
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
}

export function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
                },
                exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
            }}
        >
            {children}
        </motion.div>
    );
}