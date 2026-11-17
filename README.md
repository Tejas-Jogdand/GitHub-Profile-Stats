# Readme Stat Generator 📊🔥

A TypeScript-powered GitHub statistics and contribution streak metrics engine designed for dynamic GitHub profile READMEs.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18.svg)](https://vitest.dev/)

---

## ✨ Features

- **🔥 Accurate Streak Calculation**:
  - Computes current streak and longest streak across multi-year contribution calendars.
  - Timezone-aware date normalization (accurate around midnight boundaries).
  - Grace period support for active streaks today and yesterday.
- **📈 Comprehensive Overview Metrics**:
  - Aggregates total stars across non-fork repositories.
  - Computes total commits, pull requests, issues, and contributed repositories.
- **💻 Programming Language Breakdown**:
  - Byte-accurate language distribution percentages.
  - Built-in GitHub language fallback palette.
  - Automatic grouping of remaining languages into "Other".
- **⚡ GraphQL API Fetcher**:
  - Efficient queries using GitHub's GraphQL v4 API.
  - Automatic cursor-based pagination for accounts with >100 repositories.
  - Multi-year chronological contribution collection.
- **🛡️ Enterprise Grade Reliability**:
  - Fully typed with TypeScript strict mode enabled.
  - 100% test pass rate with unit tests covering edge cases (leap years, pagination, rate limits).

---

## 📁 Project Structure

```text
Readme stat/
├── src/
│   ├── api/             # GraphQL queries, Octokit client & paginated fetcher
│   │   ├── client.ts
│   │   ├── fetcher.ts
│   │   └── queries.ts
│   ├── config/          # Environment variable loaders & layout constants
│   │   ├── constants.ts
│   │   └── env.ts
│   ├── metrics/         # Metrics computation engine
│   │   ├── languages.ts
│   │   ├── overview.ts
│   │   └── streak.ts
│   ├── types/           # Strongly-typed GraphQL & metrics definitions
│   │   ├── github.ts
│   │   └── metrics.ts
│   └── index.ts         # Main entry point and barrel export
├── tests/               # Vitest test suite and mock fixtures
│   ├── api/
│   ├── config/
│   ├── fixtures/
│   └── metrics/
├── .env.example         # Template for environment configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **GitHub Personal Access Token**:
  - Public stats: `read:user`
  - Private repo & contribution stats: `repo` + `read:user`

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Readme stat"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and provide your GitHub Personal Access Token (`GITHUB_TOKEN`).

---

## ⚙️ Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `GITHUB_TOKEN` | **Yes** | — | Personal Access Token (`ghp_...`) |
| `GITHUB_USERNAME` | No | Token Owner | GitHub username to generate stats for |
| `OUTPUT_DIR` | No | `./generated` | Target directory for generated cards |
| `FETCH_MULTI_YEAR` | No | `true` | Query all years since account creation |
| `CARD_THEME` | No | `github-dark` | Visual theme (`github-dark`, `dracula`, etc.) |
| `TIMEZONE` | No | `UTC` | Timezone (e.g. `UTC`, `America/New_York`, `Asia/Kolkata`) |
| `MAX_LANGUAGES` | No | `5` | Maximum number of top languages to display |

---

## 🛠️ Available Scripts

- **`npm run dev`**: Execute the CLI runner in development mode using `tsx`.
- **`npm run build`**: Compile TypeScript source files to `./dist`.
- **`npm start`**: Run the compiled application from `./dist/index.js`.
- **`npm test`**: Run test suite via Vitest.
- **`npm run test:watch`**: Run tests in interactive watch mode.

---

## 🧪 Testing

```bash
npm test
```

Unit tests cover:
- Authenticated viewer resolution vs explicit login.
- Paginated repository retrieval.
- Multi-year contribution retrieval.
- Timezone shift and leap-year streak calculations.
- Byte distribution calculation and language fallback colors.
- Environment loading and configuration validation.

---

## 🗺️ Roadmap

- [x] GitHub GraphQL API fetcher with pagination
- [x] Multi-year contribution and streak calculation engine
- [x] Language byte calculation and overview metrics
- [x] Full unit test coverage & TypeScript strict mode
- [ ] SVG card renderers (Overview, Streak, Languages)
- [ ] Theme system (github-dark, tokyo-night, dracula, minimal-light)
- [ ] GitHub Actions workflow for scheduled automated README updates

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
