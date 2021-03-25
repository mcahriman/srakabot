import { debug } from 'console';

// eslint-disable-next-line import/no-unresolved
import AppResources from './AppResources.js';
import karma from './karma.js';
import statistics from './statistics.js';

async function setupBot() {
  const { bot, stats, messageCollection } = await AppResources.getAppResources();

  bot.command('stats', statistics.processStats);

  bot.command('admin@ranks', karma.uploadRanksCsv);

  bot.on('new_chat_members', (ctx) => {
    ctx.reply('Ты с каково раёна');
  });

  bot.on('left_chat_member', (ctx) => {
    ctx.reply('от ссыкло');
  });

  bot.on('message', async (ctx) => {
    debug(ctx.message);
    messageCollection.insertOne(ctx.message);

    const userChatFilter = {
      'user.id': { $eq: ctx.message.from.id },
      'chat.id': { $eq: ctx.message.chat.id },
    };

    // Process karma updates first

    if (typeof ctx.message.reply_to_message !== 'undefined'
        && ['+', '-'].includes(ctx.message.text)) {
      const result = await karma.processKarma(ctx.message);

      const reply = await ctx.replyWithHTML(`${result.message}`);

      setTimeout(() => {
        ctx.deleteMessage(reply.message_id);
        ctx.deleteMessage(ctx.message.message_id);
      }, 60000);
      return;
    }

    const entry = await stats.findOne(userChatFilter);

    if (!entry) {
      const messageObject = {
        user: ctx.message.from,
        chat: ctx.message.chat,
        stats: {
          totalMessages: 1,
          rank: 0,
        },
      };
      stats.insertOne(messageObject);
    } else {
      entry.stats.totalMessages += 1;
      stats.updateOne(userChatFilter, { $inc: { 'stats.totalMessages': 1 } });
    }
  });

  bot.launch();

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

setupBot();
