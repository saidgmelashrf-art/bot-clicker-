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

// --- 3. دالة تشغيل البوت الآمن من الـ Anti-Cheat ---
function startBot(config) {
    console.log(`[${config.username}] 🔄 جاري فحص العنوان والاتصال التلقائي بـ ${SERVER_HOST}...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        username: config.username,
        version: "1.21.1", 
        auth: 'offline',   
        checkTimeoutInterval: 90000, 
        viewDistance: "tiny",
        // حماية إضافية تمنع البوت من محاولة عمل حسابات فيزياء وهمية قد تسبب الـ Invalid Movement
        physicsEnabled: true 
    });

    let keepAliveInterval;

    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ 🎉 دخل واستقر بنجاح وثبّت حزم الحركة!`);

        // إلغاء تفعيل التحكم لمنع أي حركة خاطئة تسبب طرد من الـ Anti-Cheat
        bot.clearControlStates();

        // إرسال أوامر الشات بتأخير آمن
        setTimeout(() => {
            if (bot && bot.entity) {
                bot.chat(`/register ${config.password} ${config.password}`);
                setTimeout(() => {
                    if (bot && bot.entity) bot.chat(`/login ${config.password}`);
                }, 3000);
            }
        }, 5000);

        // الخدعة البديلة الآمنة: بدلاً من القفز والمشي، نجعله يلتفت فقط للنظر حوله كل 15 ثانية لتبدو حركة من لاعب حقيقي جالس
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        keepAliveInterval = setInterval(async () => {
            if (bot && bot.entity) {
                try {
                    const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
                    const pitch = (Math.random() * 20 - 10) * (Math.PI / 180);
                    await bot.look(yaw, pitch, true);
                } catch (e) {}
            }
        }, 15000);
    });

    bot.on('kicked', (reason) => console.log(`[${config.username}] ❌ طرد: ${JSON.stringify(reason)}`));
    bot.on('error', (err) => console.error(`[${config.username}] 🚨 خطأ شبكة:`, err.message));
    
    bot.on('end', (reason) => {
        console.warn(`[${config.username}] 🔌 انفصل (${reason}). إعادة اتصال خلال 30 ثانية...`);
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        setTimeout(() => startBot(config), 30000);
    });
}

// حماية الكود من الانهيار
process.on('unhandledRejection', err => {});
process.on('uncaughtException', err => {});

botsData.forEach((config, index) => {
    setTimeout(() => startBot(config), index * 25000); 
});
