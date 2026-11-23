/**
 * GraphQL queries for GitHub API interactions
 */

export const GET_VIEWER_LOGIN = `
  query getViewerLogin {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    viewer {
      login
    }
  }
`;

export const GET_USER_PROFILE = `
  query getUserProfile($login: String!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    user(login: $login) {
      login
      name
      createdAt
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoryContributions
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
      repositoriesContributedTo(
        contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
      ) {
        totalCount
      }
      repositories(
        first: 100
        ownerAffiliations: [OWNER]
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          stargazerCount
          isFork
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_MORE_REPOSITORIES = `
  query getMoreRepositories($login: String!, $after: String!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    user(login: $login) {
      repositories(
        first: 100
        after: $after
        ownerAffiliations: [OWNER]
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          stargazerCount
          isFork
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_YEARLY_CONTRIBUTIONS = `
  query getYearlyContributions($login: String!, $from: DateTime!, $to: DateTime!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoryContributions
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;
