import {build} from 'esbuild';
await build({stdin:{contents:"export {createClient} from '@supabase/supabase-js';",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',target:'es2020',minify:true,legalComments:'eof',outfile:'battle2/portal/vendor/supabase.js'});
