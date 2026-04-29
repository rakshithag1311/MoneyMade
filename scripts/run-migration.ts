import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL is not set in .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
  console.log('\n📝 To run migrations, you need the service role key from your Supabase project:');
  console.log('   1. Go to your Supabase project settings');
  console.log('   2. Navigate to API settings');
  console.log('   3. Copy the "service_role" key (not the anon key)');
  console.log('   4. Add it to your .env file as SUPABASE_SERVICE_ROLE_KEY=your_key_here\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running OAuth providers migration...\n');

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'supabase', 'add-oauth-providers.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution (this might not work with all SQL)
      console.log('⚠️  exec_sql function not found, trying alternative method...\n');
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        const { error: execError } = await supabase.rpc('exec', { sql: statement });
        if (execError) {
          console.error('❌ Error executing statement:', execError);
          console.log('\n📝 Please run the SQL manually in your Supabase SQL Editor:');
          console.log(`   File: supabase/add-oauth-providers.sql\n`);
          process.exit(1);
        }
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Created table: oauth_providers');
    console.log('   - Stores Google and other OAuth provider information');
    console.log('   - Linked to user profiles');
    console.log('   - Row Level Security enabled\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📝 Please run the SQL manually in your Supabase SQL Editor:');
    console.log(`   File: supabase/add-oauth-providers.sql\n`);
    process.exit(1);
  }
}

runMigration();
