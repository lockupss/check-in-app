// lib/utils.ts
import { twMerge } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatTime = (time: string | Date | null | undefined): string => {
  // Handle empty/undefined cases
  if (!time) return '-';

  // Convert to Date object if it isn't already
  const date = time instanceof Date ? time : new Date(time);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid time value:', time);
    return '-';
  }

  // Format the valid date
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};