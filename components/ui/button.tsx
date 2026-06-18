import Link from 'next/link';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Unified button system for the CoSET Intelligence Hub.
 *
 * Replaces ~35 inline button classNames with one polymorphic primitive.
 * Renders a Next.js <Link> when `href` is provided, otherwise a <button>.
 * All variants meet the 44px touch-target floor at `md`/`lg` sizes and
 * scale text responsively (text-sm → sm:text-base).
 *
 * Visual mapping preserves the existing brand look:
 *  - primary   → ember accent (was bg-ember across CTAs)
 *  - secondary → navy/ink dark button
 *  - outline   → border-line, navy text (was the "Read"/"Back" family)
 *  - ghost     → transparent, subtle hover (nav links, icon toggles)
 *  - destructive → rose-600 (delete confirm)
 *  - teal      → teal solid (the single admin-feedback "Save Reply" case)
 */

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'teal';

type ButtonSize = 'sm' | 'md' | 'lg';

type IconOnlySize = 'sm' | 'md' | 'lg';

const BASE =
    'inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
    primary:
        'rounded-full bg-ember text-white shadow-soft hover:brightness-110 active:scale-[0.98]',
    secondary:
        'rounded-full bg-navy text-white hover:brightness-110 active:scale-[0.98] dark:bg-ink',
    outline:
        'rounded-full border border-line text-navy hover:border-navy hover:text-ink dark:text-white dark:hover:border-white/60 dark:hover:text-white',
    ghost:
        'rounded-full text-navy hover:bg-mist dark:text-white/90 dark:hover:bg-white/5',
    destructive:
        'rounded-xl bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] dark:bg-rose-600',
    teal:
        'rounded-xl bg-teal text-white hover:brightness-110 active:scale-[0.98]',
};

const SIZES: Record<ButtonSize, string> = {
    // sm: compact — meets 44px height when paired with py-2.5 + leading
    sm: 'px-4 py-2 text-sm',
    // md: default CTA — responsive text scaling, 44px+ tap target
    md: 'px-5 py-2.5 text-sm sm:text-base',
    // lg: hero / publish actions
    lg: 'px-6 py-3 text-sm sm:text-base',
};

const FULL_WIDTH = 'w-full';

type CommonProps = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
    children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
        href?: undefined;
    };

type ButtonAsLink = CommonProps &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'href'> & {
        href: string;
    };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export type { ButtonVariant };

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    function Button(
        { variant = 'primary', size = 'md', fullWidth, className, children, ...props },
        ref,
    ) {
        const classes = cn(
            BASE,
            VARIANTS[variant],
            SIZES[size],
            fullWidth && FULL_WIDTH,
            className,
        );

        if ('href' in props && props.href !== undefined) {
            const { href, ...anchorProps } =
                props as ButtonAsLink & { href: string };
            return (
                <Link
                    ref={ref as React.Ref<HTMLAnchorElement>}
                    href={href}
                    className={classes}
                    {...anchorProps}
                >
                    {children}
                </Link>
            );
        }

        const buttonProps = props as ButtonAsButton;
        return (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                className={classes}
                {...buttonProps}
            >
                {children}
            </button>
        );
    },
);

/**
 * Icon-only button (circular). Standardizes the h-8/h-9/h-10/h-12/h-14 chaos
 * into three sizes. Use for hamburger menus, close buttons, action icons.
 * Always set an `aria-label` for accessibility.
 */
const ICON_SIZES: Record<IconOnlySize, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
};

const ICON_VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-ember text-white hover:brightness-110',
    secondary: 'bg-navy text-white hover:brightness-110 dark:bg-ink',
    outline:
        'border border-line text-navy hover:border-navy dark:border-white/15 dark:text-white dark:hover:border-white/60',
    ghost:
        'text-navy hover:bg-mist dark:text-white/90 dark:hover:bg-white/5',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700',
    teal: 'bg-teal text-white hover:brightness-110',
};

type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    variant?: ButtonVariant;
    size?: IconOnlySize;
    'aria-label': string;
    children: React.ReactNode;
    className?: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    function IconButton(
        { variant = 'ghost', size = 'md', className, children, ...props },
        ref,
    ) {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50',
                    ICON_SIZES[size],
                    ICON_VARIANTS[variant],
                    className,
                )}
                {...props}
            >
                {children}
            </button>
        );
    },
);
