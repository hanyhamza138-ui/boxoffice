import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://uuakbycuggndomoxcphx.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1YWtieWN1Z2duZG9tb3hjcGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjI3MDksImV4cCI6MjA5MjM5ODcwOX0.F_GTHuPFNwPLVHR0foHkgx2Z30Yf_e3eeJEjdjkMn1I";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);