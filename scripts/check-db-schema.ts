import { getSupabaseClient } from "../models/db";

async function checkAnnouncementsSchema() {
  const supabase = getSupabaseClient();
  
  try {
    // First, try to fetch the table schema
    console.log("Checking announcements table schema...");
    
    // Try a simple query to see what columns are available
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("Error querying announcements table:", error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log("Sample row columns:", Object.keys(data[0]));
    } else {
      console.log("No data in announcements table, creating a test entry...");
      
      // Try to create a simple announcement without the multilingual fields
      const { data: testData, error: testError } = await supabase
        .from("announcements")
        .insert({
          title: "Test",
          content: "Test content",
          type: "info",
          priority: 0,
          is_active: false
        })
        .select()
        .single();
      
      if (testError) {
        console.error("Error creating test announcement:", testError);
      } else {
        console.log("Test announcement created, columns:", Object.keys(testData));
        
        // Clean up test data
        await supabase
          .from("announcements")
          .delete()
          .eq("uuid", testData.uuid);
      }
    }
    
    // Try to run a raw SQL query to check column information
    let schemaData = null;
    let schemaError = null;
    try {
      const result = await supabase.rpc('get_table_columns', {
        table_name: 'announcements'
      });
      schemaData = result.data;
      schemaError = result.error;
    } catch (e) {
      schemaError = 'RPC function not found';
    }
    
    if (schemaData) {
      console.log("Table schema from RPC:", schemaData);
    }
    
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

checkAnnouncementsSchema();