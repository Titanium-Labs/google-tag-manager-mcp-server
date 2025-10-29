#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./tools/index.js";
import { getPackageVersion, loadEnv, log } from "./utils/index.js";

async function main() {
  try {
    // Load environment variables
    loadEnv();

    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    const userId = process.env.USER_ID || "docker-user";
    const userName = process.env.USER_NAME || "Docker User";
    const userEmail = process.env.USER_EMAIL || "user@example.com";
    const clientId = process.env.CLIENT_ID || "docker-client";

    if (!accessToken) {
      console.error(
        "Error: GOOGLE_ACCESS_TOKEN environment variable is required",
      );
      console.error(
        "Please set it in your .env file or docker-compose.yml",
      );
      process.exit(1);
    }

    log("Starting Google Tag Manager MCP Server (stdio)");

    const server = new McpServer({
      name: "google-tag-manager-mcp-server",
      version: getPackageVersion(),
      protocolVersion: "1.0",
      vendor: "stape-io",
      homepage: "https://github.com/stape-io/google-tag-manager-mcp-server",
    });

    // Register all tools with environment-based props
    const props = {
      userId,
      name: userName,
      email: userEmail,
      accessToken,
      clientId,
    };

    tools.forEach((register) => {
      register(server, { props, env: {} as Env });
    });

    log("Tools registered successfully");

    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    log("MCP Server connected via stdio transport");
  } catch (error) {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
  }
}

main();
