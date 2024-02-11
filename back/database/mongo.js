const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://mongo_container:27017/';

const client = new MongoClient(MONGO_URI);

async function getDb() {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db('test');
}

async function createUser(user) {
  const db = await getDb();
  if (db) {
    console.log("La base de données 'test' a été retrouvée avec succès.");
  } else {
    console.log("Erreur: La base de données 'test' n'a pas été retrouvée.");
  }
  const users = db.collection('users');
  if (users) {
    console.log("La collection 'users' a été retrouvée avec succès.");
  }
  users.countDocuments().then((count) => {
    console.log(`Il y a ${count} utilisateurs dans la collection 'users'.`);
  });
  await users.insertOne(user);
  users.countDocuments().then((count) => {
    console.log(`Il y a ${count} utilisateurs dans la collection 'users'.`);
  });
  return user;
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
exports.createUser = createUser;
exports.getUser = getUser;
