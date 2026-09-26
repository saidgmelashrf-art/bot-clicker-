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

// --- 3. دالة تشغيل البوت المضادة تماماً للـ Anti-Cheat ---
function startBot(config) {
    console.log(`[${config.username}] 🔄 جاري فحص العنوان والاتصال التلقائي بـ ${SERVER_HOST}...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        username: config.username,
        version: "1.21.1", 
        auth: 'offline',   
        checkTimeoutInterval: 90000, 
        viewDistance: "tiny",
        
        // ⚠️ الخدعة الأولى: تعطيل الفيزياء المبدئية تماماً لمنع محاكاة الجاذبية الخاطئة في الكود
        physicsEnabled: false 
    });

    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ 🎉 دخل واستقر بنجاح وثبّت حزم الحركة!`);

        // ⚠️ الخدعة الثانية: إجبار السيرفر على قراءة البوت كلاعب واقف بثبات على الأرض
        if (bot.entity) {
            bot.entity.onGround = true;
        }

        // إلغاء تفعيل أي تحكمات أو حركات وهمية قد تسبب الطرد
        bot.clearControlStates();

        // إرسال أوامر الشات بتأخير آمن ومريح للسيرفر لتفادي الحظر
        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat(`/register ${config.password} ${config.password}`);
                setTimeout(() => {
                    if (bot && bot.entity) bot.chat(`/login ${config.password}`);
                }, 3000);
            }
        }, 5000);
    });

    // كاشف الأخطاء والطرد
    bot.on('kicked', (reason) => {
        console.log(`[${config.username}] ❌ طرد: ${JSON.stringify(reason)}`);
    });
    
    bot.on('error', (err) => {
        console.error(`[${config.username}] 🚨 خطأ شبكة:`, err.message);
    });
    
    bot.on('end', (reason) => {
        console.warn(`[${config.username}] 🔌 انفصل (${reason}). إعادة اتصال خلال 30 ثانية...`);
        setTimeout(() => startBot(config), 30000);
    });
}

// حماية حاوية التشغيل من الانهيار والسكوت
process.on('unhandledRejection', err => {});
process.on('uncaughtException', err => {});

// تشغيل البوتات بفواصل متباعدة جداً (25 ثانية) لضمان عدم رصد الـ IP من الحماية
botsData.forEach((config, index) => {
    setTimeout(() => startBot(config), index * 25000); 
});
