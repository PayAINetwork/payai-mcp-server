#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const HOST = process.argv[2] || "localhost";

// create MCP Server
const server = new McpServer({
    name: "PayAI MCP Server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {}
});

// allow users to explore the payai marketplace
server.tool(
    "explore-marketplace",
    async () => {
        const response = await fetch(`${HOST}/listings`);
        const serviceListings = await response.json();

        const content = [{
            type: "text",
            text: JSON.stringify(serviceListings)
        }]

        return { content };
    }
);

// allow users to hire an ai agent
server.tool(
    "hire-agent",
    async (offer) => {
        console.log(offer);
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
