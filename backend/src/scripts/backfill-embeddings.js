import 'dotenv/config';
import { supabase } from '../services/supabase.js';
import { embedText } from '../services/embed.js';

const { data: notes, error } = await supabase
  .from('notes')
  .select('id, content')
  .is('embedding', null);

if (error) {
  console.error('Failed to fetch notes:', error.message);
  process.exit(1);
}

if (!notes.length) {
  console.log('No notes with missing embeddings. Nothing to do.');
  process.exit(0);
}

console.log(`Found ${notes.length} notes to embed.`);

for (let i = 0; i < notes.length; i++) {
  const note = notes[i];
  const embedding = await embedText(note.content);

  const { error: updateErr } = await supabase
    .from('notes')
    .update({ embedding })
    .eq('id', note.id);

  if (updateErr) {
    console.error(`Failed to update note ${note.id}:`, updateErr.message);
    process.exit(1);
  }

  console.log(`Embedded note ${i + 1} of ${notes.length} (id: ${note.id})`);
}

console.log('Backfill complete.');
