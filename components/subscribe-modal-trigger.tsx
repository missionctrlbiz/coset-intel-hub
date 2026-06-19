'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Mail, X } from 'lucide-react';
import { useState } from 'react';

import { SubscribeForm } from '@/components/subscribe-form';
import { Button, type ButtonVariant } from '@/components/ui/button';

type SubscribeModalTriggerProps = {
    label?: string;
    className?: string;
    modalTitle?: string;
    modalDescription?: string;
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
};

const defaultDescription = 'Receive CoSET publication updates in your inbox as soon as new reports and briefs go live.';

export function SubscribeModalTrigger({
    label = 'Subscribe Now',
    className,
    modalTitle = 'Subscribe to CoSET Updates',
    modalDescription = defaultDescription,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
}: SubscribeModalTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false);
    }

    return (
        <>
            <Button
                type="button"
                variant={variant}
                size={size}
                fullWidth={fullWidth}
                className={className}
                onClick={() => setIsOpen(true)}
            >
                {label}
            </Button>

            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020611]/78 px-4 py-8 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            onClick={(event) => event.stopPropagation()}
                            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/12 bg-[#08131f] text-white shadow-[0_40px_120px_rgb(2_6_23/0.48)]"
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                size="md"
                                aria-label="Close subscribe modal"
                                onClick={closeModal}
                                className="absolute right-5 top-5 z-10 h-10 w-10 border border-white/12 bg-white/6 text-white/82 hover:bg-white/12 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </Button>

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,75,34,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(13,148,136,0.16),transparent_26%)]" />

                            <div className="relative px-5 py-8 sm:px-10 sm:py-10">
                                <div className="space-y-7">
                                    <div className="space-y-4 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/8 text-ember shadow-soft">
                                            <Mail className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Publication Alerts</p>
                                            <h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
                                                {modalTitle}
                                            </h3>
                                            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/82 sm:text-base">
                                                {modalDescription}
                                            </p>
                                        </div>
                                    </div>

                                    <SubscribeForm
                                        tone="dark"
                                        submitLabel="Save my email"
                                        successTitle="Your email has been saved."
                                        successMessage="We'll be getting updates once we get a new publication."
                                    />

                                    <div className="flex justify-center pt-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="md"
                                            onClick={closeModal}
                                            className="border-white/14 bg-white/6 text-white/88 hover:bg-white/10 hover:text-white sm:min-w-[180px]"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}
