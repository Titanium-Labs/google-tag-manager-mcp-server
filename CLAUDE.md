# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server for Google Tag Manager that runs as a Cloudflare Worker. It provides remote MCP connections with Google OAuth authentication and exposes the Google Tag Manager API through MCP tools.

**Key Technologies:**
- Cloudflare Workers with Durable Objects
- MCP SDK (@modelcontextprotocol/sdk)
- Google APIs (googleapis, google-auth-library)
- TypeScript
- Hono (web framework)
- Zod (schema validation)

## Development Commands

### Build and Development
```bash
npm run build          # Compile TypeScript to dist/
npm run dev            # Start local development server (port 8788)
npm start              # Alias for dev
npm run start:stdio    # Run stdio server locally (requires .env with GOOGLE_ACCESS_TOKEN)
npm run deploy         # Deploy to Cloudflare Workers
```

### Docker Commands
```bash
npm run docker:build   # Build Docker image
npm run docker:up      # Start container in detached mode
npm run docker:down    # Stop and remove container
npm run docker:logs    # View container logs
npm run docker:restart # Restart container
npm run docker:rebuild # Rebuild and restart container
```

### Code Quality
```bash
npm run lint           # Run ESLint on src/
npm run lint:fix       # Auto-fix linting issues
```

### Type Generation
```bash
npm run cf-typegen     # Generate Cloudflare Workers types
```

## Architecture

### Core Server Structure

The server extends `McpAgent` from the `agents` package and implements a Durable Object pattern:

1. **Entry Point** (`src/index.ts`): Exports an `OAuthProvider` that handles OAuth flow and routes to either SSE or standard MCP endpoints
2. **Main Class** (`GoogleTagManagerMCPServer`): Durable Object that extends `McpAgent` and registers all GTM tools
3. **OAuth Flow** (`src/utils/apisHandler.ts`): Hono app handling `/authorize`, `/callback`, `/remove`, and static pages

### Tool Registration Pattern

Each tool module in `src/tools/` exports a registration function that:
- Takes an `McpServer` instance and `McpAgentToolParamsModel` containing user props
- Calls `server.tool()` with name, description, Zod schema, and async handler
- Uses action-based routing (e.g., "get", "list", "create", "update", "delete")

Example tool structure:
```typescript
export const accountActions = (
  server: McpServer,
  { props }: McpAgentToolParamsModel,
): void => {
  server.tool(
    "gtm_account",
    "Performs all account-related operations...",
    {
      action: z.enum(["get", "list", "update"]),
      accountId: z.string(),
      config: PayloadSchema.optional(),
    },
    async ({ action, accountId, config }) => {
      const tagmanager = await getTagManagerClient(props.accessToken);
      // Handle action...
    },
  );
};
```

### Available Tool Categories

All tools follow the same pattern and are located in `src/tools/`:
- **accountActions**: Account management (get, list, update)
- **containerActions**: Container operations (get, list, create, update, delete)
- **workspaceActions**: Workspace management
- **versionActions**: Version control (get, list, create, update, delete, publish, undelete)
- **versionHeaderActions**: Version header operations
- **tagActions**: Tag management
- **triggerActions**: Trigger configuration
- **variableActions**: Variable management
- **builtInVariableActions**: Built-in variable operations
- **folderActions**: Folder organization
- **environmentActions**: Environment management
- **clientActions**: Client-side container operations
- **destinationActions**: Server-side destination management
- **gtagConfigActions**: Google tag configuration
- **templateActions**: Custom template operations
- **transformationActions**: Server-side transformation management
- **userPermissionActions**: User permission management
- **zoneActions**: Zone boundary management
- **removeMCPServerData**: Session cleanup tool

### Schema Pattern

Zod schemas in `src/schemas/` mirror GTM API resources and are used for:
- Tool input validation
- Omitting/picking specific fields for different operations
- Type safety throughout the codebase

### Google API Client

`src/utils/getTagManagerClient.ts` creates authenticated Google Tag Manager API clients using the user's OAuth access token stored in props.

### Environment Configuration

Environment variables (defined in `global.d.ts`):
- `OAUTH_KV`: KV namespace for OAuth state
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `COOKIE_ENCRYPTION_KEY`: Cookie encryption key
- `HOSTED_DOMAIN`: Optional Google Workspace domain restriction
- `WORKER_HOST`: Worker URL
- `MCP_OBJECT`: Durable Object binding

## Cloudflare Worker Specifics

### Durable Objects
The main `GoogleTagManagerMCPServer` class is a Durable Object that maintains stateful MCP connections per user session.

### KV Storage
OAuth tokens and state are stored in Cloudflare KV (`OAUTH_KV` binding).

### Custom Domain
Configured to run on `gtm-mcp.stape.ai` (see `wrangler.jsonc`).

### Compatibility
- Uses `nodejs_compat` flag for Node.js APIs
- Compatibility date: 2025-03-10
- Dev server runs on port 8788

## OAuth Flow

1. User connects MCP client → client redirects to `/authorize`
2. Server checks if client already approved via cookie
3. If not approved, shows approval dialog → redirects to Google OAuth
4. Google redirects to `/callback` with authorization code
5. Server exchanges code for access token, fetches user info
6. `completeAuthorization` stores tokens and creates user session
7. MCP connection established with user's GTM access

Google OAuth scopes requested:
- email, profile
- tagmanager.manage.accounts
- tagmanager.edit.containers
- tagmanager.delete.containers
- tagmanager.edit.containerversions
- tagmanager.manage.users
- tagmanager.publish
- tagmanager.readonly

## Error Handling

`src/utils/createErrorResponse.ts` provides standardized error responses for all tools.

## Pagination

Two utility modules handle API pagination:
- `src/utils/paginationUtils.ts`: Generic pagination
- `src/utils/versionPaginationUtils.ts`: Version-specific pagination

## Docker Deployment

The server can run in Docker using a stdio-based transport instead of Cloudflare Workers. Key differences:

### Dual Architecture
1. **Cloudflare Worker** (production): Uses Durable Objects, OAuth flow, remote connections
2. **Docker/stdio** (local): Uses stdio transport, pre-configured access token, local connections

### Entry Points
- `src/index.ts`: Cloudflare Worker entry point with OAuthProvider and Durable Objects
- `src/stdio-server.ts`: Stdio server for Docker, loads access token from environment

### Environment Variables for Docker
Located in `.env` file (see `.env.example`):
- `GOOGLE_ACCESS_TOKEN`: Required - OAuth access token from Google
- `USER_ID`, `USER_NAME`, `USER_EMAIL`, `CLIENT_ID`: Optional identification

### Docker Files
- `Dockerfile`: Multi-stage build, installs deps, builds TypeScript, runs stdio server
- `docker-compose.yml`: Simplified container orchestration
- `.dockerignore`: Excludes node_modules, dist, .git, .env from image
- `DOCKER.md`: Comprehensive Docker setup guide

See `DOCKER.md` for detailed Docker setup instructions including how to obtain a Google OAuth access token.

## Recent Changes

- Added Docker support with stdio-based MCP server
- Migrated to streamable HTTP for improved MCP connection handling
- Added pagination support for version listings
- Migrated to new Cloudflare account infrastructure
