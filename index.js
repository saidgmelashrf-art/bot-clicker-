const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر ويب متوافق مع نظام الـ Health Check الخاص بـ Railway ---
const app = express();
const PORT = process.env.PORT || 3000; 

app.get('/', (req, res) => res.status(200).send('Minecraft Bots Online 24/7!'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.listen(PORT, '0.0.0.0', () => console.log(`[Express] Listening on port ${PORT}`));

// --- 2. البيانات الأساسية المحمية بالسيرفر والـ Domain النصي الأصلي ---
const botsData = [
    { username: 'GamerPro_247_1', password: 'MyBotPassword123' },
    { username: 'GamerPro_247_2', password: 'MyBotPassword123' }
];

const SERVER_HOST = 'progamer-smp1.play.hosting'; 
const SERVER_PORT = 25856; 

// --- 3. دالة تشغيل البوت المطور ---
function startBot(config) {
    console.log(`[${config.username}] 🔄 جاري بدء المصافحة المستقرة للاتصال بـ ${SERVER_HOST} بإصدار 1.20.4...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: config.username,
        version: "1.20.4", // 👈 تم التغيير إلى 1.20.4 بناءً على طلبك
        auth: 'offline',   // تشغيل الحساب المكرك
        
        // إعدادات مصيرية للتوافق مع استضافة Play.hosting والـ Crossplay
        fakeHost: SERVER_HOST,
        checkTimeoutInterval: 60000, // مهلة انتظار دقيقة لمنع الـ Timeout
        viewDistance: "tiny"
    });

    let actionTimeout;

    // عند الدخول الناجح
    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ 🎉 مبروك! البوت نجح في الدخول واستقر داخل السيرفر بإصدار 1.20.4!`);

        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat(`/register ${config.password} ${config.password}`);
                setTimeout(() => {
                    if (bot && bot.entity) bot.chat(`/login ${config.password}`);
                }, 3000);
            }
        }, 4000);

        scheduleNextAction(bot, config.username);
    });

    bot.on('kicked', (reason) => {
        console.log(`[${config.username}] ❌ تم طرده من السيرفر. السبب: ${JSON.stringify(reason)}`);
    });

    bot.on('error', (err) => {
        console.error(`[${config.username}] 🚨 خطأ في الشبكة:`, err.message);
    });

    bot.on('end', (reason) => {
        console.warn(`[${config.username}] 🔌 انفصل الاتصال (${reason}). إعادة المحاولة بعد 25 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(() => startBot(config), 25000);
    });

    // نظام منع الـ AFK المستقر
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
    setTimeout(() => startBot(config), index * 20000); 
});
