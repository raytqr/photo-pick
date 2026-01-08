
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function probe() {
    try {
        // Load env
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const env: Record<string, string> = {};

        envContent.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                env[key.trim()] = values.join('=').trim();
            }
        });

        const url = env['NEXT_PUBLIC_SUPABASE_URL'];
        const key = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

        if (!url || !key) {
            console.error('Missing Supabase credentials in .env.local');
            return;
        }

        const supabase = createClient(url, key);

        // Fetch latest 10 photos
        const { data: photos, error } = await supabase
            .from('photos')
            .select('id, name, url, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Supabase error:', error);
            return;
        }

        if (!photos || photos.length === 0) {
            console.log('No photos found in DB.');
            return;
        }

        const output = photos.map(p => `[${p.name}] ${p.url}`).join('\n');
        fs.writeFileSync(path.resolve(process.cwd(), 'src/probe-output.txt'), output);

        const currentUrl = photos[0].url;
        // Check connectivity for a thumbnail ID
        const match = currentUrl.match(/\/d\/([^=]+)/);
        if (match) {
            const fileId = match[1];
            // Start with the thumbnail URL info
            const checkUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2048`;
            console.log(`Checking Thumbnail URL: ${checkUrl}`);

            const res = await fetch(checkUrl);
            console.log(`HTTP Status: ${res.status} ${res.statusText}`);
            console.log(`Content-Type: ${res.headers.get('content-type')}`);
            console.log(`Content-Disposition: ${res.headers.get('content-disposition')}`);
            console.log(`Redirected: ${res.redirected}`);
            console.log(`Final URL start: ${res.url.substring(0, 50)}...`);

            // If it redirected to an lh3 link, that's good.
            // Usually thumbnail links redirect to lh3 and are inline.
        } else {
            console.log('Could not extract File ID from current URL:', currentUrl);
            // Fallback: Check the current URL again just to be sure
            const res = await fetch(currentUrl);
            console.log('Current URL Disposition:', res.headers.get('content-disposition'));
        }

    } catch (e: any) {
        fs.writeFileSync(path.resolve(process.cwd(), 'src/probe-output.txt'), 'Error: ' + e.message);
        console.error('Probe failed:', e);
    }
}

probe();
