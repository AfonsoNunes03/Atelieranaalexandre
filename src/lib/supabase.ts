import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env?.DEV) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  } else {
    console.warn("Database connection variables missing. Dashboard/Content might not load.");
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
