# Quick Start Guide - Using GTM MCP Server with Claude Code

## ✅ What's Already Set Up

1. ✅ Docker image built: `gtm-mcp-server:latest`
2. ✅ Container running in Docker Desktop
3. ✅ MCP configuration created: `.claude/mcp_settings.json`
4. ✅ Environment file created: `.env` (with placeholder token)

## 🔑 Next Step: Add Your Google OAuth Token

### Get Your Token (5 minutes)

1. **Open OAuth Playground:**
   👉 https://developers.google.com/oauthplayground

2. **Configure OAuth:**
   - Click gear icon ⚙️
   - Check "Use your own OAuth credentials"
   - Enter your Client ID and Secret

3. **Select Scopes:**
   In the left sidebar, find "Tag Manager API v2" and select ALL scopes:
   - ✅ manage.accounts
   - ✅ edit.containers
   - ✅ delete.containers
   - ✅ edit.containerversions
   - ✅ manage.users
   - ✅ publish
   - ✅ readonly

4. **Authorize:**
   - Click "Authorize APIs"
   - Sign in with Google
   - Allow permissions

5. **Get Token:**
   - Click "Exchange authorization code for tokens"
   - Copy the **Access token** (starts with `ya29...`)

### Update Your .env File

```bash
# Open .env in your editor
nano .env
# or
code .env
```

Replace `your_google_access_token_here` with your actual token:

```env
GOOGLE_ACCESS_TOKEN=ya29.a0AfB_byD...your_actual_token_here...
USER_ID=my-user-id
USER_NAME=My Name
USER_EMAIL=myemail@example.com
CLIENT_ID=claude-code-client
```

Save the file.

### Restart the Container

```bash
npm run docker:restart
```

## 🚀 Using with Claude Code

Once you've added your token, the GTM MCP server is ready to use!

### Test the Connection

In a new Claude Code session, try:

```
Can you list the available MCP tools?
```

You should see GTM tools like:
- `gtm_account`
- `gtm_container`
- `gtm_workspace`
- `gtm_tag`
- `gtm_trigger`
- `gtm_variable`
- etc.

### Example Prompts

**List your accounts:**
```
List all my Google Tag Manager accounts
```

**Get containers:**
```
Show me the containers in account 123456
```

**Manage tags:**
```
Get all tags from container 789, workspace 5
```

**Create resources:**
```
Create a new pageview tag in my GTM container
```

## 📁 Important Files

- **`.env`** - Your OAuth token (NEVER commit this!)
- **`.claude/mcp_settings.json`** - MCP configuration for Claude Code
- **`docker-compose.yml`** - Docker orchestration config
- **`CLAUDE-CODE-SETUP.md`** - Detailed setup documentation
- **`DOCKER-DESKTOP-GUIDE.md`** - Docker Desktop guide

## 🛠️ Useful Commands

```bash
# View container logs
npm run docker:logs

# Restart container (after updating .env)
npm run docker:restart

# Stop container
npm run docker:down

# Start container
npm run docker:up

# Rebuild everything
npm run docker:rebuild

# Check container status
docker ps | grep gtm-mcp-server
```

## ⚠️ Token Expiration

Google OAuth tokens expire after ~1 hour. When that happens:

1. Get a new token from OAuth Playground (steps above)
2. Update `.env` file
3. Restart: `npm run docker:restart`

## 🔍 Troubleshooting

### "Error: GOOGLE_ACCESS_TOKEN environment variable is required"

- Check `.env` file exists: `cat .env`
- Verify token is set (not the placeholder)
- Restart container: `npm run docker:restart`

### Container not running

```bash
# Check status
docker ps -a | grep gtm-mcp-server

# View logs
npm run docker:logs

# Restart
npm run docker:restart
```

### Tools not showing in Claude Code

- Restart Claude Code
- Verify Docker container is running
- Check `.claude/mcp_settings.json` exists
- Test manually: `docker run --rm -i --env-file .env gtm-mcp-server:latest`

## 📚 More Help

- **Claude Code Setup:** `CLAUDE-CODE-SETUP.md`
- **Docker Guide:** `DOCKER-DESKTOP-GUIDE.md`
- **Docker Details:** `DOCKER.md`
- **General Info:** `CLAUDE.md`

## 🎯 Summary

1. ✅ Docker container is running
2. ⏳ **You need to:** Add Google OAuth token to `.env`
3. ✅ Then restart: `npm run docker:restart`
4. ✅ Start using GTM tools in Claude Code!

---

**Ready to go?** Just add your token and restart! 🚀
