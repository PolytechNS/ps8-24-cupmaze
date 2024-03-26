const { createUser, getUser, getUsersRank,createGame, getGame, getUserByName, addFriendRequest,removeFriend, acceptFriendRequest, clearUsersDb, clearPrivateChatDb} = require('../database/mongo');

const jwt = require('jsonwebtoken');

// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
function manageRequest(request, response) {
    let url = new URL(request.url, `http://localhost:8000`);
    // on split le pathname pour récupérer le premier élément qui est l'endpoint
    // par exemple dans http://localhost:8000/users, on récupère "users"
    let endpoint = url.pathname.split('/')[2];

    // quand on a recupéré l'endpoint, on appelle la méthode correspondante, par exemple:
    // quand tu veut t'inscrire tu te rend a https://localhost:8000/signup
    // quand le endpoint est signup ca va trigger la fonction createUser
    switch (endpoint) {
        case 'signup':
            signup(request, response);
            break;
        case 'login':
            login(request, response);
            break;
        case 'saveGame':
            saveGame(request, response);
            break;
        case 'searchAccount':
            searchAccountOnDB(request,response);
            break;
        case 'addFriend':
            addPlayerFriendList(request,response);
            break;
        case 'getWaitingFriendsRequests':
            getWaitingFriendsRequests(request,response);
            break;
        case 'acceptFriendRequest':
            acceptFriendRequestAPI(request,response);
            break;
        case 'getFriends':
            getFriends(request,response);
            break;
        case 'clearUsersDb':
            clearUsersDbAPI(request, response);
            break;
        case 'clearPrivateChatDb':
            clearPrivateChatDbAPI(request, response);
            break;
        case 'removeFriend':
            removeFriendAPI(request, response);
            break;
        case 'getLeaderboard':
            getLeaderboard(request, response);
            break;

        default:
            response.statusCode = 404;
            response.end('Not Found');
    }
}

function getLeaderboard(request, response) {
    getUsersRank().then((users) => {
        response.writeHead(200, {'Content-Type': 'application/json'});
        //retourner la paire username, elo et trier par elo
        response.end(JSON.stringify(users.sort((a, b) => b.elo - a.elo).map((user) => {
            return { username: user.username, elo: user.elo};
        })));
    }).catch((error) => {
        response.statusCode = 500;
        response.end('Erreur interne du serveur');
        console.error('Erreur lors de la récupération du leaderboard:', error);
    });
}

function clearPrivateChatDbAPI(request, response) {
    clearPrivateChatDb().then(() => {
        console.log("Chats privés supprimés avec succès");
        response.statusCode = 200;
        response.end('Chats privés supprimés');
    });
}

function clearUsersDbAPI(request, response) {
    clearUsersDb().then(() => {
        console.log("Utilisateurs supprimés avec succès");
        response.statusCode = 200;
        response.end('Utilisateurs supprimés');
    });
}

function getFriends(request, response){
    let username = (request.url).toString().split("=")[1].split("&")[0];
    getUserByName(username)
        .then((user) => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(user.friendsList));
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération des amis :", error);
            response.writeHead(401, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ content: "ErrorGetFriends" }));
        });
}

function acceptFriendRequestAPI(request, response){
    let usernameReceveur = (request.url).toString().split("=")[1].split("&")[0];
    let usernameAddeur = (request.url).toString().split("=")[2].split("&")[0];
    acceptFriendRequest(usernameReceveur, usernameAddeur)
        .then(() => {
            console.log("Demande d'ami acceptée avec succès");
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ content: "AcceptFriendRequestDone" }));
        })
        .catch((error) => {
            console.error("Erreur lors de l'acceptation de la demande d'ami :", error);
            response.writeHead(401, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ content: "ErrorAcceptFriendRequest" }));
        });
}

function removeFriendAPI(request, response){
    let usernameRemover = (request.url).toString().split("=")[1].split("&")[0];
    let usernameToRemove = (request.url).toString().split("=")[2].split("&")[0];
    removeFriend(usernameRemover, usernameToRemove)
        .then(() => {
            console.log("Ami supprimé avec succès");
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ content: "RemoveFriendDone" }));
        })
        .catch((error) => {
            console.error("Erreur lors de la suppression de l'ami :", error);
            response.writeHead(401, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ content: "ErrorRemoveFriend" }));
        });

}

