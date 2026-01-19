const axios = require('axios');

const API_BASE = 'http://localhost:8080';

async function testTimerAPI() {
    console.log('🌐 Testing Timer Service via API\n');
    
    try {
        // 1. First, get a token (login)
        console.log('1️⃣ Authenticating...');
        const { data: loginData } = await axios.post(`${API_BASE}/auth/login`, {
            email: 'toni@gmail.com',
            password: 'F4ther@lmighty'
        });
        
        const token = loginData.token;
        console.log(`   ✅ Token obtained: ${token.substring(0, 20)}...\n`);
        
        const headers = {
            Authorization: `Bearer ${token}`
        };
        
        // 2. Check if Timer appears in services
        console.log('2️⃣ Checking /services endpoint:');
        const { data: services } = await axios.get(`${API_BASE}/services`, { headers });
        
        const timerService = services.find(s => s.slug === 'timer');
        if (timerService) {
            console.log(`   ✅ Timer service found:`);
            console.log(`      Name: ${timerService.name}`);
            console.log(`      Actions: ${timerService.actions.length}`);
            console.log(`      Reactions: ${timerService.reactions.length}`);
            
            // Show available actions
            console.log(`\n   Available Timer actions:`);
            timerService.actions.forEach(action => {
                console.log(`      - ${action.name}: ${action.description}`);
            });
        } else {
            console.log('   ❌ Timer service NOT found in /services');
        }
        
        // 3. Test creating a Timer AREA
        console.log('\n3️⃣ Creating a Timer AREA:');
        
        // First, get action and reaction IDs
        const timerAction = timerService.actions.find(a => a.name === 'interval_minutes');
        const timerReaction = timerService.reactions.find(r => r.name === 'execute_reminder');
        
        if (timerAction && timerReaction) {
            const areaData = {
                action_id: timerAction.id,
                reaction_id: timerReaction.id,
                action_params: {
                    interval: 2, // Check every 2 minutes
                    last_trigger: new Date(0).toISOString() // Will trigger immediately
                },
                reaction_params: {
                    reminder_text: '⏰ This is a test reminder every 2 minutes!'
                }
            };
            
            try {
                const { data: createdArea } = await axios.post(
                    `${API_BASE}/areas`, 
                    areaData, 
                    { headers }
                );
                
                console.log(`   ✅ AREA created with ID: ${createdArea.area.id}`);
                console.log(`      Action: ${timerAction.name}`);
                console.log(`      Reaction: ${timerReaction.name}`);
                
                // 4. Test triggering the AREA manually
                console.log('\n4️⃣ Testing AREA trigger:');
                const { data: triggerResult } = await axios.post(
                    `${API_BASE}/areas/${createdArea.area.id}/trigger`,
                    {},
                    { headers }
                );
                
                console.log(`   Trigger result:`);
                console.log(`      Action triggered: ${triggerResult.actionTriggered}`);
                console.log(`      Message: ${triggerResult.message}`);
                
                // 5. Test force execution (bypass action check)
                console.log('\n5️⃣ Testing AREA force execution:');
                const { data: testResult } = await axios.post(
                    `${API_BASE}/areas/${createdArea.area.id}/test`,
                    {},
                    { headers }
                );
                
                console.log(`   Test execution result:`);
                console.log(`      Success: ${!!testResult.message}`);
                console.log(`      Timestamp: ${testResult.timestamp}`);
                
            } catch (areaError) {
                console.log('   ❌ AREA creation/execution error:', 
                    areaError.response?.data?.error || areaError.message);
            }
        } else {
            console.log('   ⚠️ Could not find Timer action/reaction IDs');
        }
        
        // 6. List all AREAs
        console.log('\n6️⃣ Listing all AREAs:');
        const { data: areas } = await axios.get(`${API_BASE}/areas`, { headers });
        console.log(`   Total AREAs: ${areas.length}`);
        
        const timerAreas = areas.filter(area => 
            area.actions?.services?.slug === 'timer' || 
            area.reactions?.services?.slug === 'timer'
        );
        console.log(`   Timer-related AREAs: ${timerAreas.length}`);
        
        console.log('\n✅ API testing complete!');
        
    } catch (error) {
        console.error('❌ API test failed:', 
            error.response?.data?.error || error.message);
    }
}

// Run API test
testTimerAPI();