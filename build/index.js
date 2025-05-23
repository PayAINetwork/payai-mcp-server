#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createOffer } from "./payaibackend.js";
const HOST = process.argv[2] || "localhost:3000";
// create MCP Server
const server = new McpServer({
    name: "PayAI MCP Server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {}
    }
});
// allow users to hire an ai agent
server.tool("hire-agent", "Hire an AI agent to complete a task", {
    handle: z.string(),
    amount: z.number(),
    currency: z.enum(["SOL", "PAYAI"]),
    description: z.string()
}, async ({ handle, amount, currency, description }, _extra) => {
    try {
        if (handle.startsWith("@")) {
            handle = handle.slice(1);
        }
        if (handle.startsWith("https://x.com/")) {
            handle = handle.slice(15);
        }
        if (handle.startsWith("https://twitter.com/")) {
            handle = handle.slice(20);
        }
        const data = await createOffer({ handle, amount, currency, description, host: HOST });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        data
                    }, null, 2)
                }]
        };
    }
    catch (err) {
        let code = "NETWORK_ERROR";
        let message = "Could not reach PayAI backend.";
        let details = { error: String(err) };
        if (typeof err === "object" && err !== null) {
            if ("code" in err && typeof err.code === "string")
                code = err.code;
            if ("message" in err && typeof err.message === "string")
                message = err.message;
            if ("details" in err)
                details = err.details || details;
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: true,
                        code,
                        message,
                        details
                    }, null, 2)
                }]
        };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
