import request from 'request-promise';

const YANDEX_PASSPORT_HOSTS = {
    INIT: 'https://passport.yandex.ru/auth?retpath=https%3A%2F%2Fpassport.yandex.ru%2Fprofile&noreturn=1',
    START: 'https://passport.yandex.ru/registration-validations/auth/multi_step/start',
    PASSWORD: 'https://passport.yandex.ru/registration-validations/auth/multi_step/commit_password',
    PROFILE: 'https://passport.yandex.ru/profile'
};
const YANDEX_CSRF_POINT = 'https://frontend.vh.yandex.ru/csrf_token';
const YANDEX_VIDEO_API_POINT = 'https://yandex.ru/video/station';
const YANDEX_DEVICES_ONLINE_API_POINT = 'https://quasar.yandex.ru/devices_online_stats';

const jarStore = request.jar();

let X_CSRF_TOKEN = '';
let lastLoginResponse;
let loginCSRF = '';
let devices = [];
let activeDevice = 0;

export const getDeviceList = async () => {
    const list = await request({
        uri: YANDEX_DEVICES_ONLINE_API_POINT,
        jar: jarStore,
    });

    devices = JSON.parse(list).items.filter(device => device.screen_capable);

    return devices;
};

export const getCSRFToken = async () => {
    X_CSRF_TOKEN = await request({
        uri: YANDEX_CSRF_POINT,
        jar: jarStore,
    });
};

export const isAuthorized = () => Boolean(X_CSRF_TOKEN);

export const sendVideo = async youtubeUrl => {
    const headers = {
        'x-csrf-token': X_CSRF_TOKEN,
    };

    await request({
        method: 'POST',
        uri: YANDEX_VIDEO_API_POINT,
        body: {
            msg: {
                provider_item_id: youtubeUrl,
                player_id: 'youtube',
                type: 'video',
            },
            device: devices[activeDevice].id
        },
        headers,
        jar: jarStore,
        json: true
    })
};

export const passportLogin = async login => {
    const initResponse = await request({
        method: 'GET',
        uri: YANDEX_PASSPORT_HOSTS.INIT,
        jar: jarStore
    });

    const processUID = initResponse
        .toString()
        .match(/process_uuid=([a-z\d-])*/g)[0]
        .split('=')[1];

    loginCSRF = initResponse
        .toString()
        .match(/name=\"csrf_token\" value=\"([a-z\d-:])*\"/g)[0]
        .match(/([a-z\d-])*:([a-z\d-])*/)[0];

    lastLoginResponse = await request({
        method: 'POST',
        uri: YANDEX_PASSPORT_HOSTS.START,
        form: {
            csrf_token: loginCSRF,
            login,
            process_uuid: processUID,
            retpath: YANDEX_PASSPORT_HOSTS.PROFILE
        },
        jar: jarStore,
        json: true
    });

    return Boolean(
        lastLoginResponse &&
        lastLoginResponse.can_authorize &&
        lastLoginResponse.auth_methods.includes('otp')
    );
};

export const pushPassword = async password => {
    const passwordCommitResponse = await request({
        method: 'POST',
        uri: YANDEX_PASSPORT_HOSTS.PASSWORD,
        form: {
            csrf_token: loginCSRF,
            track_id: lastLoginResponse.track_id,
            password,
        },
        jar: jarStore,
        json: true
    });

    return Boolean(passwordCommitResponse && passwordCommitResponse.status === 'ok');
};
