require('dotenv/config');
const readline = require('readline');
const { supabaseAdmin } = require('../src/supabaseClient');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  const username = await ask('Admin username: ');
  const email = await ask('Admin email: ');
  const password = await ask('Admin password (min 12 chars): ');
  const role = (await ask('Role [admin/superadmin] (default admin): ')) || 'admin';

  if (password.length < 12) {
    console.error('Password must be at least 12 characters for admin accounts.');
    process.exit(1);
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userErr) {
    console.error('Failed to create auth user:', userErr.message);
    process.exit(1);
  }

  const { error: insertErr } = await supabaseAdmin.from('admin_users').insert({
    id: userData.user.id,
    username,
    role,
  });

  if (insertErr) {
    console.error('Auth user created, but failed to insert admin_users row:', insertErr.message);
    console.error(`You can insert it manually in Supabase with id = ${userData.user.id}`);
    process.exit(1);
  }

  console.log(`Admin '${username}' created with role '${role}'. They can now log in at /api/admin/login.`);
  rl.close();
}

main();