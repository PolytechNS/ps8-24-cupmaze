const { MongoClient } = require('mongodb');
const MONGO_URI = 'mongodb://localhost:27017';

const client = new MongoClient(MONGO_URI);

async function getDb() {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db('test');
}

async function createUser(user) {
  const db = await getDb();
  const users = db.collection('users');
  return users.insertOne(user);
}

async function getUser(email) {
  const db = await getDb();
  const users = db.collection('users');
  return users.findOne({ email: email });
}

async function createGame(game) {
  const db = await getDb();
  const games = db.collection('games');
  return games.insertOne(game);
}

async function getGame(userEmail) {
  const db = await getDb();
  const games = db.collection('games');
  return games.findOne({ userEmail: userEmail });
}

exports.createUser = createUser;