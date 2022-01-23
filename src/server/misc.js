import { buffer, } from 'micro'
import git from 'git-rev-sync'

function getVersion() {
    try {
        return git.short('.')
    } catch (err) {
        console.error('Cannot obtain .git version:', err)
        return 'dev'
    }
}

const noBodyParser = {
    api: {
        bodyParser: false,
    },
}

async function bodyString(req) {
    return (await buffer(req)).toString()
}

module.exports = {
    getVersion,
    noBodyParser,
    bodyString,
}
