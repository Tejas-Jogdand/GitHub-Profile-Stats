import { ContributionsCollection } from '../types/github.js';
import { StreakStats } from '../types/metrics.js';

export interface StreakCalculationOptions {
  referenceDate?: string | Date; // Useful for deterministic testing or timezone override
  timezone?: string;
}

/**
 * Returns YYYY-MM-DD formatted date string in the given timezone (or UTC).
 */
export function formatDateInTimezone(date: Date, timezone = 'UTC'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Adds or subtracts days from a YYYY-MM-DD date string.
 */
export function shiftDate(dateStr: string, daysDelta: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + daysDelta);
  return d.toISOString().slice(0, 10);
}

/**
 * Calculates contribution streak statistics from one or more contributions collections.
 */
export function calculateStreak(
  primaryCollection: ContributionsCollection,
  historicalCollections: ContributionsCollection[] = [],
  options: StreakCalculationOptions = {}
): StreakStats {
  const dayMap = new Map<string, number>();

  const allCollections = [...historicalCollections, primaryCollection];

  // Aggregate all contribution days across collections, deduplicating by date
  for (const collection of allCollections) {
    const weeks = collection.contributionCalendar?.weeks || [];
    for (const week of weeks) {
      for (const day of week.contributionDays || []) {
        if (!day.date) continue;
        const currentCount = dayMap.get(day.date) || 0;
        dayMap.set(day.date, Math.max(currentCount, day.contributionCount || 0));
      }
    }
  }

  const sortedDates = Array.from(dayMap.keys()).sort();

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalContributions: 0,
      firstContributionDate: null,
      latestContributionDate: null,
      isStreakActiveToday: false,
    };
  }

  const firstContributionDate = sortedDates[0];
  const latestContributionDate = sortedDates[sortedDates.length - 1];

  let totalContributions = 0;
  for (const count of dayMap.values()) {
    totalContributions += count;
  }

  // Calculate Longest Streak
  let longestStreak = 0;
  let tempStreak = 0;
  let previousDate: string | null = null;

  for (const date of sortedDates) {
    const count = dayMap.get(date) || 0;

    if (count > 0) {
      if (previousDate && shiftDate(previousDate, 1) === date) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }

    previousDate = date;
  }

  // Determine reference 'today' date
  let todayStr: string;
  if (options.referenceDate) {
    todayStr = typeof options.referenceDate === 'string'
      ? options.referenceDate.slice(0, 10)
      : formatDateInTimezone(options.referenceDate, options.timezone);
  } else {
    todayStr = formatDateInTimezone(new Date(), options.timezone);
  }

  const todayCount = dayMap.get(todayStr) || 0;
  const isStreakActiveToday = todayCount > 0;

  // Calculate Current Streak
  let currentStreak = 0;
  let cursorDate = todayStr;

  if (isStreakActiveToday) {
    // Walk backwards starting today
    while ((dayMap.get(cursorDate) || 0) > 0) {
      currentStreak++;
      cursorDate = shiftDate(cursorDate, -1);
    }
  } else {
    // Check yesterday (grace period: streak is not broken until the day ends)
    const yesterdayStr = shiftDate(todayStr, -1);
    if ((dayMap.get(yesterdayStr) || 0) > 0) {
      cursorDate = yesterdayStr;
      while ((dayMap.get(cursorDate) || 0) > 0) {
        currentStreak++;
        cursorDate = shiftDate(cursorDate, -1);
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalContributions,
    firstContributionDate,
    latestContributionDate,
    isStreakActiveToday,
  };
}
