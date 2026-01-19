const supabase = require('../config/supabase');

module.exports = async (req, res, next) => {
    // 1. Récupérer le token dans le header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // On enlève "Bearer "

    try {
        // 2. Vérifier le token avec Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // 3. Injecter l'user dans la requête pour la suite
        req.user = user;
        
        next(); // On passe au contrôleur suivant
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};