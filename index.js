const bedrock = require('bedrock-protocol');
const express = require('express');

// --- 1. سيرفر ويب متوافق مع نظام الـ Health Check الخاص بـ Railway ---
const app = express();
const PORT = process.env.PORT || 3000; 

app.get('/', (req, res) => res.status(200).send('Bedrock Bots Online 24/7!'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.listen(PORT, '0.0.0.0', () => console.log(`[Express] السيرفر يعمل بنجاح على البورت: ${PORT}`));

// --- 2. بيانات البوتات (حسابات الجوال المكركة) ---
const botsData = [
    { username: 'GamerPro_247_1', password: 'MyBotPassword123' },
    { username: 'GamerPro_247_2', password: 'MyBotPassword123' }
];

// استضافة Play.hosting تستخدم بورت الجوال الافتراضي للكروس بلاي
const SERVER_HOST = 'progamer-smp1.play.hosting'; 
const SERVER_PORT = 19132; // 👈 بورت البدروك الإجباري لتخطي الحظر نهائياً

// --- 3. دالة تشغيل بوت البدروك ---
function startBot(config) {
    console.log(`[${config.username}] 📱 جاري الدخول بنظام البدروك (الجوال) لتخطي حظر الـ Java...`);

    const client = bedrock.createClient({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: config.username,
        offline: true, // الحساب مكرك
        skipPing: false
    });

    let keepAliveInterval;

    // عند النجاح في الاتصال والولادة داخل السيرفر
    client.on('spawn', () => {
        console.log(`[${config.username}] ✅ 🎉 مبروك! البوت دخل السيرفر بنجاح كلاعب جوال عبر Railway!`);

        // إرسال أوامر التسجيل والدخول في الشات
        setTimeout(() => {
            client.queue('text', {
                type: 'chat', needs_translation: false, source_name: config.username, xuid: '', platform_chat_id: '',
                message: `/register ${config.password} ${config.password}`
            });
            
            setTimeout(() => {
                client.queue('text', {
                    type: 'chat', needs_translation: false, source_name: config.username, xuid: '', platform_chat_id: '',
                    message: `/login ${config.password}`
                });
            }, 3000);
        }, 4000);

        // نظام إرسال حزم الحركة عشوائياً (Anti-AFK) لمنع الطرد
        keepAliveInterval = setInterval(() => {
            // إرسال حزمة حركة وهمية خفيفة للسيرفر للحفاظ على الاتصال 24 ساعة
            client.queue('player_auth_input', {
                pitch: 0, yaw: Math.random() * 360,
                position: { x: 0, y: 0, z: 0 },
                move_vector: { x: 0, z: 0 },
                modifier_id: 0, input_data: { sneak: Math.random() > 0.5 },
                input_mode: 'mouse', play_mode: 'normal', tick: 0n
            });
        }, 15000);
    });

    // التعامل مع الأخطاء والانفصال
    client.on('error', (err) => {
        console.error(`[${config.username}] 🚨 خطأ شبكة البدروك:`, err.message);
    });

    client.on('close', () => {
        console.warn(`[${config.username}] 🔌 انفصل الاتصال. إعادة المحاولة خلال 30 ثانية...`);
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        setTimeout(() => startBot(config), 30000);
    });
}

// حماية الخدمة من الكراش
process.on('unhandledRejection', err => console.error('Bedrock Exception:', err.message || err));
process.on('uncaughtException', err => console.error('Bedrock Exception:', err.message || err));

// تشغيل البوتات بفارق زمني متباعد
botsData.forEach((config, index) => {
    setTimeout(() => startBot(config), index * 20000); 
});
