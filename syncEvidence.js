import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncEvidence() {
    console.log('Fetching files from evidence-vault bucket...');
    const { data: files, error: storageError } = await supabase.storage.from('evidence-vault').list('', { limit: 100 });

    if (storageError) {
        console.error('Storage error:', storageError);
        return;
    }

    console.log(`Found ${files.length} files in bucket.`);

    // Get existing records
    const { data: existingRecords, error: dbError } = await supabase.from('evidence_vault').select('file_url');
    if (dbError) {
        console.error('DB error:', dbError);
        return;
    }

    const existingUrls = new Set(existingRecords.map(r => r.file_url));

    const toInsert = [];
    for (const file of files) {
        if (file.name === '.emptyFolderPlaceholder') continue;

        if (!existingUrls.has(file.name)) {
            // Determine category
            let category = 'Legal';
            if (file.name.toLowerCase().includes('founders')) category = 'Foundational';
            if (file.name.toLowerCase().includes('account') || file.name.toLowerCase().includes('rental')) category = 'Financial';
            if (file.name.toLowerCase().includes('lockout') || file.name.toLowerCase().includes('notice')) category = 'Bad Faith Action';
            if (file.name.toLowerCase().includes('certificate')) category = 'Company Registry';

            toInsert.push({
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                category: category,
                file_url: file.name,
                evidence_files: [file.name],
                verification_code: ''
            });
        }
    }

    if (toInsert.length > 0) {
        console.log(`Inserting ${toInsert.length} new records into evidence_vault table...`);
        const { error: insertError } = await supabase.from('evidence_vault').insert(toInsert);
        if (insertError) {
            console.error('Insert error:', insertError);
        } else {
            console.log('Successfully inserted all new records!');
        }
    } else {
        console.log('No new files to insert. Database is in sync with storage.');
    }
}

syncEvidence();
