const TelegramBot = require('node-telegram-bot-api')
const request = require('request')
const T = require('./telegram-helper')
const conf = require('./conf')

const
    cache = T.cache,
    commandsAsosiation = {
        'echo': onEcho,
        'start': onStart,
        'id': onId,
        'set': onSet,
        'uset': onUSet,
        'alias': onAlias,
        'req': onReq
    }

let bot

function onReq(msg) {
    let fn = /^([^\s]+)/.exec(msg.text_parsed)

    if (fn) {
        fn = fn[0]

        const url = conf.OPENFAAS_URL + '/' + fn
        const data = T.telegram2json(msg.text_parsed.slice(fn.length))

        request({
            url: url,
            method: 'POST',
            json: data
        }, (err, res, body) => {
            let msgRes = err || new Date().toUTCString() + '\n' + T.json2telegram(body)
            bot.sendMessage(msg.chat.id, msgRes)
        })
    } else
        bot.sendMessage(msg.chat.id, 'Usage: /req <function> [content]')
}

function onStart(msg) {
    if (cache.main_chat != msg.chat.id)
        bot.sendMessage(msg.chat.id, 'Please, confirn you ID on /id <password>')
    else
        bot.sendMessage(msg.chat.id, 'Nice to see you again...')
}

function onId(msg) {
    if (msg.text_parsed != conf.CHAT_PASSWORD)
        bot.sendMessage(msg.chat.id, 'You shall not pass!!')
    else {
        cache.main_chat = msg.chat.id

        T.save((err) => {
            if (err)
                bot.sendMessage(msg.chat.id, 'Error on server:\n' + err)
            else
                bot.sendMessage(msg.chat.id, 'Identified successfully')
        })
    }
}


function onAlias(msg) {
    let txt = ''

    if (msg.text_parsed) {
        if (cache.aliases[msg.text_parsed])
            bot.sendMessage(msg.chat.id, '- ' + a + ' -\n' + cache.aliases[a])
        else
            bot.sendMessage(msg.chat.id, 'Alias ' + msg.text_parsed + ' undefined')
    } else {
        for (a in cache.aliases) {
            if (txt)
                txt += '\n\n'

            txt += '- ' + a + ' -\n' + cache.aliases[a]
        }

        bot.sendMessage(msg.chat.id, 'aliases:\n' + txt)
    }
}

function onSet(msg) {
    let valid, alias = /^([^\s]+)/.exec(msg.text_parsed)

    if (alias) {
        alias = alias[0]
        let value = msg.text_parsed.slice(alias.length).trim()

        if (value) {
            valid = true
            cache.aliases[alias] = value

            T.save((err) => {
                if (err)
                    bot.sendMessage(msg.chat.id, 'Error on server:\n' + err)
                else
                    bot.sendMessage(msg.chat.id, alias + ' now is:\n' + value)
            })
        }
    }

    if (!valid)
        bot.sendMessage(msg.chat.id, 'Usage: /set <alias> <value>')
}

function onUSet(msg) {
    if (msg.text_parsed) {
        if (cache.aliases[msg.text_parsed]) {
            delete cache.aliases[msg.text_parsed]

            T.save((err) => {
                if (err)
                    bot.sendMessage(msg.chat.id, 'Error on server: \n' + err)
                else
                    bot.sendMessage(msg.chat.id, 'Alias deleted successfully')
            })
        } else
            bot.sendMessage(msg.chat.id, 'Alias not defined')
    } else
        bot.sendMessage(msg.chat.id, 'Usage: /uset <alias>')
}

function onEcho(msg) {
    if (msg.text_parsed)
        bot.sendMessage(msg.chat.id, msg.text_parsed)
    else
        bot.sendMessage(msg.chat.id, 'Usage: /echo <content>')
}

function Init(CB) {
    T.Init(commandsAsosiation)
    T.load((err) => {
        if (err)
            return CB(err)

        bot = new TelegramBot(conf.TELEGRAM_TOKEN)
        bot.setWebHook(conf.WEBHOOK_URL)
        bot.on('message', T.messageHandler)

        CB()
    })
}

function Middleware(req, res, next) {
    if (req.originalUrl == conf.WEBHOOK_PATH) {
        bot.processUpdate(req.body)
        res.sendStatus(200)
    } else
        next()
}

function Send(msg) {
    if (cache.main_chat)
        bot.sendMessage(cache.main_chat, msg)
}

module.exports = {
    Init: Init,
    Send: Send,
    Middleware: Middleware
}