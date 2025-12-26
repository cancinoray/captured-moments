const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envFile = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure you have .env.local file with:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];
  
  if (!username || !password) {
    console.error('❌ Usage: node scripts/create-admin.js <username> <password>');
    console.error('Example: node scripts/create-admin.js admin mypassword123');
    process.exit(1);
  }
  
  if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters long');
    process.exit(1);
  }
  
  console.log(`\n🔐 Creating admin user: ${username}`);
  console.log('⏳ Hashing password...');
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  console.log('⏳ Inserting into database...');
  
  const { data, error } = await supabase
    .from('admin_users')
    .insert([
      {
        username: username,
        password_hash: passwordHash
      }
    ])
    .select();
  
  if (error) {
    if (error.code === '23505') {
      console.error('❌ Error: Username already exists!');
      console.error('   Please choose a different username.');
    } else {
      console.error('❌ Error creating admin:', error.message);
    }
    process.exit(1);
  }
  
  console.log('\n✅ Admin user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Username:', username);
  console.log('Password:', password);
  console.log('User ID:', data[0].id);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 You can now log in at: http://localhost:3000/admin/login');
  console.log('⚠️  Keep your password secure!\n');
}

createAdmin().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

