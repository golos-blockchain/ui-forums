const config = require('config')
const golos = require('golos-lib-js')

function initGolos() {
    if (!config.has('golos_server_node'))
        throw new Error('Please set golos_server_node in config. Example: wss://api-full.golos.id/ws')
    golos.config.set('websocket', config.get('golos_server_node'))
    golos.config.set('chain_id', config.get('golos_chain_id'))
}

async function initNative() {
    try {
        await golos.importNativeLib()
    } catch (err) {
        console.error('ERROR - cannot load WASM module of golos-lib-js', err)
    }
}

module.exports = {
    initGolos,
    initNative,
}
