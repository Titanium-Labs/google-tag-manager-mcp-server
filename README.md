# MCP Server for Google Tag Manager
[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/stape-io/google-tag-manager-mcp-server)](https://archestra.ai/mcp-catalog/stape-io__google-tag-manager-mcp-server)

This is a server that supports remote MCP connections, with Google OAuth built-in and provides an interface to the Google Tag Manager API.


## Access Options

### Option 1: Remote MCP Server (Recommended for Production)

Open Claude Desktop and navigate to Settings -> Developer -> Edit Config. This opens the configuration file that controls which MCP servers Claude can access.

Replace the content with the following configuration. Once you restart Claude Desktop, a browser window will open showing your OAuth login page. Complete the authentication flow to grant Claude access to your MCP server. After you grant access, the tools will become available for you to use.

```json
{
  "mcpServers": {
    "gtm-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://gtm-mcp.stape.ai/mcp"
      ]
    }
  }
}
```

### Option 2: Docker (Local Development)

Run the MCP server locally using Docker. This is great for development and testing.

**Quick Start:**
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add your Google OAuth access token to .env
# See DOCKER-DESKTOP-GUIDE.md for how to get a token

# 3. Build and run
npm run docker:build
npm run docker:up

# 4. View logs
npm run docker:logs
```

For detailed Docker setup instructions, including how to:
- Get a Google OAuth access token
- Launch in Docker Desktop GUI
- Use with Claude Desktop
- Troubleshoot common issues

**See [DOCKER-DESKTOP-GUIDE.md](DOCKER-DESKTOP-GUIDE.md)**

### Troubleshooting

**MCP Server Name Length Limit**

Some MCP clients (like Cursor AI) have a 60-character limit for the combined MCP server name + tool name length. If you use a longer server name in your configuration (e.g., `gtm-mcp-server-your-additional-long-name`), some tools may be filtered out.

To avoid this issue:
- Use shorter server names in your MCP configuration (e.g., `gtm-mcp-server`)

**Clearing MCP Cache**

[mcp-remote](https://github.com/geelen/mcp-remote#readme) stores all the credential information inside ~/.mcp-auth (or wherever your MCP_REMOTE_CONFIG_DIR points to). If you're having persistent issues, try running:
You can run rm -rf ~/.mcp-auth to clear any locally stored state and tokens.
```
rm -rf ~/.mcp-auth
```
Then restarting your MCP client.
