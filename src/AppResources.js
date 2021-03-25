import * as fs from 'fs';
import { Telegraf } from 'telegraf';
import pkg from 'mongodb';

const { MongoClient } = pkg;
const {
  token, dbName, user, password,
} = JSON.parse(fs.readFileSync('./src/config/secrets.json'));

let bot;
let messageCollection;
let stats;
let statsTemplate;
let karmaVotes;
let initialized = false;

async function getAppResources() {
  if (initialized) {
    return {
      messageCollection,
      stats,
      bot,
      statsTemplate,
      karmaVotes,
    };
  }
  // TODO: replace
  const url = `mongodb://${user}:${password}@localhost:27017/srakabot`;
  const mongoClient = new MongoClient(url, { useUnifiedTopology: true });
  const client = await mongoClient.connect();
  const db = client.db(dbName);

  bot = new Telegraf(token);
  messageCollection = db.collection('messages');
  stats = db.collection('userStats');
  karmaVotes = db.collection('karmaVotes');
  statsTemplate = fs.readFileSync('fixtures/leaderboard.html').toString('utf-8');
  initialized = true;

  return {
    messageCollection,
    stats,
    bot,
    statsTemplate,
    karmaVotes,
  };
}

const AppResources = {
  getAppResources,
};

export default AppResources;
