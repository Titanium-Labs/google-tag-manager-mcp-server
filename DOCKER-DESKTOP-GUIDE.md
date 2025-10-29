# Launching in Docker Desktop

This guide shows you how to run the Google Tag Manager MCP Server in Docker Desktop.

## Step 1: Get Your Google OAuth Access Token

Before running the container, you need a Google OAuth access token:

1. Visit [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon ⚙️ in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Google Client ID and Client Secret
5. Select these Tag Manager API scopes:
   - `https://www.googleapis.com/auth/tagmanager.manage.accounts`
   - `https://www.googleapis.com/auth/tagmanager.edit.containers`
   - `https://www.googleapis.com/auth/tagmanager.delete.containers`
   - `https://www.googleapis.com/auth/tagmanager.edit.containerversions`
   - `https://www.googleapis.com/auth/tagmanager.manage.users`
   - `https://www.googleapis.com/auth/tagmanager.publish`
   - `https://www.googleapis.com/auth/tagmanager.readonly`
6. Click "Authorize APIs" and complete the OAuth flow
7. Click "Exchange authorization code for tokens"
8. Copy the **Access Token**

## Step 2: Create Environment File

In the project root directory, create a `.env` file:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your access token:

```env
GOOGLE_ACCESS_TOKEN=your_actual_access_token_here
USER_ID=my-user-id
USER_NAME=My Name
USER_EMAIL=myemail@example.com
CLIENT_ID=my-client
```

## Step 3: Build the Docker Image

Open Docker Desktop, then run:

```bash
npm run docker:build
```

Or use docker-compose directly:

```bash
docker-compose build
```

This will create a Docker image named `gtm-mcp-server:latest`.

## Step 4: Launch in Docker Desktop

### Option A: Using npm scripts (recommended)

Start the container in detached mode:
```bash
npm run docker:up
```

View logs:
```bash
npm run docker:logs
```

Stop the container:
```bash
npm run docker:down
```

### Option B: Using Docker Desktop GUI

1. Open **Docker Desktop**
2. Go to **Images** tab
3. Find `gtm-mcp-server:latest`
4. Click the **▶ Run** button
5. Expand **Optional settings**
6. Under **Environment variables**, click **Add variable** for each:
   - `GOOGLE_ACCESS_TOKEN` = your token
   - `USER_ID` = your user ID
   - `USER_NAME` = your name
   - `USER_EMAIL` = your email
7. Click **Run**
8. The container will appear in the **Containers** tab

### Option C: Using docker-compose in Docker Desktop

1. Open **Docker Desktop**
2. Ensure your `.env` file is configured (Step 2)
3. From the terminal, run: `docker-compose up -d`
4. Or use the Docker Desktop Extensions if you have Docker Compose UI installed

## Step 5: Verify Container is Running

### Check in Docker Desktop
1. Go to **Containers** tab
2. Look for `google-tag-manager-mcp-server`
3. Status should be **Running**
4. Click on the container to view logs

### Check via command line
```bash
docker ps | grep gtm-mcp-server
```

You should see output like:
```
CONTAINER ID   IMAGE                     COMMAND                  CREATED         STATUS         PORTS
abc123def456   gtm-mcp-server:latest     "tsx src/stdio-serve…"   2 minutes ago   Up 2 minutes
```

## Step 6: View Container Logs

### In Docker Desktop
1. Go to **Containers** tab
2. Click on `google-tag-manager-mcp-server`
3. View the **Logs** tab

You should see:
```
Starting Google Tag Manager MCP Server (stdio)
Tools registered successfully
MCP Server connected via stdio transport
```

### Via command line
```bash
npm run docker:logs
# or
docker-compose logs -f
```

## Using with Claude Desktop

To connect this Docker container to Claude Desktop:

1. Edit Claude Desktop config:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add this configuration:

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

**Important**: Replace `/absolute/path/to/your/.env` with the full path to your `.env` file.

3. Restart Claude Desktop
4. The GTM tools should now be available

## Troubleshooting

### Container exits immediately
- Check logs: `npm run docker:logs`
- Verify `.env` file exists and has `GOOGLE_ACCESS_TOKEN`
- Ensure access token is valid (not expired)

### "GOOGLE_ACCESS_TOKEN environment variable is required"
- Create `.env` file from `.env.example`
- Add your access token to the `.env` file
- Rebuild: `npm run docker:rebuild`

### Access token expired
Google access tokens expire after ~1 hour. To fix:
1. Get a new token from OAuth Playground (Step 1)
2. Update `.env` file
3. Restart: `npm run docker:restart`

### Can't find the image
- Run `docker images | grep gtm-mcp-server`
- If missing, rebuild: `npm run docker:build`

## Useful Commands

```bash
# Build image
npm run docker:build

# Start container (detached)
npm run docker:up

# Stop container
npm run docker:down

# View logs (follow mode)
npm run docker:logs

# Restart container
npm run docker:restart

# Rebuild and restart
npm run docker:rebuild

# Remove all Docker resources
docker-compose down --rmi all --volumes
```

## What's Running?

The Docker container runs:
- **Node.js 20** (slim variant)
- **tsx** - TypeScript executor that runs `src/stdio-server.ts` directly
- **MCP Server** via stdio transport
- **All GTM tools** connected to Google Tag Manager API

The server loads your Google access token from environment variables and registers all available Tag Manager tools for use with MCP clients like Claude Desktop.
