// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
function manageRequest(request, response) {
    let url = new URL(request.url, `http://localhost:8000`);
    // on split le pathname pour récupérer le premier élément qui est l'endpoint
    // par exemple dans http://localhost:8000/users, on récupère "users"
    let endpoint = url.pathname.split('/')[1];

    // quand on a recupéré l'endpoint, on appelle la méthode correspondante, par exemple:
    // quand tu veut t'inscrire tu te rend a https://localhost:8000/signup
    // quand le endpoint est signup ca va trigger la fonction createUser
    switch (endpoint) {
        case 'signup':
            createUser(request, response);
            break;
    }

    response.statusCode = 200;
    response.end(`Thanks for calling ${request.url}`);
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