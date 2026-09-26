const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر الويب لضمان الجاهزية في Railway ---
const app = express();
const PORT = process.env.PORT || 3000; 

app.get('/', (req, res) => res.status(200).send('Play.hosting Bots Active 24/7!'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.listen(PORT, '0.0.0.0', () => console.log(`[Express] السيرفر يعمل على بورت ${PORT}`));

// --- 2. البيانات الرسمية للسيرفر (بالاعتماد على الـ Domain النصي حصراً) ---
const botsData = [
    { username: 'GamerPro_247_1', password: 'MyBotPassword123' },
    { username: 'GamerPro_247_2', password: 'MyBotPassword123' }
];

// استخدام الـ Domain الأصلي طبقاً لتعليمات الاستضافة الرسمية لتجنب الـ Timeout
const SERVER_HOST = 'progamer-smp1.play.hosting'; 
const SERVER_PORT = 25856; 

// --- 3. دالة تشغيل البوت الذكية ---
function startBot(config) {
    console.log(`[${config.username}] 🔄 جاري محاولة اختراق جدار الحماية والاتصال بالـ Domain...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: config.username,
        version: "1.21.1", // النسخة المطابقة تماماً لسيرفرك
        auth: 'offline',   
        
        // الخدع المصيرية الموصى بها على Reddit لتخطي حماية الاستضافات المجانية:
        viewDistance: 'tiny', // تقليل حزم الموارد المطلوبة من السيرفر فور الدخول
        checkTimeoutInterval: 120000, // رفع مهلة الانتظار لدقيقتين كاملتين لضمان استقرار المصافحة
        
        // إيهام نظام الـ Crossplay بأن البوت قادم من مشغل طبيعي
        fakeHost: SERVER_HOST
    });

    let actionTimeout;

    // الدخول الناجح
    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ 🎉 تم الاتصال بنجاح ودخل البوت السيرفر!`);

        // تأخير زمني متباعد لتفادي الـ Anti-Spam الخاص بالاستضافة
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

    // مراقبة أحداث الطرد أو الفشل
    bot.on('kicked', (reason) => {
        console.log(`[${config.username}] ❌ تم رفض الدخول/الطرد من السيرفر. السبب: ${JSON.stringify(reason)}`);
    });

    bot.on('error', (err) => {
        console.error(`[${config.username}] 🚨 فشل الاتصال بالشبكة (Error):`, err.message);
    });

    bot.on('end', (reason) => {
        console.warn(`[${config.username}] 🔌 انفصل الاتصال (${reason}). إعادة المحاولة بعد 30 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(() => startBot(config), 30000);
    });

    // نظام منع الـ AFK
    function scheduleNextAction(botInstance, name) {
        const randomDelay = Math.floor(Math.random() * (20000 - 15000)) + 15000;
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
                    setTimeout(() => botInstance.setControlState('jump', false), 200);
                    break;
                case 'lookAround':
                    const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
                    const pitch = (Math.random() * 30 - 15) * (Math.PI / 180);
                    await botInstance.look(yaw, pitch, true);
                    break;
                case 'swingArm':
                    botInstance.swingArm('right');
                    break;
            }
        } catch (e) {}
    }
}

// حماية حاوية ريلواي من الانهيار
process.on('unhandledRejection', err => console.error('Caught Exception:', err.message || err));
process.on('uncaughtException', err => console.error('Caught Exception:', err.message || err));

// تشغيل البوتات بفارق متباعد جداً (25 ثانية) لضمان تخطي جدار الحماية الذكي للـ Crossplay
botsData.forEach((config, index) => {
    setTimeout(() => {
        startBot(config);
    }, index * 25000); 
});
