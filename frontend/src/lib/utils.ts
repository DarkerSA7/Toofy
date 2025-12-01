import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * Handles conditional classes and merges conflicting Tailwind utilities
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate page numbers for pagination with ellipsis
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param delta - Number of pages to show around current page (default: 2)
 * @returns Array of page numbers and ellipsis strings
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  delta: number = 2
): (number | string)[] {
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []
  let l: number | undefined

  // Build range of page numbers to show
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i)
    }
  }

  // Add ellipsis where needed
  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
}

/**
 * Sleep/delay for a specified number of milliseconds
 * Useful for simulating async operations or adding delays
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
