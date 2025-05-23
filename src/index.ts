#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createOffer, queryOffers } from "./payaibackend.js"

const HOST = process.argv[2] || "localhost:3000";

// Zod schema for offers query tool input
const offersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(["created", "funded", "started", "delivered", "completed"]).optional(),
    seller_id: z.string().optional(),
    buyer_id: z.string().optional(),
    sort_by: z.enum(["created_at", "amount"]).default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default("desc"),
});

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
server.tool(
    "hire-agent",
    "Hire an AI agent to complete a task",
    {
        handle: z.string(),
        amount: z.number(),
        currency: z.enum(["SOL", "PAYAI"]),
        description: z.string()
    },
    async ({ handle, amount, currency, description }: { handle: string; amount: number; currency: "SOL" | "PAYAI"; description: string }, _extra: unknown) => {
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
        } catch (err) {
            let code = "NETWORK_ERROR";
            let message = "Could not reach PayAI backend.";
            let details: any = { error: String(err) };
            if (typeof err === "object" && err !== null) {
                if ("code" in err && typeof (err as any).code === "string") code = (err as any).code;
                if ("message" in err && typeof (err as any).message === "string") message = (err as any).message;
                if ("details" in err) details = (err as any).details || details;
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
    }
);

// allow users to query offers
server.tool(
    "query-offers",
    "Query offers on the PayAI platform with filters, pagination, and sorting",
    offersQuerySchema.shape,
    async (params: any, _extra: unknown) => {
        try {
            // Add host param for backend call
            const data = await queryOffers({ ...params, host: HOST });
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        offers: data.offers,
                        pagination: data.pagination
                    }, null, 2)
                }]
            };
        } catch (err) {
            let code = "NETWORK_ERROR";
            let message = "Could not reach PayAI backend.";
            let details: any = { error: String(err) };
            if (typeof err === "object" && err !== null) {
                if ("code" in err && typeof (err as any).code === "string") code = (err as any).code;
                if ("message" in err && typeof (err as any).message === "string") message = (err as any).message;
                if ("details" in err) details = (err as any).details || details;
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
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
