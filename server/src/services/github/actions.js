// services/github/actions.js
const axios = require('axios');

module.exports = {
    check: async (slug, params, token, lastExecutedAt) => {
        // [DEBUG] On loggue pour voir ce qui rentre
        console.log(`[DEBUG] GitHub Action Check: ${slug}`);

        // CAS 1 : Push sur une branche (typiquement main)
        if (slug === 'github_push_main' || slug === 'github_push' || slug === 'github_new_commit') {
            return await checkNewPush(params, token, lastExecutedAt);
        }

        // CAS 2 : Nouvelle Pull Request 
        if (slug === 'github_pr_created' || slug === 'github_pull_request') {
            return await checkNewPR(params, token, lastExecutedAt);
        }
        
        // CAS 3 : Issue Assignée (NOUVEAU)
        if (slug === 'github_issue_assigned') {
            return await checkIssueAssigned(params, token, lastExecutedAt);
        }

        // 4. ISSUE CREATED (Nouvelle Issue tout court) 
        if (slug === 'github_issue_created') {
            return await checkNewIssue(params, token, lastExecutedAt);
        }
        return false;
    }
};

// --- FONCTION 1 : CHECK NEW PUSH (Ton code valide) ---
async function checkNewPush(params, token, lastExecutedAt) {
    let { repository, owner, repo } = params;
    let repoFullName = repository || `${owner}/${repo}`;
    repoFullName = repoFullName.replace('https://github.com/', '').replace('.git', '');

    if (!repoFullName || repoFullName.includes('undefined')) return false;
    if (!token) return false;

    try {
        const url = `https://api.github.com/repos/${repoFullName}/commits?per_page=1&sha=main`; // ou master selon le repo
        
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        const latestCommit = response.data[0];
        if (!latestCommit) return false;

        const commitDate = new Date(latestCommit.commit.committer.date).getTime();
        const lastCheck = new Date(lastExecutedAt).getTime();
        
        // Log seulement si ça trigger ou si c'est très proche (pour éviter le spam console)
        if (commitDate > lastCheck) {
            console.log(`[SUCCESS] 🚀 GitHub Push: ${repoFullName} - "${latestCommit.commit.message}"`);
            return true;
        }
        return false;

    } catch (error) {
        // console.error(`[ERROR] GitHub Push Check:`, error.message);
        return false;
    }
}

// --- FONCTION 2 : CHECK NEW PULL REQUEST (NOUVEAU) ---
async function checkNewPR(params, token, lastExecutedAt) {
    let { repository, owner, repo } = params;
    let repoFullName = repository || `${owner}/${repo}`;
    
    // Nettoyage standard
    repoFullName = repoFullName.replace('https://github.com/', '').replace('.git', '');

    if (!repoFullName || repoFullName.includes('undefined')) {
        console.error(`[ERROR] GitHub PR: Nom de repo invalide: ${repoFullName}`);
        return false;
    }

    if (!token) return false;

    try {
        // On demande les PRs, triées par création (la plus récente en premier)
        // state=all permet de voir les PR même si elles ont été fermées/mergées très vite
        const url = `https://api.github.com/repos/${repoFullName}/pulls?state=all&sort=created&direction=desc&per_page=1`;

        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        const latestPR = response.data[0];
        if (!latestPR) return false;

        const prDate = new Date(latestPR.created_at).getTime();
        
        // Si c'est la première exécution (lastExecutedAt est null ou vieux), on initialise sans trigger
        if (!lastExecutedAt) return false; 

        const lastCheck = new Date(lastExecutedAt).getTime();

        console.log(`[DEBUG] GitHub PR Check (${repoFullName}):`);
        console.log(`        Dernière PR: #${latestPR.number} "${latestPR.title}" (${new Date(prDate).toISOString()})`);
        console.log(`        Server Check: ${new Date(lastCheck).toISOString()}`);

        if (prDate > lastCheck) {
            console.log(`[SUCCESS] 🔀 NOUVELLE PR DÉTECTÉE : #${latestPR.number} - ${latestPR.title}`);
            
            // On enrichit les params pour la réaction (Gmail peut utiliser ces variables !)
            params.pr_title = latestPR.title;
            params.pr_url = latestPR.html_url;
            params.pr_user = latestPR.user.login;

            return true;
        }

        return false;

    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error(`[ERROR] GitHub Repo PR introuvable: ${repoFullName}`);
        } else {
            console.error(`[ERROR] GitHub PR API:`, error.message);
        }
        return false;
    }
}

// --- FONCTION 3 : ISSUE ASSIGNED ---
async function checkIssueAssigned(params, token, lastExecutedAt) {
    let { repository, owner, repo } = params;
    let repoFullName = repository || `${owner}/${repo}`;
    repoFullName = repoFullName.replace('https://github.com/', '').replace('.git', '');
    if (!token) return false;

    try {
        // On trie par UPDATE car l'assignation est une mise à jour
        const url = `https://api.github.com/repos/${repoFullName}/issues?state=all&sort=updated&direction=desc&per_page=1`;
        const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const latestIssue = response.data[0];

        if (!latestIssue || !latestIssue.assignee) return false; // On veut absolument un assignee

        const updateDate = new Date(latestIssue.updated_at).getTime();
        
        if (lastExecutedAt && updateDate > new Date(lastExecutedAt).getTime()) {
            console.log(`[SUCCESS] 🎫 Issue Assignée détectée: ${latestIssue.title} -> ${latestIssue.assignee.login}`);
            params.issue_title = latestIssue.title;
            params.issue_assignee = latestIssue.assignee.login;
            return true;
        }
        return false;
    } catch (e) { return false; }
}

// --- FONCTION 4 : NEW ISSUE CREATED (Surveille la création) ---
async function checkNewIssue(params, token, lastExecutedAt) {
    let { repository, owner, repo } = params;
    let repoFullName = repository || `${owner}/${repo}`;
    repoFullName = repoFullName.replace('https://github.com/', '').replace('.git', '');

    if (!token) return false;

    try {
        // ICI : On trie par CREATED (Date de création) et non updated
        const url = `https://api.github.com/repos/${repoFullName}/issues?state=all&sort=created&direction=desc&per_page=1`;
        
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        const latestIssue = response.data[0];
        if (!latestIssue) return false;

        const createdDate = new Date(latestIssue.created_at).getTime();

        // Si c'est la première exécution
        if (!lastExecutedAt) return false;

        const lastCheck = new Date(lastExecutedAt).getTime();

        // Debug léger
        // console.log(`[DEBUG] Check Issue Created: #${latestIssue.number} (${new Date(createdDate).toISOString()}) vs Last (${new Date(lastCheck).toISOString()})`);

        if (createdDate > lastCheck) {
            console.log(`[SUCCESS] 🆕 NOUVELLE ISSUE CRÉÉE : #${latestIssue.number} "${latestIssue.title}"`);
            
            // Enrichissement des params
            params.issue_title = latestIssue.title;
            params.issue_url = latestIssue.html_url;
            params.issue_user = latestIssue.user.login; // Celui qui a créé l'issue

            return true;
        }

        return false;

    } catch (error) {
        console.error(`[ERROR] GitHub New Issue Check:`, error.message);
        return false;
    }
}
