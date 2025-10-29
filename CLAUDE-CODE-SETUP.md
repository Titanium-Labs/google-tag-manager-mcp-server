# Using Google Tag Manager MCP Server with Claude Code

This guide shows you how to connect the Docker-based GTM MCP server to Claude Code.

## Overview

Claude Code can connect to MCP servers running in Docker containers via stdio transport. This allows you to use all Google Tag Manager tools directly from Claude Code.

## Prerequisites

1. Docker Desktop installed and running
2. Google OAuth access token (see below)
3. Claude Code installed

## Step 1: Get Google OAuth Access Token

1. Visit [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon ⚙️ → Check "Use your own OAuth credentials"
3. Enter your Google Client ID and Client Secret
4. Select these Tag Manager API v2 scopes:
   - `https://www.googleapis.com/auth/tagmanager.manage.accounts`
   - `https://www.googleapis.com/auth/tagmanager.edit.containers`
   - `https://www.googleapis.com/auth/tagmanager.delete.containers`
   - `https://www.googleapis.com/auth/tagmanager.edit.containerversions`
   - `https://www.googleapis.com/auth/tagmanager.manage.users`
   - `https://www.googleapis.com/auth/tagmanager.publish`
   - `https://www.googleapis.com/auth/tagmanager.readonly`
5. Click "Authorize APIs" → Complete OAuth flow
6. Click "Exchange authorization code for tokens"
7. Copy the **Access Token**

## Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your access token:

```env
GOOGLE_ACCESS_TOKEN=ya29.a0AfB_byD... # Your actual token here
USER_ID=my-user-id
USER_NAME=My Name
USER_EMAIL=myemail@example.com
CLIENT_ID=claude-code-client
```

## Step 3: Build Docker Image

```bash
npm run docker:build
```

## Step 4: Configure Claude Code

Claude Code needs to be configured to use the Docker container as an MCP server.

### Option A: Using MCP Settings File

Create or edit your MCP settings file at `~/.config/claude-code/mcp_settings.json` (Linux/macOS) or `%APPDATA%\claude-code\mcp_settings.json` (Windows):

```json
{
  "mcpServers": {
    "google-tag-manager": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--env-file",
        "/absolute/path/to/google-tag-manager-mcp-server/.env",
        "gtm-mcp-server:latest"
      ]
    }
  }
}
```

**Important:** Replace `/absolute/path/to/google-tag-manager-mcp-server/.env` with the actual absolute path to your `.env` file.

Example paths:
- Linux/macOS: `/home/username/projects/google-tag-manager-mcp-server/.env`
- Windows (WSL): `/mnt/c/Users/username/projects/google-tag-manager-mcp-server/.env`
- Windows: `C:\Users\username\projects\google-tag-manager-mcp-server\.env`

### Option B: Using Project-Level Configuration

If you want to use this MCP server only for specific projects, you can add the configuration to your project's `.claude/mcp_settings.json`:

```bash
mkdir -p .claude
cat > .claude/mcp_settings.json << 'EOF'
{
  "mcpServers": {
    "google-tag-manager": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--env-file",
        ".env",
        "gtm-mcp-server:latest"
      ],
      "cwd": "${workspaceFolder}"
    }
  }
}
EOF
```

This uses relative paths from the project directory.

## Step 5: Verify Connection

Start Claude Code in a new terminal session and check if the MCP server is connected:

```bash
# List available MCP servers
claude mcp list

# Or check available tools
claude mcp tools
```

You should see the Google Tag Manager server listed with all available tools like:
- `gtm_account`
- `gtm_container`
- `gtm_workspace`
- `gtm_tag`
- `gtm_trigger`
- `gtm_variable`
- etc.

## Step 6: Use GTM Tools in Claude Code

Now you can use Google Tag Manager tools directly in your Claude Code conversations!

Example prompts:
- "List all my GTM accounts"
- "Show me the containers in account 123456"
- "Get the tags from workspace 7 in container 789"
- "Create a new tag in my GTM container"

## Alternative: Direct Docker Run (Without Background Container)

If you don't want to use a persistent container, Claude Code will start a new container for each session when using the Docker command configuration above. This is the recommended approach as it:
- Starts fresh each time
- Automatically cleans up with `--rm`
- Uses the latest `.env` configuration

## Troubleshooting

### "Cannot connect to MCP server"

**Check Docker is running:**
```bash
docker ps
```

**Verify image exists:**
```bash
docker images | grep gtm-mcp-server
```

If not found, rebuild:
```bash
npm run docker:build
```

### "GOOGLE_ACCESS_TOKEN environment variable is required"

**Verify .env file exists:**
```bash
cat .env | grep GOOGLE_ACCESS_TOKEN
```

**Check the path in MCP settings:**
- Must be absolute path (starts with `/` on Unix or `C:\` on Windows)
- No `~` shortcuts
- No relative paths (unless using `cwd` option)

### Access Token Expired

Google OAuth tokens expire after ~1 hour. To fix:

1. Get a new token from OAuth Playground (Step 1)
2. Update `.env` file
3. No need to rebuild - Docker will use new `.env` on next run

### Tools not showing up

**Restart Claude Code:**
```bash
# Exit Claude Code and restart
claude code
```

**Check logs:**
```bash
# Run Docker container manually to see logs
docker run --rm -i --env-file .env gtm-mcp-server:latest
```

You should see:
```
Starting Google Tag Manager MCP Server (stdio)
Tools registered successfully
MCP Server connected via stdio transport
```

### Path issues on Windows/WSL

If using WSL (Windows Subsystem for Linux), paths need special attention:

**WSL path to Windows file:**
```
/mnt/c/Users/YourName/Projects/google-tag-manager-mcp-server/.env
```

**Windows path:**
```
C:\Users\YourName\Projects\google-tag-manager-mcp-server\.env
```

Use the appropriate format based on where Claude Code is running.

## Testing the Connection

You can test the MCP server manually:

```bash
# Run container interactively
docker run --rm -i --env-file .env gtm-mcp-server:latest
```

If it starts successfully, you'll see the startup messages and it will wait for MCP protocol messages on stdin.

Press `Ctrl+C` to exit.

## Available GTM Tools

Once connected, you'll have access to these tool categories:

- **Accounts**: Get, list, update GTM accounts
- **Containers**: Create, get, list, update, delete containers
- **Workspaces**: Manage GTM workspaces
- **Tags**: Create and manage tags
- **Triggers**: Create and manage triggers
- **Variables**: Create and manage variables
- **Versions**: Version control operations
- **Environments**: Environment management
- **Folders**: Organize tags/triggers/variables
- **Users**: Permission management
- **And more...**

Each tool supports multiple actions (get, list, create, update, delete) based on the resource type.

## Security Notes

- Your `.env` file contains sensitive access tokens
- Keep `.env` in `.gitignore` (already configured)
- Never commit `.env` to version control
- Rotate tokens regularly
- Use service accounts for production

## Next Steps

- Explore available tools: Ask Claude Code "What GTM tools are available?"
- Manage your tags: "Show me all tags in container X"
- Create automations: "Create a new pageview tag"
- Version control: "Create a new version of my container"

Happy automating with Google Tag Manager! 🚀
