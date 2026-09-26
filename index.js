const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر ويب متوافق مع نظام الـ Health Check الخاص بـ Railway ---
const app = express();
// Railway يقوم بتمرير البورت تلقائياً عبر متغيرات البيئة، وإلا سيعمل على 3000
const PORT = process.env.PORT || 3000; 

app.get('/', (req, res) => {
    res.status(200).send('Railway Minecraft Bots are Online 24/7!');
});

// هذا المسار يضمن لـ Railway أن الخدمة مستقرة ولا تموت في الخلفية
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express] السيرفر يعمل بنجاح ومستعد لاستقبال اتصالات Railway على البورت: ${PORT}`);
});

// --- 2. بيانات البوتات وضبط الاتصال الرقمي المستخرج ---
const botsData = [
    { username: 'GamerPro_247_1', password: 'MyBotPassword123' },
    { username: 'GamerPro_247_2', password: 'MyBotPassword123' }
];

// استخدام الآي بي الرقمي المباشر الذي استخرجناه لتخطي تعليق الاتصال في Railway
const SERVER_HOST = '62.141.62.8'; 
const SERVER_PORT = 25856;

// --- 3. دالة تشغيل البوت ---
function startBot(config) {
    console.log(`[${config.username}] 🔄 جاري محاولة الاتصال بـ ${SERVER_HOST}:${SERVER_PORT}...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: config.username,
        version: "1.20.1", // ⚠️ تأكد أن هذا هو إصدار سيرفرك بالضبط (غيره إذا كان سيرفرك 1.21 مثلاً)
        auth: 'offline',   // لتشغيل الحسابات المكركة
        checkTimeoutInterval: 45000, // مهلة انتظار حزم البيانات لمنع تعليق الحاوية
        respawn: true
    });

    let actionTimeout;

    // عند الدخول الناجح للسيرفر
    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ دخل سيرفر ماين كرافت بنجاح على Railway!`);

        // تأخير ذكي للأوامر لمنع نظام الحماية بالسيرفر من طرد البوت (Anti-Spam)
        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat(`/register ${config.password} ${config.password}`);
                
                setTimeout(() => {
                    if (bot && bot.entity) bot.chat(`/login ${config.password}`);
                }, 2500);
            }
        }, 3000);

        scheduleNextAction(bot, config.username);
    });

    // كاشف الطرد المباشر (Kick) مع طباعة السبب
    bot.on('kicked', (reason) => {
        console.log(`[${config.username}] ❌ تم طرده! السبب: ${JSON.stringify(reason)}`);
    });

    // كاشف أخطاء الشبكة والاتصال
    bot.on('error', (err) => {
        console.error(`[${config.username}] 🚨 خطأ في الاتصال بالشبكة:`, err.message);
    });

    // إعادة الاتصال التلقائي الآمن عند الانفصال
    bot.on('end', (reason) => {
        console.warn(`[${config.username}] 🔌 انفصل الاتصال بسبب (${reason}). إعادة المحاولة خلال 20 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(() => startBot(config), 20000);
    });

    // نظام الحركة العشوائية المستقر لمنع الـ AFK والـ Anti-Cheat
    function scheduleNextAction(botInstance, name) {
        const randomDelay = Math.floor(Math.random() * (20000 - 10000)) + 10000;
        actionTimeout = setTimeout(async () => {
            if (botInstance && botInstance.entity) {
                await performAction(botInstance);
            }
            scheduleNextAction(botInstance, name);
        }, randomDelay);
    }

    async function performAction(botInstance) {
        const actions = ['jump', 'lookAround', 'swingArm'];
        const chosenAction = actions[Math.floor(Math.random() * actions.length)];
        try {
            switch (chosenAction) {
                case 'jump':
                    botInstance.setControlState('jump', true);
                    setTimeout(() => botInstance.setControlState('jump', false), 300);
                    break;
                case 'lookAround':
                    const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
                    const pitch = (Math.random() * 40 - 20) * (Math.PI / 180);
                    await botInstance.look(yaw, pitch, true);
                    break;
                case 'swingArm':
                    botInstance.swingArm('right');
                    break;
            }
        } catch (e) {}
    }
}

// حماية حاوية Railway من الانهيار التام عند حدوث خطأ مفاجئ غير متوقع
process.on('unhandledRejection', err => console.error('Railway Safety Exception:', err));
process.on('uncaughtException', err => console.error('Railway Safety Exception:', err));

// تشغيل البوتات بفارق زمني متباعد لمنع حجب الآيبيهات (IP Block)
botsData.forEach((config, index) => {
    setTimeout(() => {
        startBot(config);
    }, index * 12000);
});
