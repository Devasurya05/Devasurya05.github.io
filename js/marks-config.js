// Visitors' Wall backend configuration.
//
// Out of the box the wall runs in 'local' demo mode: marks are stored in
// this browser only. To make the wall shared across all visitors for free,
// create a Supabase project and follow README-GUESTBOOK.md, then fill in
// the two values below and switch BACKEND to 'supabase'.
//
// The anon key is designed to be public (it only grants what the database's
// row-level-security policies allow) — committing it here is expected.
export const BACKEND = 'local'; // 'local' | 'supabase'
export const SUPABASE_URL = '';      // e.g. 'https://abcdefgh.supabase.co'
export const SUPABASE_ANON_KEY = ''; // the project's anon/public API key
