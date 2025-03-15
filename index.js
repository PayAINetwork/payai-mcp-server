import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const HOST = process.argv[2] || "localhost";

// create MCP Server
const server = new McpServer({
    name: "PayAI MCP Server",
    version: "1.0.0",
});

// add a resource to list all Solana related MCP Servers
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

const transport = new StdioServerTransport();
await server.connect(transport);
