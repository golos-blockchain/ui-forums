import tt from 'counterpart';

tt.registerTranslations('en', require('../locales/en.json'));
tt.registerTranslations('ru', require('../locales/ru-RU.json'));

tt.setLocale((typeof(localStorage) !== 'undefined' && localStorage.getItem('locale')) || 'ru');
tt.setFallbackLocale('en');

if (typeof(window) !== 'undefined') {
    window.IS_MOBILE = typeof(navigator) === 'undefined' ? false : /Mobi/.test(navigator.userAgent) || window.innerWidth < 765;
}

export default function ttGetByKey(config, key) {
    let loc = tt.getLocale();
    if (!config[loc] || !config[loc][key]) loc = 'en';
    return config[loc][key];
}
