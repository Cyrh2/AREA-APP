// server/src/services/index.js
const path = require('path');
const fs = require('fs');

function loadService(serviceName) {
    try {
        const servicePath = path.join(__dirname, serviceName);
        
        if (!fs.existsSync(servicePath)) {
            if (['google', 'github', 'discord'].includes(serviceName)) {
                 console.warn(`Service directory not found: ${serviceName}`);
            }
            return null;
        }
        const service = require(servicePath);
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

const weatherService = loadService('./weather');
const discordService = loadService('./discord');
const timerService = loadService('./timer');
const googleService = loadService('./google');
const githubService = loadService('./github');
const youtubeService = loadService('./youtube');
const driveService = loadService('./drive');

const services = {};

if (weatherService) services.weather = weatherService;
if (discordService) services.discord = discordService;
if (timerService) services.timer = timerService;
if (googleService) services.google = googleService;
if (githubService) services.github = githubService;
if (youtubeService) services.youtube = youtubeService;
if (driveService) services.drive = driveService;

const actionRegistry = {};
const reactionRegistry = {};

Object.values(services).forEach(service => {
    const { slug, actions = {}, reactions = {} } = service;
    
    Object.entries(actions).forEach(([actionName, actionFunction]) => {
        if (typeof actionFunction === 'function') {
            const actionKey = `${slug}_${actionName}`;
            actionRegistry[actionKey] = actionFunction;
            console.log(`  → Registered action: ${actionKey}`);
        }
    });
    
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

exports.executeAction = async (actionSlug, params, token, userId) => {
    const action = actionRegistry[actionSlug];
    if (!action) {
        console.error(`Action not found: ${actionSlug}`);
        return false;
    }
    
    try {
        const result = await action(params, token, userId); 
        return result;
    } catch (error) {
        console.error(`Error executing action ${actionSlug}:`, error.message);
        return false;
    }
};

exports.executeReaction = async (reactionSlug, params, token, userId) => {
    const reaction = reactionRegistry[reactionSlug];
    if (!reaction) {
        console.error(`Reaction not found: ${reactionSlug}`);
        return false;
    }
    
    try {
        console.log(`Executing reaction: ${reactionSlug}`);
        const result = await reaction(params, token, userId);
        console.log(`Reaction ${reactionSlug} executed successfully`);
        return result;
    } catch (error) {
        console.error(`Error executing reaction ${reactionSlug}:`, error.message);
        return false;
    }
};

exports.getServiceBySlug = (slug) => {
    return services[slug];
};

console.log('\n' + '='.repeat(50));
console.log('SERVICE REGISTRY INITIALIZED');
console.log(`Services loaded: ${Object.keys(services).join(', ')}`);
console.log('='.repeat(50) + '\n');
