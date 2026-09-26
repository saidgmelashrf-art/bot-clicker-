const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر الويب لـ Hugging Face لمنع توقف الـ Space ---
const app = express();
const PORT = process.env.PORT || 7860; // Hugging Face يستخدم بورت 7860 افتراضياً

app.get('/', (req, res) => res.status(200).send('Hugging Face MC Bots Active 24/7!'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.listen(PORT, '0.0.0.0', () => console.log(`[Express] Web Server running on port ${PORT}`));

// --- 2. بيانات البوتات والسيرفر ---
const botsData = [
    { username: 'GamerPro_247_1', password: 'MyBotPassword123' },
    { username: 'GamerPro_247_2', password: 'MyBotPassword123' }
];

// الحل السحري: نكتب الـ Host النصي فقط ونترك المكتبة تكتشف البورت الفعلي تلقائياً لتفادي الـ Timeout
const SERVER_HOST = 'progamer-smp1.play.hosting'; 

// --- 3. دالة تشغيل البوت ---
function startBot(config) {
    console.log(`[${config.username}] 🔄 جاري فحص العنوان والاتصال التلقائي بـ ${SERVER_HOST}...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        // ⚠️ تركنا الـ port فارغاً هنا لتجعل المكتبة تبحث عن البورت الفعلي الشغال حالياً بالسيرفر تلقائياً
        username: config.username,
        version: "1.21.1", // إصدار السيرفر
        auth: 'offline',   // مكرك
        checkTimeoutInterval: 90000, // مهلة دقيقة ونصف كاملة للمصافحة المستقرة
        viewDistance: "tiny"
    });

    let actionTimeout;

    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ 🎉 مبروك! البوت كسر حظر Hugging Face ودخل السيرفر بنجاح!`);

        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat(`/register ${config.password} ${config.password}`);
                setTimeout(() => {
                    if (bot && bot.entity) bot.chat(`/login ${config.password}`);
                }, 2500);
            }
        }, 4000);

        scheduleNextAction(bot, config.username);
    });

    bot.on('kicked', (reason) => console.log(`[${config.username}] ❌ طرد: ${JSON.stringify(reason)}`));
    bot.on('error', (err) => console.error(`[${config.username}] 🚨 خطأ شبكة (Error):`, err.message));
    
    bot.on('end', (reason) => {
        console.warn(`[${config.username}] 🔌 انفصل (${reason}). إعادة اتصال خلال 30 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(() => startBot(config), 30000);
    });

    function scheduleNextAction(botInstance, name) {
        const randomDelay = Math.floor(Math.random() * (20000 - 15000)) + 15000;
        actionTimeout = setTimeout(async () => {
            if (botInstance && botInstance.entity) {
                const actions = ['jump', 'lookAround', 'swingArm'];
                const chosenAction = actions[Math.floor(Math.random() * actions.length)];
                try {
                    if (chosenAction === 'jump') {
                        botInstance.setControlState('jump', true);
                        setTimeout(() => botInstance.setControlState('jump', false), 200);
                    } else if (chosenAction === 'lookAround') {
                        await botInstance.look((Math.random() * 360 - 180) * (Math.PI / 180), (Math.random() * 30 - 15) * (Math.PI / 180), true);
                    } else if (chosenAction === 'swingArm') {
                        botInstance.swingArm('right');
                    }
                } catch (e) {}
            }
            scheduleNextAction(botInstance, name);
        }, randomDelay);
    }
}

process.on('unhandledRejection', err => console.error('Exception Intercepted:', err.message || err));
process.on('uncaughtException', err => console.error('Exception Intercepted:', err.message || err));

botsData.forEach((config, index) => {
    setTimeout(() => startBot(config), index * 25000); 
});
