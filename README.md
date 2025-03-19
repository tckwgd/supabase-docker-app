# Supabase Docker App

A web application that connects to a self-hosted Supabase instance using Docker. This application includes:

- Next.js with TypeScript
- Supabase authentication (login/register)
- CRUD operations with Supabase database
- Docker containerization for easy deployment
- TailwindCSS for styling

## Features

- User authentication (register, login, logout)
- User profile management
- Todo list management (create, read, update, delete)
- Fully responsive design

## Prerequisites

- Docker and Docker Compose
- A running Supabase instance (the app is configured to connect to `test-supabase-7dba38-34-55-223-67.traefik.me`)

## Getting Started

### Running with Docker (Recommended)

1. Clone the repository
   ```bash
   git clone https://github.com/tckwgd/supabase-docker-app.git
   cd supabase-docker-app
   ```

2. Build and start the Docker container
   ```bash
   docker-compose up -d
   ```

3. The application will be available at http://localhost:3000

### Running Locally without Docker

1. Clone the repository
   ```bash
   git clone https://github.com/tckwgd/supabase-docker-app.git
   cd supabase-docker-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on the example
   ```bash
   cp .env.local.example .env.local
   ```
   Update the Supabase URL and keys if necessary.

4. Run the development server
   ```bash
   npm run dev
   ```

5. The application will be available at http://localhost:3000

## Database Schema

This application uses the following database schema:

### Todos Table
```sql
CREATE TABLE public.todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Connecting to Your Own Supabase Instance

To connect this application to your own self-hosted Supabase instance, update the following environment variables:

1. In `.env.local` (for local development):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.com
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. In `docker-compose.yml` (for Docker deployment):
   ```yaml
   environment:
     - NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.com
     - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Setting Up the Database

1. Connect to your Supabase instance's SQL editor
2. Run the SQL script in `supabase/migrations/20250319_init.sql` to create the necessary tables and set up Row Level Security

## Project Structure

```
supabase-docker-app/
├── src/                     # Source code
│   ├── app/                 # Next.js app router pages
│   │   ├── dashboard/       # Dashboard page
│   │   ├── login/           # Login page
│   │   ├── profile/         # User profile page
│   │   ├── register/        # Registration page
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable components
│   │   └── NavBar.tsx       # Navigation bar component
│   └── lib/                 # Utilities and helpers
│       └── supabase.ts      # Supabase client
├── supabase/                # Supabase-related files
│   └── migrations/          # Database migration scripts
├── .env.local.example       # Example environment variables
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker configuration
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Environmental Variables

- `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for client-side access
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key for server-side access

## License

MIT
