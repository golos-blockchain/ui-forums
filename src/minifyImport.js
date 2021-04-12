const fs = require('fs');
const CONFIG_SEC = require('../configSecure.js');

let CONFIG = {
    anti_phishing: CONFIG_SEC.anti_phishing,
};

fs.writeFileSync('configSecure.min.js', 'module.exports = ' + JSON.stringify(CONFIG));
