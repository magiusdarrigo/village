import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL env variable");
}

if (!supabaseSecret) {
  throw new Error("Missing SUPABASE_SECRET env variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing SUPABASE_ANON_KEY env variable");
}

const supabaseClient = createClient<Database>(supabaseUrl, supabaseSecret);

export default supabaseClient;
