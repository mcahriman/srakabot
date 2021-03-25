import { debug } from 'util';
import AppResources from './AppResources.js';

async function processKarma(message) {
  const { karmaVotes, stats } = await AppResources.getAppResources();

  if (typeof message.reply_to_message === 'undefined') {
    return 'Cannot process karma: reply message is not set';
  }

  const karmavote = {
    user: message.from.id,
    chatId: message.chat.id,
    messageVoted: message.reply_to_message.message_id,
  };

  const votedVote = await karmaVotes.findOne(karmavote);

  if (votedVote) {
    return { message: 'ты ж уже голосовал, чо ты творишm изверг' };
  }

  if (message.from.id === message.reply_to_message.from.id) {
    return { message: 'тут эцсамое, самому себе нельзя...' };
  }

  karmavote.vote = message.text === '+' ? 1 : -1;
  karmaVotes.insertOne(karmavote);

  const userChatFilter = {
    'user.id': { $eq: message.reply_to_message.from.id },
    'chat.id': { $eq: message.chat.id },
  };

  stats.updateOne(userChatFilter, { $inc: { 'stats.karma': karmavote.vote } });
  return { message: `${karmavote.vote} к карме ${message.reply_to_message.from.username}` };
}

async function uploadRanksCsv(ctx) {
  debug(ctx);
}

export default {
  processKarma,
  uploadRanksCsv,
};
