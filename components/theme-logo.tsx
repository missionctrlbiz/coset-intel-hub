import Image from 'next/image';
import { cn } from '@/lib/utils';

type ThemeLogoProps = {
    width?: number;
    height?: number;
    className?: string;
    forceDark?: boolean;
};

/**
 * Theme-aware logo with no hydration flash.
 *
 * The inline theme bootstrap in `app/layout.tsx` toggles the `dark` class
 * on <html> *before* React paints. We exploit that by rendering BOTH
 * logos stacked and letting CSS reveal the right one:
 *   - logo.png        : visible in light mode (.block.dark:hidden)
 *   - logo-white.png  : visible in dark  mode (.hidden.dark:block)
 *
 * For pages with a forced-dark header (admin, etc.) we know the choice at
 * SSR time, so we render only the white variant to avoid loading both.
 */
export function ThemeLogo({
    width = 640,
    height = 256,
    className = 'w-[98px] h-auto sm:w-[118px]',
    forceDark = false,
}: ThemeLogoProps) {
    if (forceDark) {
        return (
            <Image
                src="/logo-white.png"
                alt="CoSET"
                width={width}
                height={height}
                priority
                className={className}
            />
        );
    }

    return (
        <>
            <Image
                src="/logo.png"
                alt="CoSET"
                width={width}
                height={height}
                priority
                className={cn(className, 'block dark:hidden')}
            />
            <Image
                src="/logo-white.png"
                alt="CoSET"
                width={width}
                height={height}
                priority
                className={cn(className, 'hidden dark:block')}
            />
        </>
    );
}
