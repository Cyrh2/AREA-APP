const axios = require('axios');
const { createTestUser } = require('../scripts/create_test_user');

const API_BASE = 'http://localhost:8080';

async function testTimerDiscordAPI() {
    console.log('🌐 Testing Timer + Discord AREAs via API');
    console.log('='.repeat(60) + '\n');
    
    let authToken = null;
    
    try {
        // 1. Authenticate
        console.log('1️⃣ Authenticating...');
        authToken = await createTestUser();
        
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };
        
        // 2. Get all services to find Timer and Discord IDs
        console.log('\n2️⃣ Fetching services...');
        const { data: services } = await axios.get(`${API_BASE}/services`, { headers });
        
        const timerService = services.find(s => s.slug === 'timer');
        const discordService = services.find(s => s.slug === 'discord');
        
        if (!timerService || !discordService) {
            console.log('❌ Missing services in database:');
            console.log(`   Timer: ${timerService ? '✅' : '❌'}`);
            console.log(`   Discord: ${discordService ? '✅' : '❌'}`);
            console.log('\n⚠️  Make sure to run the SQL inserts for Timer service first!');
            return;
        }
        
        console.log(`✅ Timer service: ID=${timerService.id}, ${timerService.actions.length} actions`);
        console.log(`✅ Discord service: ID=${discordService.id}, ${discordService.reactions.length} reactions`);
        
        // 3. Clean up any existing test AREAs
        console.log('\n3️⃣ Cleaning up existing test AREAs...');
        const { data: existingAreas } = await axios.get(`${API_BASE}/areas`, { headers });
        
        const testAreas = existingAreas.filter(area => 
            area.actions?.name?.includes('test') || 
            area.reactions?.name?.includes('test')
        );
        
        for (const area of testAreas) {
            // Note: You might need a DELETE endpoint or just deactivate them
            console.log(`   Found test AREA ${area.id} - will test with it`);
        }
        
        // 4. Test Scenario 1: Timer (interval) → Discord (post message)
        console.log('\n4️⃣ Creating AREA: Timer (interval) → Discord (post message)');
        
        const timerAction = timerService.actions.find(a => a.name === 'interval_minutes');
        const discordReaction = discordService.reactions.find(r => r.name === 'post_message');
        
        if (!timerAction || !discordReaction) {
            console.log('❌ Missing required actions/reactions:');
            console.log(`   timer.interval_minutes: ${timerAction ? '✅' : '❌'}`);
            console.log(`   discord.post_message: ${discordReaction ? '✅' : '❌'}`);
            return;
        }
        
        const areaData1 = {
            name: 'Test: Every 2 min → Discord',
            action_id: timerAction.id,
            reaction_id: discordReaction.id,
            action_params: {
                interval: 2,  // Check every 2 minutes
                last_trigger: new Date(0).toISOString()  // Will trigger immediately
            },
            reaction_params: {
                channel_id: process.env.TEST_DISCORD_CHANNEL || '1446570782951080070',
                message: '⏰ Timer test! This message was triggered by a Timer AREA every 2 minutes!'
            },
            is_active: true
        };
        
        console.log('\n   📝 Creating AREA with:');
        console.log(`      Action: ${timerAction.name} (ID: ${timerAction.id})`);
        console.log(`      Reaction: ${discordReaction.name} (ID: ${discordReaction.id})`);
        console.log(`      Action params:`, JSON.stringify(areaData1.action_params, null, 2));
        console.log(`      Reaction params:`, JSON.stringify(areaData1.reaction_params, null, 2));
        
        try {
            const { data: createdArea1 } = await axios.post(
                `${API_BASE}/areas`,
                areaData1,
                { headers }
            );
            
            console.log(`\n   ✅ AREA created successfully!`);
            console.log(`      AREA ID: ${createdArea1.area.id}`);
            console.log(`      User ID: ${createdArea1.area.user_id}`);
            console.log(`      Active: ${createdArea1.area.is_active}`);
            
            // 5. Test the AREA immediately
            console.log('\n5️⃣ Testing AREA trigger...');
            
            const { data: triggerResult } = await axios.post(
                `${API_BASE}/areas/${createdArea1.area.id}/trigger`,
                {},
                { headers }
            );
            
            console.log(`   Trigger result:`);
            console.log(`      Action triggered: ${triggerResult.actionTriggered}`);
            console.log(`      Message: ${triggerResult.message}`);
            
            if (triggerResult.actionTriggered) {
                console.log('   🎯 Timer action triggered successfully!');
                console.log('   ⚡ Discord reaction should have been executed');
            } else {
                console.log('   ⚠️  Timer action did not trigger (might be timing issue)');
            }
            
            // 6. Force test the AREA (bypass action check)
            console.log('\n6️⃣ Force testing AREA (bypass action)...');
            
            const { data: testResult } = await axios.post(
                `${API_BASE}/areas/${createdArea1.area.id}/test`,
                {},
                { headers }
            );
            
            console.log(`   Force test result:`);
            console.log(`      Success: ${testResult.message}`);
            console.log(`      Timestamp: ${new Date(testResult.timestamp).toLocaleTimeString()}`);
            
            // 7. Test Scenario 2: Timer (daily) → Discord
            console.log('\n7️⃣ Creating second AREA: Timer (daily) → Discord');
            
            const dailyAction = timerService.actions.find(a => a.name === 'daily_at');
            const now = new Date();
            
            const areaData2 = {
                name: 'Test: Daily at current time → Discord',
                action_id: dailyAction.id,
                reaction_id: discordReaction.id,
                action_params: {
                    hour: now.getHours(),
                    minute: now.getMinutes()
                },
                reaction_params: {
                    channel_id: process.env.TEST_DISCORD_CHANNEL || '1167423456789012345',
                    message: '📅 Daily timer test! This runs every day at the same time.'
                },
                is_active: true
            };
            
            const { data: createdArea2 } = await axios.post(
                `${API_BASE}/areas`,
                areaData2,
                { headers }
            );
            
            console.log(`   ✅ Second AREA created: ID ${createdArea2.area.id}`);
            
            // 8. Test daily AREA
            console.log('\n8️⃣ Testing daily AREA...');
            const { data: dailyTriggerResult } = await axios.post(
                `${API_BASE}/areas/${createdArea2.area.id}/trigger`,
                {},
                { headers }
            );
            
            console.log(`   Daily trigger: ${dailyTriggerResult.actionTriggered ? '✅' : '❌'}`);
            
            // 9. List all AREAs
            console.log('\n9️⃣ Listing all user AREAs...');
            const { data: userAreas } = await axios.get(`${API_BASE}/areas`, { headers });
            
            console.log(`   Total AREAs: ${userAreas.length}`);
            
            const timerAreas = userAreas.filter(area => 
                area.actions?.services?.slug === 'timer'
            );
            
            console.log(`   Timer AREAs: ${timerAreas.length}`);
            
            timerAreas.forEach(area => {
                console.log(`\n   📋 AREA ${area.id}:`);
                console.log(`      Action: ${area.actions?.services?.slug}_${area.actions?.name}`);
                console.log(`      Reaction: ${area.reactions?.services?.slug}_${area.reactions?.name}`);
                console.log(`      Last executed: ${area.last_executed_at ? new Date(area.last_executed_at).toLocaleString() : 'Never'}`);
                console.log(`      Active: ${area.is_active}`);
            });
            
            // 10. Test cron simulation
            console.log('\n🔟 Simulating cron execution...');
            console.log('   (This would normally run every minute via cron)');
            
            for (const timerArea of timerAreas) {
                console.log(`\n   🔄 Checking AREA ${timerArea.id}:`);
                const { data: cronCheckResult } = await axios.post(
                    `${API_BASE}/areas/${timerArea.id}/trigger`,
                    {},
                    { headers }
                );
                
                console.log(`      Would trigger: ${cronCheckResult.actionTriggered ? 'YES' : 'NO'}`);
                if (cronCheckResult.actionTriggered) {
                    console.log(`      Action: ${cronCheckResult.message}`);
                }
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('✅ TEST COMPLETE!');
            console.log('='.repeat(60));
            console.log('\nNext steps:');
            console.log('1. Check server logs for cron execution every minute');
            console.log('2. Check Discord channel for test messages');
            console.log('3. Monitor AREA execution times in database');
            console.log('\nTo clean up test AREAs, you can:');
            console.log('- Set is_active to false via database');
            console.log('- Or create a DELETE endpoint in your API');
            
        } catch (areaError) {
            console.log('❌ AREA creation error:');
            console.log('   Status:', areaError.response?.status);
            console.log('   Error:', areaError.response?.data?.error || areaError.message);
            
            if (areaError.response?.data?.error?.includes('foreign key')) {
                console.log('\n⚠️  Database issue: Make sure Timer service is properly inserted in database!');
                console.log('   Run the SQL queries from the integration steps.');
            }
        }
        
    } catch (error) {
        console.log('❌ Test failed:');
        console.log('   Error:', error.response?.data?.error || error.message);
        console.log('   Stack:', error.stack);
    }
}

// Run the test
testTimerDiscordAPI();