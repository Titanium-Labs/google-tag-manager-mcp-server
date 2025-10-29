# Docker Setup for Google Tag Manager MCP Server

This guide explains how to run the Google Tag Manager MCP Server in Docker.

## Prerequisites

- Docker Desktop installed and running
- Google OAuth Access Token (see instructions below)

## Getting a Google OAuth Access Token

To use this MCP server, you need a Google OAuth access token with Tag Manager permissions:

1. Go to the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (⚙️) in the upper right
3. Check "Use your own OAuth credentials"
4. Enter your Google OAuth Client ID and Client Secret
5. In **Step 1**, scroll down and select the following Tag Manager scopes:
   - `https://www.googleapis.com/auth/tagmanager.manage.accounts`
   - `https://www.googleapis.com/auth/tagmanager.edit.containers`
   - `https://www.googleapis.com/auth/tagmanager.delete.containers`
   - `https://www.googleapis.com/auth/tagmanager.edit.containerversions`
   - `https://www.googleapis.com/auth/tagmanager.manage.users`
   - `https://www.googleapis.com/auth/tagmanager.publish`
   - `https://www.googleapis.com/auth/tagmanager.readonly`
6. Click "Authorize APIs"
7. Complete the OAuth flow
8. In **Step 2**, click "Exchange authorization code for tokens"
9. Copy the **Access Token** - this is your `GOOGLE_ACCESS_TOKEN`

## Quick Start

### 1. Create Environment File

Copy the example environment file and add your Google access token:

```bash
cp .env.example .env
```

Edit `.env` and add your access token:

```env
GOOGLE_ACCESS_TOKEN=your_actual_access_token_here
USER_ID=my-user
USER_NAME=My Name
USER_EMAIL=myemail@example.com
CLIENT_ID=my-client
```

### 2. Build the Docker Image

```bash
npm run docker:build
# or
docker-compose build
```

### 3. Run the Container

```bash
npm run docker:up
# or
docker-compose up -d
```

### 4. View Logs

```bash
npm run docker:logs
# or
docker-compose logs -f
```

### 5. Stop the Container

```bash
npm run docker:down
# or
docker-compose down
```

## Using with Claude Desktop

To use this Docker-based MCP server with Claude Desktop, you'll need to configure it to run the Docker container.

Add this to your Claude Desktop MCP configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "gtm-docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--env-file",
        "/absolute/path/to/your/.env",
        "gtm-mcp-server:latest"
      ]
    }
  }
}
```

**Important**: Replace `/absolute/path/to/your/.env` with the actual absolute path to your `.env` file.

## Available Docker Commands

All commands are available as npm scripts:

- `npm run docker:build` - Build the Docker image
- `npm run docker:up` - Start the container in detached mode
- `npm run docker:down` - Stop and remove the container
- `npm run docker:logs` - View container logs (follow mode)
- `npm run docker:restart` - Restart the container
- `npm run docker:rebuild` - Rebuild and restart (useful after code changes)

## Local Development

For local development without Docker, you can run the stdio server directly:

```bash
# Create .env file with your credentials
cp .env.example .env

# Build the TypeScript
npm run build

# Run the stdio server
npm run start:stdio
```

## Troubleshooting

### Container won't start

Check the logs:
```bash
docker-compose logs
```

Common issues:
- Missing or invalid `GOOGLE_ACCESS_TOKEN` in `.env`
- Access token expired (get a new one from OAuth Playground)

### Access token expired

Google OAuth access tokens typically expire after 1 hour. If you get authentication errors:

1. Generate a new access token using the OAuth Playground steps above
2. Update your `.env` file
3. Restart the container: `npm run docker:restart`

### Claude Desktop can't connect

- Ensure the Docker container is running: `docker ps`
- Check the `.env` file path in your Claude Desktop config is absolute, not relative
- Verify the access token is valid
- Check container logs for errors: `npm run docker:logs`

## Architecture Notes

This Docker setup runs the MCP server in **stdio mode** rather than as a Cloudflare Worker:

- Uses stdio transport for local MCP connections
- Requires pre-configured Google OAuth access token (no OAuth flow in container)
- Suitable for local development and testing
- For production use, consider the hosted Cloudflare Worker version at `https://gtm-mcp.stape.ai/mcp`
