import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hcbwoyiurrkptqprfkmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjYndveWl1cnJrcHRxcHJma21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjY0MzUsImV4cCI6MjA3ODkwMjQzNX0.bi3dhJ5bwIeEkeQrW6VgFWFOw_q8MRzgcvmLX8WJo-c';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
