
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
    console.log("Probing events table...");
    const { data, error } = await supabase
        .from('events')
        .select('is_active')
        .limit(1);

    if (error) {
        console.error("Error/Column missing:", error.message);
    } else {
        console.log("Column exists!", data);
    }
}

probe();
