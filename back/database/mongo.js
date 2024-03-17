const { MongoClient } = require('mongodb');
const MONGO_URI = 'mongodb://mongo_container:27017/';

const client = new MongoClient(MONGO_URI);

async function getDb() {
  await client.connect();
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

async function acceptFriendRequest(usernameReceveur, usernameAddeur) {
  try {
    const db = await getDb();
    const users = db.collection('users');

    await users.updateOne(
        { username: usernameReceveur },
        { $push: { friendsList: usernameAddeur } }
    );

    await users.updateOne(
        { username: usernameAddeur },
        { $push: { friendsList: usernameReceveur } }
    );

    await users.updateOne(
        { username: usernameReceveur },
        { $pull: { friendsRequests: usernameAddeur } }
    );

    console.log('Opérations de mise à jour réussies');
    return 'Opérations de mise à jour réussies';
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données :', error);
    throw error;
  }
}

async function addFriendRequest(usernameAdder, usernameToAdd){
  const db = await getDb();
  const users = db.collection('users');
  users.updateOne(
      { username: usernameToAdd},
      { $push: { friendsRequests: usernameAdder}},
      function(err, result) {
        if (err) {
          console.error('Erreur lors de la mise à jour des données :', err);
          return;
        }
        console.log('Demande d\'ami ajoutée avec succès');
        client.close();
      }
  );
}

async function getUser(email) {
  const db = await getDb();
  const users = db.collection('users');
  users.countDocuments().then((count) => {
    console.log(`Il y a ${count} utilisateurs dans la collection 'users'.`);
  });
  return users.findOne({ email: email });
}

async function getUserByName(username) {
  const db = await getDb();
  const users = db.collection('users');
  return users.findOne({ username: username });
}

async function createGame(game) {
  const db = await getDb();
  //console.log(game);
  if (db) {
    console.log("La base de données 'test' a été retrouvée avec succès.");
  } else {
    console.log("Erreur: La base de données 'test' n'a pas été retrouvée.");
  }
  const games = db.collection('games');
  if (games) {
    console.log("La collection 'games' a été retrouvée avec succès.");
  }
  games.countDocuments().then((count) => {
    console.log(`Il y a ${count} parties dans la collection 'games'.`);
  });
  await games.insertOne(game);
  games.countDocuments().then((count) => {
    console.log(`Il y a ${count} parties dans la collection 'games'.`);
  });
  return game;
}

async function getGame(userEmail) {
  const db = await getDb();
  const games = db.collection('games');
  return games.findOne({ userEmail: userEmail });
}

async function clearGames(userEmail){
  const db = await getDb();
  console.log(userEmail);
  if (db) {
    console.log("La base de données 'test' a été retrouvée avec succès.");
  } else {
    console.log("Erreur: La base de données 'test' n'a pas été retrouvée.");
  }
  const games = db.collection('games');
  if (games) {
    console.log("La collection 'games' a été retrouvée avec succès.");
  }
  games.countDocuments().then((count) => {
    console.log(`Il y a ${count} parties dans la collection 'games'.`);
  });
  await games.deleteMany({userEmail: userEmail });
  games.countDocuments().then((count) => {
    console.log(`Il y a ${count} parties dans la collection 'games'.`);
  });
  return userEmail;
}


async function clearGameDb() {
  const db = await getDb();
  const games = db.collection('games');
  await games.deleteMany({});
  return games;
}

function decodeJWTPayload(token) {
  const payload = token.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

async function clearUsersDb() {
  const db = await getDb();
  const users = db.collection('users');
  await users.deleteMany({});
  return users;
}

async function addNotification(username, notification){
  const db = await getDb();
  const users = db.collection('users');
  await users.updateOne(
      {username: username},
      {$push: {notifications: notification}},
      function (err, result) {
        if (err) {
          console.error('Erreur lors de la mise à jour des données :', err);
          return;
        }
        console.log('Notification ajoutée avec succès');
        client.close();
      }
  );
}

async function removeNotification(username, notification){
    const db = await getDb();
    const users = db.collection('users');
    await users.updateOne(
        {username: username},
        {$pull: {notifications: notification}},
        function (err, result) {
          if (err) {
            console.error('Erreur lors de la mise à jour des données :', err);
            return;
          }
          console.log('Notification retirée avec succès');
          client.close();
        }
    );
}

async function getNotifications(username) {
  const db = await getDb();
  const users = db.collection('users');
  const user = await users.findOne({username: username});
  return user.notifications;
}



exports.createUser = createUser;
exports.getUser = getUser;
exports.createGame = createGame;
exports.getGame = getGame;
exports.clearGames = clearGames;
exports.clearGameDb = clearGameDb;
exports.decodeJWTPayload = decodeJWTPayload;
exports.getUserByName = getUserByName;
exports.addFriendRequest = addFriendRequest;
exports.acceptFriendRequest = acceptFriendRequest;
exports.clearUsersDb = clearUsersDb;
exports.addNotification = addNotification;
exports.removeNotification = removeNotification;
exports.getNotifications = getNotifications;