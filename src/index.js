#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createOffer } from "./payaibackend.js";

const HOST = process.argv[2] || "localhost";

// create MCP Server
const server = new McpServer({
    name: "PayAI MCP Server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {}
    }
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
    "Hire an AI agent to complete a task",
    z.object({
        handle: z.string(),
        amount: z.number(),
        currency: z.enum(["SOL", "PAYAI"]),
        task: z.string()
    }),
    async ({ handle, amount, currency, task }) => {
        try {
            const data = await createOffer({ handle, amount, currency, task, host: HOST });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        offerId: data.offerId,
                        status: data.status,
                        debug: { response: data }
                    }, null, 2)
                }]
            };
        } catch (err) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: true,
                        code: err.code || "NETWORK_ERROR",
                        message: err.message || "Could not reach PayAI backend.",
                        details: err.details || { error: err?.message || String(err) }
                    }, null, 2)
                }]
            };
        }
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
