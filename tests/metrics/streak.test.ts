import { describe, it, expect } from 'vitest';
import { calculateStreak, shiftDate, formatDateInTimezone } from '../../src/metrics/streak.js';
import userProfileFixture from '../fixtures/user-profile.json';
import historicalYearFixture from '../fixtures/historical-year.json';
import { ContributionsCollection } from '../../src/types/github.js';

describe('Streak Calculation Engine', () => {
  it('should calculate current streak when committed today', () => {
    const primary = userProfileFixture.user.contributionsCollection;

    // Fixture has contributions on 2026-11-11 through 2026-11-16 (6 consecutive days)
    const result = calculateStreak(primary, [], {
      referenceDate: '2026-11-16',
    });

    expect(result.isStreakActiveToday).toBe(true);
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('should maintain streak on grace period when not yet committed today but committed yesterday', () => {
    const primary = userProfileFixture.user.contributionsCollection;

    // Reference date 2026-11-17 (today is 17th, with 0 commits in fixture; yesterday 16th has 2 commits)
    const result = calculateStreak(primary, [], {
      referenceDate: '2026-11-17',
    });

    expect(result.isStreakActiveToday).toBe(false);
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('should reset current streak to 0 if both today and yesterday had zero contributions', () => {
    const primary = userProfileFixture.user.contributionsCollection;

    // Reference date 2026-11-18 (yesterday was 17th with 0, today is 18th with 0)
    const result = calculateStreak(primary, [], {
      referenceDate: '2026-11-18',
    });

    expect(result.isStreakActiveToday).toBe(false);
    expect(result.currentStreak).toBe(0);
    // Longest streak remains 6
    expect(result.longestStreak).toBe(6);
  });

  it('should calculate multi-year streaks across year boundaries', () => {
    // 2025 Dec 30, 31 have commits
    const historical: ContributionsCollection = {
      totalCommitContributions: 10,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
      totalRepositoryContributions: 0,
      contributionCalendar: {
        totalContributions: 10,
        weeks: [
          {
            contributionDays: [
              { date: '2025-12-30', contributionCount: 2, color: '#216e39' },
              { date: '2025-12-31', contributionCount: 3, color: '#216e39' },
            ],
          },
        ],
      },
    };

    // 2026 Jan 01, 02 have commits
    const primary: ContributionsCollection = {
      totalCommitContributions: 15,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
      totalRepositoryContributions: 0,
      contributionCalendar: {
        totalContributions: 15,
        weeks: [
          {
            contributionDays: [
              { date: '2026-01-01', contributionCount: 5, color: '#216e39' },
              { date: '2026-01-02', contributionCount: 4, color: '#216e39' },
            ],
          },
        ],
      },
    };

    const result = calculateStreak(primary, [historical], {
      referenceDate: '2026-01-02',
    });

    expect(result.currentStreak).toBe(4); // Dec 30, 31, Jan 1, 2
    expect(result.longestStreak).toBe(4);
    expect(result.totalContributions).toBe(14); // 2 + 3 + 5 + 4
  });

  it('should handle completely empty contribution calendars', () => {
    const emptyCollection: ContributionsCollection = {
      totalCommitContributions: 0,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
      totalRepositoryContributions: 0,
      contributionCalendar: { totalContributions: 0, weeks: [] },
    };

    const result = calculateStreak(emptyCollection, []);

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.totalContributions).toBe(0);
    expect(result.firstContributionDate).toBeNull();
    expect(result.isStreakActiveToday).toBe(false);
  });

  it('should correctly shift dates across leap years and month boundaries', () => {
    expect(shiftDate('2024-02-28', 1)).toBe('2024-02-29'); // Leap year 2024
    expect(shiftDate('2024-02-29', 1)).toBe('2024-03-01');
    expect(shiftDate('2024-01-01', -1)).toBe('2023-12-31');
  });
});
