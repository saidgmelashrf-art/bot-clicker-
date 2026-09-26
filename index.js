const mineflayer = require('mineflayer');
const express = require('express');
const SocksClient = require('socks').SocksClient; // مكتبة توجيه الاتصال عبر البروكسي

// --- 1. سيرفر الويب لـ Railway ---
const app = express();
const PORT = process.env.PORT || 3000; 

app.get('/', (req, res) => res.status(200).send('Play.hosting Proxied Bots Active!'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.listen(PORT, '0.0.0.0', () => console.log(`[Express] Listening on port ${PORT}`));

// --- 2. الإعدادات الأساسية وإصدار السيرفر ---
const botsData = [
    { username: 'GamerPro_247_1', password: 'MyBotPassword123' },
    { username: 'GamerPro_247_2', password: 'MyBotPassword123' }
];

const SERVER_HOST = 'progamer-smp1.play.hosting'; 
const SERVER_PORT = 25856; 

// ⚠️ بيانات البروكسي (SOCKS5): ضع هنا بيانات أي بروكسي مجاني أو مدفوع نوعه SOCKS5 لتخطي الحظر
const PROXY_HOST = 'ضع_آي_بي_البروكسي_هنا';
const PROXY_PORT = 1080; // بورت البروكسي المعتاد (غيره حسب بورت البروكسي الخاص بك)

// --- 3. دالة تشغيل البوت عبر البروكسي ---
function startBot(config) {
    console.log(`[${config.username}] 🔄 جاري بدء الاتصال المُموّه عبر البروكسي لتخطي الـ Timeout...`);

    const bot = mineflayer.createBot({
        username: config.username,
        host: SERVER_HOST,
        port: SERVER_PORT,
        version: "1.21.1", // تحديث النسخة لـ 1.21.1 المطابقة لسيرفرك
        auth: 'offline',

        // 🔥 حقن دالة الاتصال بالبروكسي لتخطي حظر Data Center في Railway
        connect: (client) => {
            SocksClient.createConnection({
                proxy: {
                    host: PROXY_HOST,
                    port: parseInt(PROXY_PORT),
                    type: 5 // النوع 5 يعني SOCKS5
                },
                command: 'connect',
                destination: {
                    host: SERVER_HOST,
                    port: parseInt(SERVER_PORT)
                }
            }, (err, info) => {
                if (err) {
                    console.error(`[${config.username}] ❌ خطأ في اتصال البروكسي الموفر:`, err.message);
                    return;
                }
                // تسليم المقبس النظيف لـ Mineflayer بعد نجاح قفزة البروكسي
                client.setSocket(info.socket);
                client.emit('connect');
            });
        },
        checkTimeoutInterval: 60000
    });

    let actionTimeout;

    // حدث الدخول الناجح
    bot.on('spawn', () => {
        console.log(`[${config.username}] ✅ 🎉 تخطى الحماية ودخل السيرفر بنجاح عبر البروكسي!`);

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
    bot.on('error', (err) => console.error(`[${config.username}] 🚨 خطأ:`, err.message));
    
    bot.on('end', (reason) => {
        console.warn(`[${config.username}] 🔌 انفصل (${reason}). إعادة اتصال بعد 30 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(() => startBot(config), 30000);
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