function getWaitingFriendsRequests(request, response){
    let username = (request.url).toString().split("=")[1].split("&")[0];
    getUserByName(username)
        .then((requests) => {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(requests.friendsRequests));
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération des demandes d'ami :", error);
            response.writeHead(401, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ content: "ErrorGetFriendRequest" }));
        });
}

function searchAccountOnDB(request, response) {
    /*Récupération du paramètre*/
    let username = (request.url).toString().split("=")[1].split("&")[0];
    getUserByName(username).then((user) => {
        if (!user) {
            response.statusCode = 401;
            response.end('Utilisateur inconnu');
        } else {
            console.log(user);
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ username: user.username }));
        }
    }).catch((error) => {
        response.statusCode = 500;
        response.end('Erreur interne du serveur');
        console.error('Erreur lors de la recherche de l\'utilisateur:', error);
    });
}

function addPlayerFriendList(request, response){
    let usernameAdder = (request.url).toString().split("=")[1].split("&")[0];
    let usernameToAdd = (request.url).toString().split("=")[2].split("&")[0];

    addFriendRequest(usernameAdder, usernameToAdd)
        .then(() => {
            console.log("Demande d'ami ajoutée avec succès");
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ content: "AddFriendRequestDone" }));
        })
        .catch((error) => {
            console.error("Erreur lors de l'ajout de la demande d'ami :", error);
            response.writeHead(401, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({ content: "ErrorAddFriendRequest" }));
        });
}


// Methode pour gerer l'inscription
// je code tout en early return pour éviter les if else
function signup(request, response) {
    // on regarde si on a bien une méthode POST
    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end('Method Not Allowed');
        return;
    }

    parseBody(request).then((body) => {
        // on check qu'on a bien mail, username, password dans le body
        if (!body.email || !body.username || !body.password) {
            response.statusCode = 400;
            response.end('Manque des trucs dans le body');
            return;
        }
        // on cree un utilisateur
        creationOfUser(body.email, body.username, body.password, response);
    });
}

// Methode pour gerer la connexion
function login(request, response) {
    // on regarde si on a bien une méthode POST
    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end('Method Not Allowed');
        return;
    }
    parseBody(request).then((body) => {
        // on check qu'on a bien mail, username, password dans le body
        if (!body.email || !body.password) {
            response.statusCode = 400;
            response.end('Manque des trucs dans le body');
            return;
        }

        // on check si l'utilisateur existe
        getUser(body.email).then((user) => {
            if (!user) {
                response.statusCode = 401;
                response.end('Utilisateur inconnu');
                return;
            }

            // TODO: quand on aura hashé les mots de passe, il faudra hasher le mot de passe du body avant de le comparer

            // on check si le mot de passe est bon
            if (user.password !== body.password) {
                response.statusCode = 401;
                response.end('Mot de passe incorrect');
                return;
            }

            // generate token
            let token = jwt.sign({
                id: user._id,
                email: user.email,
                username: user.username
            }, 'secret', { expiresIn: '2h' });
            token = JSON.stringify(token);
            response.setHeader('Set-Cookie', token);
            response.setHeader("Nameaccount", user.username);

            // on envoie un token
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({token: token}));
        });
    });
}

/*----------------------------------------*/

// methode pour parser le body de la requete ca sera plus simple pour le traitement
function parseBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            resolve(JSON.parse(body));
        });
    });
}

// fonction pour cree un utilisateur
function creationOfUser(email, username, password, response) {
    // on check si l'utilisateur existe déjà
    getUser(email).then((user) => {
        if (user) {
            response.statusCode = 409;
            response.end('l\'utilisateur existe déjà');
            return;
        }

        // TODO : hash du mot de passe

        // on cree l'utilisateur
        createUser({ email, username, password, friendsList:[], friendsRequests: [], notifications: [], elo:400 }).then(() => {
            response.statusCode = 201;
            response.end('Utilisateur créé');
        });
    });
}

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow.
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}

exports.manage = manageRequest;