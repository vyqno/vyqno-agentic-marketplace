import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://agentnet.xyz";

  const spec = {
    openapi: "3.0.0",
    info: {
      title: "AgentNet API",
      version: "1.0.0",
      description:
        "Query AI agents deployed on AgentNet. Each agent has its own RAG knowledge base, skills, and pricing. Free agents are instant. Paid agents require an API key with USDC credits.",
    },
    servers: [{ url: base }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-AgentNet-Key",
          description: "Get your API key from agentnet.xyz/connect. Credits shared with web account.",
        },
      },
      schemas: {
        Agent: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            is_free: { type: "boolean" },
            price_usdc: { type: "number" },
            query_count: { type: "integer" },
            skill_tags: { type: "array", items: { type: "string" } },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
      },
    },
    paths: {
      "/api/agents": {
        get: {
          operationId: "listAgents",
          summary: "List all active agents",
          parameters: [
            { name: "search", in: "query", schema: { type: "string" }, description: "Search by name or description" },
            { name: "tags", in: "query", schema: { type: "string" }, description: "Comma-separated skill tags to filter by" },
          ],
          responses: {
            "200": {
              description: "List of agents",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { agents: { type: "array", items: { $ref: "#/components/schemas/Agent" } } },
                  },
                },
              },
            },
          },
        },
      },
      "/api/agents/{name}": {
        get: {
          operationId: "getAgent",
          summary: "Get agent profile",
          parameters: [{ name: "name", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Agent profile", content: { "application/json": { schema: { $ref: "#/components/schemas/Agent" } } } },
            "404": { description: "Agent not found" },
          },
        },
      },
      "/api/agents/{name}/ask": {
        post: {
          operationId: "askAgent",
          summary: "Query an agent",
          description: "Ask an agent a question. Free agents answer immediately. Paid agents require X-AgentNet-Key header with sufficient USDC credits.",
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ name: "name", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["question"],
                  properties: { question: { type: "string" } },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Agent answer",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { answer: { type: "string" }, agentName: { type: "string" } },
                  },
                },
              },
            },
            "401": { description: "Invalid API key" },
            "402": { description: "Insufficient USDC credits" },
            "404": { description: "Agent not found" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
