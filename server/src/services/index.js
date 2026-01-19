// server/src/services/index.js
const path = require('path');
const fs = require('fs');

// Helper function to safely load a service
function loadService(serviceName) {
    try {
        const servicePath = path.join(__dirname, serviceName);
        
        // Check if the service directory exists
        if (!fs.existsSync(servicePath)) {
            // On ne warn plus pour les dossiers optionnels, mais google est important
            if (['google', 'github', 'discord'].includes(serviceName)) {
                 console.warn(`Service directory not found: ${serviceName}`);
            }
            return null;
        }
        
        const service = require(servicePath);
        
        // Validate service structure
        if (!service || typeof service !== 'object') {
            console.warn(`Invalid service structure for: ${serviceName}`);
            return null;
        }
        
        if (!service.name || !service.slug) {
            console.warn(`Service missing name or slug: ${serviceName}`);
            return null;
        }
        
        console.log(`✓ Loaded service: ${service.name} (${service.slug})`);
        return service;
        
    } catch (error) {
        console.warn(`Failed to load service ${serviceName}:`, error.message);
        return null;
    }
}

// 1. CHARGEMENT DES NOUVEAUX SERVICES (C'est ici qu'il te manquait Google)
const weatherService = loadService('./weather');
const discordService = loadService('./discord');
const timerService = loadService('./timer');
const googleService = loadService('./google');   // <--- AJOUTÉ
const githubService = loadService('./github');   // <--- AJOUTÉ
const youtubeService = loadService('./youtube'); // <--- AJOUTÉ

const services = {};

if (weatherService) services.weather = weatherService;
if (discordService) services.discord = discordService;
if (timerService) services.timer = timerService;
if (googleService) services.google = googleService; // <--- AJOUTÉ
if (githubService) services.github = githubService; // <--- AJOUTÉ
if (youtubeService) services.youtube = youtubeService; // <--- AJOUTÉ

const actionRegistry = {};
const reactionRegistry = {};

// Register all services with validation
Object.values(services).forEach(service => {
    const { slug, actions = {}, reactions = {} } = service;
    
    // Register actions
    Object.entries(actions).forEach(([actionName, actionFunction]) => {
        if (typeof actionFunction === 'function') {
            // Attention : Si ton slug est 'gmail' et l'action 'received_email', ça fait 'gmail_received_email'
            const actionKey = `${slug}_${actionName}`;
            actionRegistry[actionKey] = actionFunction;
            console.log(`  → Registered action: ${actionKey}`);
        }
    });
    
    // Register reactions
    Object.entries(reactions).forEach(([reactionName, reactionFunction]) => {
        if (typeof reactionFunction === 'function') {
            const reactionKey = `${slug}_${reactionName}`;
            reactionRegistry[reactionKey] = reactionFunction;
            console.log(`  → Registered reaction: ${reactionKey}`);
        }
    });
});

exports.getAllServices = () => {
    return Object.values(services).map(service => ({
        name: service.name,
        slug: service.slug,
        icon: service.icon || 'default',
        actions: Object.keys(service.actions || {}).map(actionName => ({
            name: actionName,
            slug: `${service.slug}_${actionName}`,
            description: service.actionDescriptions?.[actionName] || `${actionName} action`
        })),
        reactions: Object.keys(service.reactions || {}).map(reactionName => ({
            name: reactionName,
            slug: `${service.slug}_${reactionName}`,
            description: service.reactionDescriptions?.[reactionName] || `${reactionName} reaction`
        }))
    }));
};

// 2. MISE A JOUR DES SIGNATURES (Pour accepter token et userId)

exports.executeAction = async (actionSlug, params, token, userId) => { // <--- Ajout params
    const action = actionRegistry[actionSlug];
    if (!action) {
        console.error(` Action not found: ${actionSlug}`);
        return false;
    }
    
    try {
        // On passe les arguments OAuth à la fonction spécifique
        const result = await action(params, token, userId); 
        return result;
    } catch (error) {
        console.error(` Error executing action ${actionSlug}:`, error.message);
        return false;
    }
};

exports.executeReaction = async (reactionSlug, params, token, userId) => { // <--- Ajout params
    const reaction = reactionRegistry[reactionSlug];
    if (!reaction) {
        console.error(` Reaction not found: ${reactionSlug}`);
        return false;
    }
    
    try {
        console.log(` Executing reaction: ${reactionSlug}`);
        // On passe les arguments OAuth à la fonction spécifique
        const result = await reaction(params, token, userId);
        console.log(` Reaction ${reactionSlug} executed successfully`);
        return result;
    } catch (error) {
        console.error(` Error executing reaction ${reactionSlug}:`, error.message);
        return false;
    }
};

exports.getServiceBySlug = (slug) => {
    return services[slug];
};

// Log startup
console.log('\n' + '='.repeat(50));
console.log('SERVICE REGISTRY INITIALIZED');
console.log(`Services loaded: ${Object.keys(services).join(', ')}`);
console.log('='.repeat(50) + '\n');
