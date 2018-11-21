const MongoClient = require('mongodb').MongoClient
const async = require('async')
const yaml = require('js-yaml')
const conf = require('./conf')

const
    commands = [],
    options = {
        useNewUrlParser: true
    },
    cache = {
        _id: 0,
        main_chat: 0,
        aliases: {}
    }

let regexp

function json2telegram(content) {
    try {
        const txt = yaml.dump(content)

        if (txt.length > 3999)
            return txt.slice(0, 3990) + '[...]'
        else
            return txt
    } catch (e) {
        return content
    }
}

function telegram2json(content) {
    let res = {}
    let params = content.split('\n').map(n => n.trim()).filter(n => n != '')
    for (p of params) {
        const position = p.indexOf(' ')
        if (position == -1)
            res[p] = true
        else {
            const key = p.slice(0, position).trim()
            const value = p.slice(position + 1).trim()
            res[key] = value
        }
    }

    return res
}

function newCommand(cmd, commandsAsosiation) {
    const exp = new RegExp('^\\/' + cmd + '\\b')
    const fn = commandsAsosiation[cmd]

    return (msg) => {
        if (!exp.test(msg.text))
            return false

        msg.text_parsed = msg.text.slice(cmd.length + 2).trim()
        fn(msg)

        return true
    }
}

function aliasUpdate() {
    let txt = ''

    for (a in cache.aliases) {
        a = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        txt = txt ? txt + '|' + a : a
    }

    if (txt)
        regexp = new RegExp(txt, 'g')
    else
        regexp = undefined
}

function messageHandler(msg) {
    for (cmd of commands)
        if (cmd(msg))
            return

    if (regexp) {
        regexp.lastIndex = 0
        let origin = msg.text

        for (let i = 0; i < 15; i++) {
            let found = false

            do {
                alias = regexp.exec(msg.text)

                if (!alias)
                    break

                found = true
                alias = alias[0]

                msg.text = msg.text.substring(0, regexp.lastIndex - alias.length) +
                    cache.aliases[alias] +
                    msg.text.substring(regexp.lastIndex)

                regexp.lastIndex = regexp.lastIndex - alias.length + cache.aliases[alias].length
            } while (true)

            if (!found)
                break
        }

        if (origin != msg.text)
            messageHandler(msg)
    }
}

function Init(commandsAsosiation) {
    for (cmd in commandsAsosiation)
        commands.push(newCommand(cmd, commandsAsosiation))
}

function load(CB) {
    async.waterfall([
        (cb) => MongoClient.connect(conf.MONGODB_URL, options, cb),
        (client, cb) => {
            client.db('telegram').collection('data').findOne({
                    _id: 0
                },
                (err, res) => {
                    client.close()
                    if (res)
                        for (i in cache)
                            cache[i] = res[i]
                    aliasUpdate()
                    cb(err, res)
                }
            )
        }
    ], CB)
}

function save(CB) {
    async.waterfall([
        (cb) => MongoClient.connect(conf.MONGODB_URL, options, cb),
        (client, cb) => {
            client.db('telegram').collection('data').replaceOne({
                    _id: cache._id
                }, cache, {
                    upsert: true
                },
                (err) => {
                    client.close()
                    aliasUpdate()
                    cb(err)
                }
            )
        }
    ], CB)
}

module.exports = {
    load: load,
    save: save,
    cache: cache,
    messageHandler: messageHandler,
    telegram2json: telegram2json,
    json2telegram: json2telegram,
    Init: Init,
}

