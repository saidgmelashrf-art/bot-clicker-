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

const SERVER_HOST = 'Progamer-Smp.aternos.me';
const SERVER_PORT = 29801;

// --- 3. دالة تشغيل البوت ---
function startBot(config) {
    console.log(`جاري تشغيل البوت: ${config.username}...`);

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: config.username,
        version: false
    });

    let actionTimeout;

    bot.on('spawn', () => {
        console.log(`[${config.username}] دخل السيرفر بنجاح!`);

        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
        }, 2000);

        scheduleNextAction(bot, config.username);
    });

    function scheduleNextAction(botInstance, name) {
        const randomDelay = Math.floor(Math.random() * (20000 - 5000)) + 5000;

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
                    const pitch = (Math.random() * 90 - 45) * (Math.PI / 180);
                    await botInstance.look(yaw, pitch, true);
                    break;
                case 'walk':
                    const dir = Math.random() > 0.5 ? 'forward' : 'back';
                    botInstance.setControlState(dir, true);
                    setTimeout(() => botInstance.setControlState(dir, false), Math.floor(Math.random() * 1500) + 500);
                    break;
                case 'swingArm':
                    botInstance.swingArm('right');
                    break;
            }
        } catch (e) {}
    }

    bot.on('end', (reason) => {
        console.warn(`[${config.username}] فصل الاتصال: ${reason}. إعادة المحاولة بعد 15 ثانية...`);
        if (actionTimeout) clearTimeout(actionTimeout);
        setTimeout(() => startBot(config), 15000);
    });

    bot.on('error', (err) => {
        console.error(`[${config.username}] خطأ:`, err.message);
    });
}

// حماية من انهيار السيرفر
process.on('unhandledRejection', err => console.error('Unhandled Error:', err));
process.on('uncaughtException', err => console.error('Uncaught Error:', err));

// تشغيل البوتين بفارق 5 ثوانٍ
botsData.forEach((config, index) => {
    setTimeout(() => {
        startBot(config);
    }, index * 5000);
});

