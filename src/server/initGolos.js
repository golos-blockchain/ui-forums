const config = require('config')
const golos = require('golos-lib-js')

function initGolos() {
    if (!process.env.GOLOS_SERVER_NODE)
        throw new Error('Please set GOLOS_SERVER_NODE environment variable in docker-compose.yml (if production) or in package.json (if development). Example: wss://api-full.golos.id/ws')
    golos.config.set('websocket', process.env.GOLOS_SERVER_NODE)
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
