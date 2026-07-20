// Visitors' Wall backend configuration.
//
// Out of the box the wall runs in 'local' demo mode: marks are stored in
// this browser only. To make the wall shared across all visitors for free,
// create a Supabase project and follow README-GUESTBOOK.md, then fill in
// the two values below and switch BACKEND to 'supabase'.
//
// The anon key is designed to be public (it only grants what the database's
// row-level-security policies allow) — committing it here is expected.
export const BACKEND = 'supabase';
export const SUPABASE_URL = 'https://lnplvuiaufxnzdabvbds.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_bDgEXw8Ufk9pidu4TX4jAw_EIbYg-YX';
