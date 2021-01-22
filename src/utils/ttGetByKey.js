import tt from 'counterpart';

tt.registerTranslations('en', require('../locales/en.json'));
tt.registerTranslations('ru', require('../locales/ru-RU.json'));

tt.setLocale(localStorage.getItem('locale') || 'ru');
tt.setFallbackLocale('en');

window._isMobile = /Mobi/.test(navigator.userAgent);

export default function ttGetByKey(config, key) {
    let loc = tt.getLocale();
    if (!config[loc] || !config[loc][key]) loc = 'en';
    return config[loc][key];
}
