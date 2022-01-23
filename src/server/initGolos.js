const golos = require('golos-lib-js')
const CONFIG = require('../config')

function initGolos() {
    if (!process.env.GOLOS_SERVER_NODE)
        throw new Error('Please set GOLOS_SERVER_NODE environment variable in docker-compose.yml (if production) or in package.json (if development). Example: wss://api-full.golos.id/ws')
    golos.config.set('websocket', process.env.GOLOS_SERVER_NODE)
    golos.config.set('chain_id', CONFIG.golos_chain_id)
}

async function initNative() {
    try {
        console.time('wasm')
        await golos.importNativeLib()
        console.timeEnd('wasm')
    } catch (err) {
        console.error('ERROR - cannot load WASM module of golos-lib-js', err)
    }
}

module.exports = {
    initGolos,
    initNative,
}
