import { supabase } from "./integrations/supabase/client";

async function testConnection() {
  console.log("Testing Supabase connection...");
  try {
    const { data, error } = await supabase.from("employees").select("count").limit(1);
    if (error) {
      console.error("Supabase connection error:", error.message);
      if (error.message.includes("403")) {
        console.error("Authentication/Authorization error (403). Check if keys are correct and RLS is configured.");
      }
    } else {
      console.log("Supabase connection successful!", data);
    }
  } catch (err) {
    console.error("Unexpected error during Supabase connection test:", err);
  }
}

testConnection();
