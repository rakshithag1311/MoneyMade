import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

console.log('🔍 Checking MCP Configuration...\n');

// Check .env file
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  process.exit(1);
}

console.log('✅ .env file exists');

// Check required environment variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_PROJECT_REF'
];

let allVarsPresent = true;
for (const varName of requiredVars) {
  if (process.env[varName]) {
    console.log(`✅ ${varName} is set`);
  } else {
    console.error(`❌ ${varName} is missing`);
    allVarsPresent = false;
  }
}

// Check MCP configuration file
const mcpConfigPath = path.join(process.cwd(), '.cursor', 'mcp.json');
if (!fs.existsSync(mcpConfigPath)) {
  console.error('\n❌ MCP configuration file not found at .cursor/mcp.json');
  process.exit(1);
}

console.log('\n✅ MCP configuration file exists');

// Read and validate MCP config
try {
  const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'));
  
  if (mcpConfig.mcpServers && mcpConfig.mcpServers.supabase) {
    console.log('✅ Supabase MCP server is configured');
    
    const supabaseConfig = mcpConfig.mcpServers.supabase;
    
    if (supabaseConfig.type === 'http') {
      console.log('✅ MCP type is set to "http"');
    } else {
      console.error('❌ MCP type should be "http"');
    }
    
    if (supabaseConfig.url) {
      console.log('✅ MCP URL is configured');
      console.log(`   URL: ${supabaseConfig.url}`);
    } else {
      console.error('❌ MCP URL is missing');
    }
    
    if (supabaseConfig.headers && supabaseConfig.headers.Authorization) {
      console.log('✅ Authorization header is configured');
    } else {
      console.error('❌ Authorization header is missing');
    }
  } else {
    console.error('❌ Supabase MCP server not found in configuration');
  }
} catch (error) {
  console.error('❌ Error reading MCP configuration:', error);
  process.exit(1);
}

// Check if migration file exists
const migrationPath = path.join(process.cwd(), 'supabase', 'add-oauth-providers.sql');
if (fs.existsSync(migrationPath)) {
  console.log('\n✅ OAuth providers migration file exists');
} else {
  console.error('\n❌ OAuth providers migration file not found');
}

if (allVarsPresent) {
  console.log('\n✨ MCP Configuration looks good!');
  console.log('\n📋 Next steps:');
  console.log('   1. Run the database migration (see GOOGLE_AUTH_SETUP.md)');
  console.log('   2. Verify Google OAuth is enabled in Supabase dashboard');
  console.log('   3. Test the Google sign-in on the login page');
} else {
  console.log('\n⚠️  Please fix the missing environment variables');
}
