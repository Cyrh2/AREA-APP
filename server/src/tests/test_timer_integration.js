const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ensure required env vars are present
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}
const supabase = require('../config/supabase');
const { executeAction, executeReaction } = require('../services/index');

async function testTimerIntegration() {
    console.log('🧪 Testing Timer Service Integration\n');
    
    try {
        // 1. Test basic action execution
        console.log('1️⃣ Testing basic Timer actions:');
        
        // Test specific_time (should be false unless time matches)
        console.log('\na) Testing specific_time:');
        const futureTime = new Date(Date.now() + 60000).toISOString(); // 1 min future
        const specificResult = await executeAction('timer_specific_time', {
            target_time: futureTime
        });
        console.log(`   Input: target_time=${futureTime}`);
        console.log(`   Result: ${specificResult} (should be false)`);
        
        // Test daily_at with current time (should be true)
        console.log('\nb) Testing daily_at:');
        const now = new Date();
        const dailyResult = await executeAction('timer_daily_at', {
            hour: now.getHours(),
            minute: now.getMinutes()
        });
        console.log(`   Input: hour=${now.getHours()}, minute=${now.getMinutes()}`);
        console.log(`   Result: ${dailyResult} (should be true)`);
        
        // Test interval_minutes with epoch last_trigger (should be true immediately)
        console.log('\nc) Testing interval_minutes (first run):');
        const intervalResult = await executeAction('timer_interval_minutes', {
            interval: 5, // 5 minutes
            last_trigger: new Date(0).toISOString() // Epoch time
        });
        console.log(`   Input: interval=5, last_trigger=epoch`);
        console.log(`   Result: ${intervalResult} (should be true)`);
        
        // Test after_duration (should be true immediately)
        console.log('\nd) Testing after_duration (first run):');
        const durationResult = await executeAction('timer_after_duration', {
            minutes: 10,
            last_trigger: new Date(0).toISOString()
        });
        console.log(`   Input: minutes=10, last_trigger=epoch`);
        console.log(`   Result: ${durationResult} (should be true)`);
        
        // Test after_duration (should be false - just triggered)
        console.log('\ne) Testing after_duration (immediately after):');
        const durationResult2 = await executeAction('timer_after_duration', {
            minutes: 10,
            last_trigger: new Date().toISOString() // Now
        });
        console.log(`   Input: minutes=10, last_trigger=now`);
        console.log(`   Result: ${durationResult2} (should be false)`);
        
        // 2. Test reactions
        console.log('\n2️⃣ Testing Timer reactions:');
        
        console.log('\na) Testing execute_reminder:');
        const reminderResult = await executeReaction('timer_execute_reminder', {
            reminder_text: '⏰ Test reminder from Timer service!'
        });
        console.log(`   Input: reminder_text='Test reminder'`);
        console.log(`   Result: ${reminderResult} (should be true)`);
        
        console.log('\nb) Testing trigger_notification:');
        const notificationResult = await executeReaction('timer_trigger_notification', {
            title: 'Test Notification',
            message: 'This is a test notification from Timer service',
            type: 'info'
        });
        console.log(`   Input: title='Test Notification', message='...'`);
        console.log(`   Result: ${notificationResult} (should be true)`);
        
        // 3. Test database operations
        console.log('\n3️⃣ Testing database integration:');
        
        // Check if Timer service is in database
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('slug', 'timer');
            
        if (servicesError) {
            console.error('   ❌ Database error:', servicesError.message);
        } else if (services.length === 0) {
            console.log('   ⚠️ Timer service not found in database');
            console.log('   Run the SQL queries from step 4 to insert Timer service');
        } else {
            console.log(`   ✅ Timer service found in database (ID: ${services[0].id})`);
            
            // Check actions
            const { data: actions, error: actionsError } = await supabase
                .from('actions')
                .select('*')
                .eq('service_id', services[0].id);
                
            if (actionsError) {
                console.error('   ❌ Actions error:', actionsError.message);
            } else {
                console.log(`   ✅ ${actions.length} Timer actions found in database:`);
                actions.forEach(action => console.log(`      - ${action.name}`));
            }
        }
        
        console.log('\n✅ Timer integration test complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run test
testTimerIntegration();