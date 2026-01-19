// services/github/reactions.js
const axios = require('axios');

module.exports = {
    execute: async (slug, params, token, userId) => {
        
        // Cas 1 : Créer une issue simple
        if (slug === 'github_create_issue') {
            return await createIssue(params, token);
        }

        // Cas 2 : Créer une issue ET l'assigner (Nouveau !)
        if (slug === 'github_issue_assigned') {
            return await createIssue(params, token);
        }

        return false;
    }
};

async function createIssue(params, token) {
    // On récupère les params classiques + 'assignee' (le pseudo GitHub)
    let { repository, owner, repo, title, body, assignee } = params;

    // 1. Découpage intelligent du repository (ex: "facebook/react")
    if (repository && !owner && !repo) {
        const parts = repository.split('/');
        if (parts.length === 2) {
            owner = parts[0];
            repo = parts[1];
        }
    }

    // Vérification des données critiques
    if (!owner || !repo) {
        console.error("[ERROR] GitHub Issue: Missing 'owner' or 'repo'.");
        return false;
    }
    if (!token) {
        console.error("[ERROR] GitHub Reaction: Missing OAuth Token");
        return false;
    }

    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/issues`;

        // 2. Préparation du Body
        const payload = { 
            title: title || "Automated Issue from AREA", 
            body: body || "Created by AREA Automation."
        };

        // 3. Gestion de l'assignation
        // L'API GitHub attend un TABLEAU de strings pour 'assignees'
        if (assignee) {
            payload.assignees = [assignee];
        }

        // 4. Envoi de la requête
        const response = await axios.post(
            url,
            payload, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                }
            }
        );

        // Logs différents selon le cas
        if (assignee) {
            console.log(`[SUCCESS] 🐙 Issue créée et assignée à ${assignee} : ${response.data.html_url}`);
        } else {
            console.log(`[SUCCESS] 🐙 Issue créée : ${response.data.html_url}`);
        }

        return true;

    } catch (error) {
        // Gestion d'erreur améliorée pour voir pourquoi GitHub refuse
        console.error(
            "[ERROR] GitHub Create Issue failed:", 
            error.response?.data?.message || error.message
        );
        
        // Astuce : Si GitHub renvoie "Validation Failed", c'est souvent que le user assigné n'existe pas ou n'est pas contributeur
        if (error.response?.data?.errors) {
            console.error("Détails GitHub:", JSON.stringify(error.response.data.errors));
        }
        
        return false;
    }
}
