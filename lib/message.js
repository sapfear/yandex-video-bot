const YOUTUBE_SHORT_HOST = 'youtu.be';
const YOUTUBE_ORIGIN = 'https://www.youtube.com';

export const extractMessage = message => (message.text);
export const getVideoUrl = string => {
    const url = new URL(string);

    if (url.host === YOUTUBE_SHORT_HOST) {
        return `${YOUTUBE_ORIGIN}/watch?v=${url.pathname.split('/')[1]}`;
    }

    return `${url.origin}/watch?v=${url.searchParams.get('v')}`;
};
