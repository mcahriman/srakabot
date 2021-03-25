import AppResources from './AppResources.js';

async function processStats(ctx) {
  const { stats, statsTemplate } = await AppResources.getAppResources();
  const chatFilter = {
    'chat.id': { $eq: ctx.message.chat.id },
  };
  const data = await stats.find(chatFilter).sort({ 'stats.totalMessages': -1 }).limit(5).toArray();
  const entries = data.map(
    (entry) => {
      const userName = entry.user.first_name ? ` ${entry.user.first_name} ${entry.user.last_name ?? ''}`
        : `${entry.user.username ?? '<i>unnamed</i>'}`;

      return `🥚 <b>${userName}</b>`
                 + ` | Карма: <b>${entry.stats.karma ?? 0}</b>`
                 + ` | Сообщений <b>${entry.stats.totalMessages}</b>`;
    },
  ).join('\n');

  const reply = await ctx.replyWithHTML(statsTemplate.replace('%stats%', entries));

  setTimeout(() => {
    ctx.deleteMessage(reply.message_id);
    ctx.deleteMessage(ctx.message.message_id);
  }, 60000);
}

export default {
  processStats,
};
