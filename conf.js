const assert = require('assert')

const config = {
    WEBHOOK_ROOT: process.env.WEBHOOK_ROOT,
    MONGODB_URL: process.env.MONGODB_URL,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    OPENFAAS_URL: process.env.OPENFAAS_URL,
    CHAT_PASSWORD: process.env.CHAT_PASSWORD,
    PORT: process.env.PORT || 8080,
    WEBHOOK_PATH: '',
    WEBHOOK_URL: ''
}

config.WEBHOOK_PATH = '/telegram/' + config.TELEGRAM_TOKEN
config.WEBHOOK_URL = config.WEBHOOK_ROOT + config.WEBHOOK_PATH

assert.notEqual(null, config.WEBHOOK_ROOT, 'Environment variable WEBHOOK_ROOT not defined')
assert.notEqual(null, config.MONGODB_URL, 'Environment variable MONGODB_URL not defined')
assert.notEqual(null, config.TELEGRAM_TOKEN, 'Environment variable TELEGRAM_TOKEN not defined')
assert.notEqual(null, config.OPENFAAS_URL, 'Environment variable OPENFAAS_URL not defined')
assert.notEqual(null, config.CHAT_PASSWORD, 'Environment variable CHAT_PASSWORD not defined')

module.exports = config