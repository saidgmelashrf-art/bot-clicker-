const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر HTTP لضمان تشغيل البوتين معاً 24/7 ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Both Minecraft Bots are Active 24/7!');
});

app.listen(PORT, () => console.log(`Keep-Alive running on port ${PORT}`));

// --- 2. بيانات البوتين ---
const botsData = [
    { username: 'ProBot_247_1', password: 'MyBotPassword123' },
    { username: 'ProBot_247_2', password: 'MyBotPassword123' }
];

const SERVER_HOST = 'progamer-smp1.play.hosting';
const SERVER_PORT = 25856;

// --- 3. دالة تشغيل البوت ---
function startBot(config) {
    console.log(`جاري تشغيل البوت: ${config.username}...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: config.username,
        version: false // سيتعرف البوت تلقائياً على إصدار السيرفر
    });

    let actionTimeout;

    bot.on('spawn', () => {
        console.log(`[${config.username}] دخل السيرفر بنجاح!`);

        // تعديل مهم: إرسال الـ register أولاً، ثم الـ login بعده بثانيتين لتجنب الطرد (Spam)
        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat(`/register ${config.password} ${config.password}`);
                
                setTimeout(() => {
                    if (bot && bot.entity) bot.chat(`/login ${config.password}`);
                }, 2000);
            }
        }, 2000);

        scheduleNextAction(bot, config.username);
    });

    function scheduleNextAction(botInstance, name) {
        // وقت عشوائي بين 8 إلى 25 ثانية لتبدو الحركة طبيعية للـ Anti-Cheat
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
                    const pitch = (Math.random() * 60 - 30) * (Math.PI / 180); // تقليل زاوية الرأس للأعلى والأسفل لتبدو طبيعية
                    await botInstance.look(yaw, pitch, true);
                    break;
                case 'walk':
                    const dir = Math.random() > 0.5 ? 'forward' : 'back';
                    botInstance.setControlState(dir, true);
                    // المشي لفترة قصيرة جداً (نصف ثانية) لتجنب السقوط في الحفر أو الـ Lava
                    setTimeout(() => botInstance.setControlState(dir, false), 500);
                    break;
                case 'swingArm':
                    botInstance.swingArm('right');
                    break;
            }
        } catch (e) {}
    }

    // التعامل مع الفصل المفاجئ بأمان
    bot.on('end', (reason) => {
        console.warn(`[${config.username}] فصل الاتصال: ${reason}. إعادة المحاولة بعد 15 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(() => startBot(config), 15000);
    });

    bot.on('error', (err) => {
        console.error(`[${config.username}] خطأ:`, err.message);
    });
}

// حماية من انهيار السيرفر بأكمله عند حدوث خطأ غير متوقع
process.on('unhandledRejection', err => console.error('Unhandled Error:', err));
process.on('uncaughtException', err => console.error('Uncaught Error:', err));

// تشغيل البوتين بفارق 7 ثوانٍ لضمان عدم ضغط السيرفر أثناء الدخول
botsData.forEach((config, index) => {
    setTimeout(() => {
        startBot(config);
    }, index * 7000);
});
