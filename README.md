## telegram-bot

Source code of https://hub.docker.com/r/gllera/telegram-bot

Telegram bot to recieve push notifications and also to execute remote commands.
Based on the docker image 'node:10.11.0-alpine' and the telegram bot node module https://github.com/yagop/node-telegram-bot-api

**Requires the following environment variables:**
* TELEGRAM_TOKEN
* WEBHOOK_ROOT
* MONGODB_URL
* CHAT_PASSWORD

**Example run:**
```bash
docker run -it --rm \
   -e TELEGRAM_TOKEN=112233445:BBAABBAAB-11AA22AA22AA44BB33ssbb33b \
   -e WEBHOOK_ROOT=https://www.example.com \
   -e MONGODB_URL=mongodb://localhost:27017 \
   -e CHAT_PASSWORD=1234 \
   gllera/telegram-bot
```

