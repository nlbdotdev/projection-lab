import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for combining CSS classes
 *
 * Combines clsx for conditional class names with tailwind-merge to resolve
 * conflicting Tailwind CSS classes. This ensures that the last conflicting
 * class takes precedence while maintaining proper class concatenation.
 *
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
