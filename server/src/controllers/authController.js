const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 1. Client Standard (Utilisateur)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 2. Client ADMIN (Pour la suppression)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* Validtation du mot de passe lors de l'inscription */ 
const isPasswordStrong = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

/* Inscription */
exports.register = async (req, res) => {
    const { email, password, username } = req.body;

    // Vérification mot de passe
    if (!password || !isPasswordStrong(password)) {
        return res.status(400).json({ 
            error: "Password too weak. Min 8 chars, 1 letter, 1 number, 1 special char." 
        });
    }

    try {
        // 1. On crée l'user dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username: username } 
            }
        });

        if (authError)
            throw authError;

        res.status(201).json({
            message: 'User registered successfully',
            user: authData.user,
            token: authData.session ? authData.session.access_token : null
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/* Connexion */ 
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        res.status(200).json({
            message: 'Login successful',
            user: data.user,
            token: data.session.access_token
        });

    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

/* Forgot Password (Step 1: Envoi Email) */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "L'email est obligatoire." });

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8081/reset-password', // Change le port si besoin
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Email de réinitialisation envoyé." });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

/* Reset Password (Step 2: Nouveau MDP) */
exports.resetPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) return res.status(401).json({ error: "Token manquant." });
    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.updateUser(
      { password: new_password },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Mot de passe mis à jour !" });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

/* Mise à jour du profil utilisateur (Double écriture : Auth + Public) */
exports.updateUser = async (req, res) => {
  try {
    const { email, password, data } = req.body;
    
    // 1. Vérification du Token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non connecté" });
    const token = authHeader.split(' ')[1];

    // 2. Préparation des mises à jour pour AUTH (Sécurité)
    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (data) updates.data = data; 

    // 3. Mise à jour côté SUPABASE AUTH
    const { data: authUser, error: authError } = await supabase.auth.updateUser(
      updates,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (authError)
        return res.status(400).json({ error: "Erreur Auth: " + authError.message });

    if (data && data.username) {
        const { error: dbError } = await supabase
            .from('users')
            .update({ username: data.username })
            .eq('id', authUser.user.id);
        if (dbError) {
            console.error("Erreur DB Public:", dbError);
        }
    }
    return res.status(200).json({ 
      message: "Profil mis à jour avec succès (Auth & Public)", 
      user: authUser.user 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur interne" });
  }
};

/* Suppression du compte utilisateur */
exports.deleteUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non connecté" });
    const token = authHeader.split(' ')[1];

    // On récupère l'ID via le token user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: "Token invalide" });
    }

    // On supprime avec le SUPER ADMIN
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Compte supprimé définitivement." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};