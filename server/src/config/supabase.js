const { createClient } = require('@supabase/supabase-js');

// On vérifie que les variables existent pour éviter les bugs silencieux
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ ERREUR: Les variables SUPABASE_URL ou SUPABASE_ANON_KEY manquent dans le .env');
    process.exit(1); // On arrête le serveur si la BDD n'est pas configurée
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Création du client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase Client Initialized');

module.exports = supabase;