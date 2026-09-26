const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر HTTP ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Both Minecraft Bots are Active 24/7!');
});

app.listen(PORT, () => console.log(`Keep-Alive running on port ${PORT}`));

// --- 2. بيانات البوتين (جربت تغيير الأسماء لأسماء طبيعية لتفادي نظام حظر البوتات) ---
const botsData = [
    { username: 'GamerPro_247_1', password: 'MyBotPassword123' },
    { username: 'GamerPro_247_2', password: 'MyBotPassword123' }
];

const SERVER_HOST = 'progamer-smp1.play.hosting';
const SERVER_PORT = 25856;

// --- 3. دالة تشغيل البوت ---
function startBot(config) {
    console.log(`[${config.username}] جاري محاولة الاتصال بـ ${SERVER_HOST}:${SERVER_PORT}...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: config.username,
        // ⚠️ مهم جداً: إذا لم ينجح، غير "1.20.1" إلى إصدار سيرفرك الدقيق (مثلاً "1.21" أو "1.19.2")
        version: "1.20.1", 
        auth: 'offline', // لتأكيد أن السيرفر مكرك
        checkTimeoutInterval: 30000 // قطع الاتصال والمحاولة مجدداً إذا علق السيرفر لأكثر من 30 ثانية
    });

    let actionTimeout;

    // حدث الدخول الناجح
    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ دخل السيرفر بنجاح الآن!`);

        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat(`/register ${config.password} ${config.password}`);
                setTimeout(() => {
                    if (bot && bot.entity) bot.chat(`/login ${config.password}`);
                }, 2000);
            }
        }, 3000);

        scheduleNextAction(bot, config.username);
    });

    // 🚨 كاشف أخطاء الطرد (Kick)
    bot.on('kicked', (reason) => {
        console.log(`[${config.username}] ❌ تم طرده من السيرفر! السبب: ${reason}`);
    });

    // 🚨 كاشف أخطاء الاتصال (Error)
    bot.on('error', (err) => {
        console.error(`[${config.username}] 🚨 حدث خطأ في الاتصال:`, err.message);
    });

    // عند فصل السيرفر
    bot.on('end', (reason) => {
        console.warn(`[${config.username}] 🔌 انفصل الاتصال (Reason: ${reason}). إعادة المحاولة بعد 15 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(() => startBot(config), 15000);
    });

    // دالة الحركة التلقائية العشوائية
    function scheduleNextAction(botInstance, name) {
        const randomDelay = Math.floor(Math.random() * (25000 - 8000)) + 8000;
        actionTimeout = setTimeout(async () => {
            if (botInstance && botInstance.entity) {
                await performAction(botInstance);
            }
            scheduleNextAction(botInstance, name);
        }, randomDelay);
    }

    async function performAction(botInstance) {
        const actions = ['jump', 'sneak', 'lookAround', 'walk', 'swingArm'];
        const chosenAction = actions[Math.floor(Math.random() * actions.length)];
        try {
            switch (chosenAction) {
                case 'jump':
                    botInstance.setControlState('jump', true);
                    setTimeout(() => botInstance.setControlState('jump', false), 400);
                    break;
                case 'sneak':
                    botInstance.setControlState('sneak', true);
                    setTimeout(() => botInstance.setControlState('sneak', false), 1000);
                    break;
                case 'lookAround':
                    const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
                    const pitch = (Math.random() * 60 - 30) * (Math.PI / 180);
                    await botInstance.look(yaw, pitch, true);
                    break;
                case 'walk':
                    const dir = Math.random() > 0.5 ? 'forward' : 'back';
                    botInstance.setControlState(dir, true);
                    setTimeout(() => botInstance.setControlState(dir, false), 500);
                    break;
                case 'swingArm':
                    botInstance.swingArm('right');
                    break;
            }
        } catch (e) {}
    }
}

// حماية الكود من الانهيار التام
process.on('unhandledRejection', err => console.error('خطأ غير متوقع Rejection:', err));
process.on('uncaughtException', err => console.error('خطأ غير متوقع Exception:', err));

// تشغيل البوتات
botsData.forEach((config, index) => {
    setTimeout(() => {
        startBot(config);
    }, index * 8000);
});
