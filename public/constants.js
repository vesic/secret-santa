//#region Cache API 
const CACHE_NAME = "secret-santa-cache-v1";
const DATA_CACHE_NAME = 'secret-santa-data-cache-v1';

const FILES_TO_CACHE = [
    // PAGES
    '/',
    'index.html',
    'santas.html',
    'well-done.html',
    'shame.html',

    // STYLES
    'styles.css',

    // SCRIPTS
    'auth.service.js',
    'install.js',
    'register.js',
    'santas.js',
    'network.js',

    // IMAGES
    'images/congrats.svg',
    'images/happy.svg',
    'images/santa_address.svg',
    'images/santa_stamp.svg',
    'images/santa.svg',
    'images/secret_santa_bg.png',
    'images/secret_santa_icon.svg',
    'images/shame.svg',
    'images/thank_you.svg',
    'images/wondering.svg',
];
//#endregion

//#region localForage
const IS_PRESENT_BOUGHT_KEY = 'isPresentBought';
const GIFT_RECEIVER_KEY = 'giftReceiver';
const IS_GAME_FINISHED_KEY = 'isGameFinished';
//#endregion