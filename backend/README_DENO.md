# Deno Backend

This project has been converted to use Deno instead of Node.js.

## Prerequisites

- Install Deno: https://deno.land/manual/getting_started/installation
- MongoDB running locally or connection string ready

## Running the Project

### Development Mode
```bash
deno task dev
```

### Production Mode
```bash
deno task start
```

### Manual Run with Permissions
```bash
deno run --allow-net --allow-read --allow-env src/server.ts
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)

## Dependencies

Dependencies are managed through `deno.json` imports map:
- Express via npm
- CORS via npm  
- Mongoose via npm
- Dotenv from Deno standard library

## Key Changes from Node.js

1. No `package.json` dependencies - using `deno.json` imports
2. Using Deno's built-in TypeScript support
3. Explicit file extensions in imports (`.ts`)
4. Deno standard library for dotenv
5. Using `Deno.env` for environment variables
6. Requires explicit permissions (`--allow-net`, `--allow-read`, `--allow-env`)
