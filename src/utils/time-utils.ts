/**
 * Convert milliseconds to human-readable duration format
 * @param ms - Time in milliseconds
 * @returns Human-readable string (e.g., "24 hours", "2 days", "30 minutes")
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? '1 day' : `${days} days`;
  }

  if (hours > 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  if (minutes > 0) {
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  return seconds === 1 ? '1 second' : `${seconds} seconds`;
};
