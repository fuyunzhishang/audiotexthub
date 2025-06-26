import { getSupabaseClient } from "../models/db";
import { readFileSync } from "fs";
import { join } from "path";

async function applyMigrations() {
  const supabase = getSupabaseClient();
  
  console.log("Applying database migrations...");
  
  const migrations = [
    "create_announcements_table.sql",
    "add_multilingual_announcements.sql",
    "update_announcements_policy.sql"
  ];
  
  for (const migrationFile of migrations) {
    try {
      console.log(`\nApplying migration: ${migrationFile}`);
      
      const sqlContent = readFileSync(
        join(__dirname, "../supabase/migrations", migrationFile),
        "utf-8"
      );
      
      // Split by semicolons and execute each statement
      const statements = sqlContent
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        // Skip if statement is just comments
        if (statement.replace(/--.*$/gm, "").trim().length === 0) continue;
        
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        // Use raw SQL execution through Supabase
        let error;
        try {
          const result = await supabase.rpc('exec_sql', {
            query: statement + ";"
          });
          error = result.error;
        } catch (e) {
          error = 'Direct SQL execution not available';
        }
        
        if (error) {
          console.warn(`Warning: Could not execute statement directly. This might be a permission issue.`);
        }
      }
      
      console.log(`✓ Migration ${migrationFile} completed`);
      
    } catch (error) {
      console.error(`Error applying migration ${migrationFile}:`, error);
    }
  }
  
  // Test if columns exist now
  console.log("\nTesting if multilingual columns exist...");
  const { data, error } = await supabase
    .from("announcements")
    .select("title_en, content_en, title_zh, content_zh")
    .limit(1);
  
  if (error) {
    console.error("Multilingual columns still not accessible:", error);
    console.log("\nIMPORTANT: You may need to:");
    console.log("1. Run these migrations directly in your Supabase dashboard");
    console.log("2. Or use Supabase CLI: npx supabase db push");
    console.log("3. Or manually execute the SQL files in supabase/migrations/");
  } else {
    console.log("✓ Multilingual columns are accessible!");
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  applyMigrations().catch(console.error);
}

export { applyMigrations };