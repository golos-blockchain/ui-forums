import tt from 'counterpart';

export default function (config, key) {
    let loc = tt.getLocale();
    if (!config[loc] || !config[loc][key]) loc = 'en';
    return config[loc][key];
}