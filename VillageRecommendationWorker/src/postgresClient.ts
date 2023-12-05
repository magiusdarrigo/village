import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL env variable");
}

if (!supabaseSecret) {
  throw new Error("Missing SUPABASE_SECRET env variable");
}

const supabaseClient = createClient<Database>(supabaseUrl, supabaseSecret);

export default supabaseClient;
