const mineflayer = require('mineflayer');
const express = require('express');

// --- 1. سيرفر الويب لـ Hugging Face ---
const app = express();
const PORT = process.env.PORT || 7860; 

app.get('/', (req, res) => res.status(200).send('Hugging Face MC Bots Active 24/7!'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.listen(PORT, '0.0.0.0', () => console.log(`[Express] Web Server running on port ${PORT}`));

// --- 2. بيانات البوتات والسيرفر ---
const botsData = [
    { username: 'GamerPro_247_1', password: 'MyBotPassword123' },
    { username: 'GamerPro_247_2', password: 'MyBotPassword123' }
];

const SERVER_HOST = 'progamer-smp1.play.hosting'; 

// --- 3. دالة تشغيل البوت الذكية ---
function startBot(config) {
    console.log(`[${config.username}] 🔄 جاري فحص العنوان والاتصال التلقائي بـ ${SERVER_HOST}...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        username: config.username,
        version: "1.21.1", 
        auth: 'offline',   
        checkTimeoutInterval: 90000, 
        viewDistance: "tiny",
        physicsEnabled: false // معطلة لمنع طرد الـ Invalid Movement
    });

    let afkInterval;

    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ 🎉 دخل البوت واستقر في السيرفر!`);

        if (bot.entity) {
            bot.entity.onGround = true;
        }
        bot.clearControlStates();

        // أوامر الشات بتأخير آمن
        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat(`/register ${config.password} ${config.password}`);
                setTimeout(() => {
                    if (bot && bot.entity) bot.chat(`/login ${config.password}`);
                }, 3000);
            }
        }, 5000);

        // 🔥 ميزة الـ Anti-AFK الآمنة (الانحناء والوقوف في مكانه بدون طرد)
        if (afkInterval) clearInterval(afkInterval);
        afkInterval = setInterval(() => {
            if (bot && bot.entity) {
                // تفعيل الانحناء (Sneak)
                bot.setControlState('sneak', true);
                
                // إلغاء الانحناء بعد ثانية واحدة ليعود لوضعه الطبيعي
                setTimeout(() => {
                    if (bot && bot.entity) bot.setControlState('sneak', false);
                }, 1000);
            }
        }, 30000); // تتكرر كل 30 ثانية لتجديد النشاط بالسيرفر
    });

    bot.on('kicked', (reason) => {
        console.log(`[${config.username}] ❌ طرد: ${JSON.stringify(reason)}`);
    });
    
    bot.on('error', (err) => {
        console.error(`[${config.username}] 🚨 خطأ شبكة:`, err.message);
    });
    
    // 🔥 ميزة الانتظار 10 ثوانٍ عند الريستارت أو قفل السيرفر
    bot.on('end', (reason) => {
        if (afkInterval) clearInterval(afkInterval);
        
        console.warn(`[${config.username}] 🔌 انفصل الاتصال بسبب (${reason}). السيرفر قد يكون في حالة ريستارت...`);
        console.log(`[${config.username}] ⏱️ جاري الانتظار لمدة 10 ثوانٍ قبل إعادة الدخول...`);
        
        setTimeout(() => {
            console.log(`[${config.username}] 🔄 جاري محاولة إعادة الدخول الآن بعد انتهاء الـ 10 ثوانٍ...`);
            startBot(config);
        }, 10000); // 10000 جزء من الثانية تعني 10 ثوانٍ بالضبط
    });
}

// حماية الحاوية
process.on('unhandledRejection', err => {});
process.on('uncaughtException', err => {});

// تشغيل البوتات بفواصل متباعد عند الإقلاع الأول
botsData.forEach((config, index) => {
    setTimeout(() => startBot(config), index * 25000); 
});
