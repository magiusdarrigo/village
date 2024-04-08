import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET;

if (!supabaseUrl) {
  throw new Error("Missing env variable: SUPABASE_URL");
}

if (!supabaseSecret) {
  throw new Error("Missing env variable: SUPABASE_SECRET");
}

const supabaseClient = createClient(supabaseUrl, supabaseSecret);

export default supabaseClient;
