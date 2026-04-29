import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const PORT = Number(process.env.PORT ?? 5000);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env. Backend cannot start."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const app = express();
app.use(express.json());

// Root
app.get("/", (_req, res) => {
  res.send("Backend working!");
});

// Health
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "backend", supabase: "configured" });
});

// Get expenses
app.get("/expenses/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return res.status(500).json({ message: error.message, details: error.details });
  }

  return res.json(data ?? []);
});

// Get profile (ONLY ONCE)
app.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ message: error.message, details: error.details });
  }

  if (!data) {
    return res.status(404).json({ message: "Profile not found" });
  }

  return res.json(data);
});

// ✅ POST API
app.post("/expenses", async (req, res) => {
  const { user_id, amount, category } = req.body;

  if (!user_id || !amount || !category) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert([{ user_id, amount, category }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(201).json(data);
});

// Start server (ONLY ONCE)
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});