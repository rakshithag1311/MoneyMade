import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const server = new McpServer({
  name: "moneymade-supabase",
  version: "1.0.0",
});

server.tool(
  "get_profile",
  "Fetch one profile by UUID",
  { userId: z.string().uuid() },
  async ({ userId }) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return {
        content: [{ type: "text", text: `Supabase error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? null, null, 2) }],
    };
  }
);

server.tool(
  "list_expenses",
  "List expenses for a user UUID",
  { userId: z.string().uuid() },
  async ({ userId }) => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        content: [{ type: "text", text: `Supabase error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
    };
  }
);

server.tool(
  "insert_expense",
  "Insert one expense row",
  {
    userId: z.string().uuid(),
    title: z.string().min(1),
    amount: z.number().positive(),
    category: z.string().min(1),
  },
  async ({ userId, title, amount, category }) => {
    const { data, error } = await supabase
      .from("expenses")
      .insert({ user_id: userId, title, amount, category })
      .select("*")
      .single();

    if (error) {
      return {
        content: [{ type: "text", text: `Supabase error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
