// services/github/reactions.js
const axios = require('axios');

module.exports = {
    execute: async (slug, params, token, userId) => {
        
        if (slug === 'github_create_issue') {
            return await createIssue(params, token);
        }

        if (slug === 'github_issue_assigned') {
            return await createIssue(params, token);
        }

        return false;
    }
};

async function createIssue(params, token) {
    let { repository, owner, repo, title, body, assignee } = params;

    if (repository && !owner && !repo) {
        const parts = repository.split('/');
        if (parts.length === 2) {
            owner = parts[0];
            repo = parts[1];
        }
    }

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

        const payload = { 
            title: title || "Automated Issue from AREA", 
            body: body || "Created by AREA Automation."
        };

        if (assignee) {
            payload.assignees = [assignee];
        }

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

        if (assignee) {
            console.log(`[SUCCESS] Issue créée et assignée à ${assignee} : ${response.data.html_url}`);
        } else {
            console.log(`[SUCCESS] Issue créée : ${response.data.html_url}`);
        }

        return true;

    } catch (error) {
        console.error(
            "[ERROR] GitHub Create Issue failed:", 
            error.response?.data?.message || error.message
        );
        
        if (error.response?.data?.errors) {
            console.error("Détails GitHub:", JSON.stringify(error.response.data.errors));
        }
        
        return false;
    }
}
