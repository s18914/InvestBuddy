# InvestBuddy

Investment portfolio management platform for beginner investors. Master's thesis project.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js v20.18.0 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `supabase_schema.sql` in your Supabase SQL editor
3. Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   ├── assetForms/     # Asset-specific forms
│   ├── onboarding/     # Onboarding flow steps
│   └── questionnaire/  # MiFID questionnaire components
├── contexts/           # React Context providers (Auth, TestMode)
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── repositories/       # Data access layer (Repository Pattern)
│   ├── BaseRepository.ts
│   ├── AssetRepository.ts
│   ├── AssetDetailsRepository.ts
│   ├── SnapshotRepository.ts
│   └── ValuationRepository.ts
├── services/           # Business logic layer
├── types/              # TypeScript type definitions
├── lib/                # External library configurations
├── constants.ts        # Centralized configuration and constants
└── App.tsx             # Main application component
```

## Features

### Core Functionality

- Portfolio tracking and visualization
- MiFID investor profiling
- Target portfolio vs actual comparison
- Monthly portfolio updates
- Transaction history

### Asset Types

- Bonds (Obligacje)
- Deposits (Lokaty)
- Savings Accounts (Konta oszczędnościowe)
- Investment Funds (Fundusze inwestycyjne)
- Retirement Accounts (IKE/IKZE)
- Employee Capital Plans (PPK)
- Gold (Złoto)
- Currencies (Waluty)
- Cash (Gotówka)
- Custom assets

### Special Features

- Deposit maturity alerts
- IKE/IKZE annual contribution calculator
- Cash excess warnings
- Portfolio deviation monitoring

## Architecture

### Repository Pattern

Clean separation of data access logic:

- **BaseRepository**: Generic CRUD operations
- **AssetRepository**: Asset-specific queries
- **AssetDetailsRepository**: Asset details management
- **SnapshotRepository**: Portfolio snapshots
- **ValuationRepository**: Historical valuations

### Service Layer

Business logic abstraction:

- `assetDetailsService.ts` - Asset details operations
- `questionnaireService.ts` - MiFID questionnaire logic
- `userResetService.ts` - User data management

### Constants & Configuration

Centralized in `constants.ts`:

- Retirement limits (IKE/IKZE) with dynamic year support
- Bond types, deposit durations, fund categories
- Currency lists and asset colors
- Helper functions for category management

## Development

Built with modern best practices:

- TypeScript for type safety
- Repository Pattern for data access
- ESLint for code quality
- Vite for fast development
- Component-based architecture
- Custom React hooks for state management

## License

ISC
