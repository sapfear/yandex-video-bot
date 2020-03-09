// Подключаем библиотеку для работы с Telegram API в переменную
import TelegramBot from 'node-telegram-bot-api';
import { extractMessage, getVideoUrl } from './lib/message';
import {
    sendVideo,
    isAuthorized,
    passportLogin,
    pushPassword,
    getCSRFToken,
    getDeviceList,
} from './lib/yandex';

// Устанавливаем токен, который выдавал нам бот
// https://tele.gs/botfather
const token = '' || process.env.TOKEN;
// Включить опрос сервера. Бот должен обращаться к серверу Telegram, чтобы получать актуальную информацию
// Подробнее: https://core.telegram.org/bots/api#getupdates
const bot = new TelegramBot(token, { polling: true });

const STATES = {
    LOGIN: 'login',
    PASSWORD: 'password',
    DEFAULT: 'default',
};
const ADMIN_LOGIN = 'sappfear';
const WHITE_LIST = ['sappfear'];
const COMMANDS = ['/login', '/password'];
const userStates = new Map();

const loginProcess = async (login, fromId) => {
    const canAuthorize = await passportLogin(login);

    if (!canAuthorize) {
        await bot.sendMessage(fromId, 'You need enable OTP authorization mode');
        userStates.set(fromId, STATES.DEFAULT);
        return;
    }

    userStates.set(fromId, STATES.PASSWORD);
    return bot.sendMessage(fromId, 'Please type OTP code');
};

const passwordProcess = async (password, fromId) => {
    const isPasswordCorrect = await pushPassword(password);

    if (!isPasswordCorrect) {
        return bot.sendMessage(fromId, 'Incorrect password. Try again');
    }

    userStates.set(fromId, STATES.DEFAULT);

    await bot.sendMessage(fromId, 'Password correct');
    await getCSRFToken()
        .then(() => bot.sendMessage(fromId, 'Getted CSRF token'));

    const devices = await getDeviceList();
    await bot.sendMessage(fromId, 'Getted device list');

    if (devices.length === 0) {
        return bot.sendMessage(fromId, 'Not found any screen capable device');
    }

    await bot.sendMessage(fromId, 'Devices: ' +
        devices.map((device, i) => `\n${i} - ${device.name} - ${device.online ? 'online' : 'offline'}`).join('')
    );

    if (devices.filter(device => device.online).length === 0) {
        return bot.sendMessage(fromId, 'Not found any online device');
    }

    return bot.sendMessage(fromId,
        'By default active device setted to #0\n' +
        'You can set active device by /set_device <number>'
    );
};

bot.onText(/\/login/, async function (msg) {
    const { username, id: fromId } = msg.from; // Получаем ID отправителя

    if (ADMIN_LOGIN !== username) {
        return bot.sendMessage(fromId, 'Login command only for admin user');
    }

    userStates.set(fromId, STATES.LOGIN);
    return bot.sendMessage(fromId, 'Please type you YNDX login');
});

// Простая команда без параметров
bot.on('message', async function (msg) {
    const { id: fromId } = msg.from; // Получаем ID отправителя
    const messageText = extractMessage(msg);

    if (COMMANDS.some(command => msg.text.startsWith(command))) {
        return;
    }

    if (WHITE_LIST.length && !WHITE_LIST.includes(msg.from.username)) {
        return;
    }

    switch (userStates.get(fromId)) {
        case STATES.LOGIN:
            return loginProcess(messageText, fromId);
        case STATES.PASSWORD:
            return passwordProcess(messageText, fromId);
        case STATES.DEFAULT:
        default:
            if (!isAuthorized()) {
                return bot.sendMessage(fromId, 'Need /login <login> first');
            }

            const youtubeUrl = getVideoUrl(messageText);

            await sendVideo(youtubeUrl);

            return bot.sendMessage(fromId, 'Video sended');
    }
});

bot.on('polling_error', (error) => {
    console.log(error);
    console.log(error.code);  // => 'EFATAL'
});
