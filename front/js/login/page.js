document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    // Récupération des valeurs des champs
    var formData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    await hashPassword(formData.password).then((hash) => {
        formData.password = hash;
    });

    // Envoi de la requête POST
    fetch("http://localhost:8000/api/login", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 400) {
                    alert("Il y'a des champs manquants au formulaire");
                    return;
                }
                if (response.status === 401) {
                    alert('Email ou mot de passe incorrect');
                    return;
                }
            } else {
                response.json().then((data) => {
                    console.log(data);
                    let token = data.token;
                    // on retire les guillemets
                    token = token.replace(/['"]+/g, '');
                    alert("Connexion réussie !");
                    console.log('token', token);
                    setCookie('jwt', token, 2);
                    setCookie('Nameaccount', response.headers.get('Nameaccount'), 2);

                    var baseUrl = '';
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        baseUrl = 'http://localhost:8000';
                    } else {
                        baseUrl = 'http://cupmaze.ps8.academy/';
                    }
                    window.location.href = baseUrl+"/mainMenu.html";
                });
                /*
                const token = response.headers.get('Set-Cookie');
                alert("Utilisateur bien présent !" + token);
                console.log('token', token);
                setCookie('jwt', token, 2);
                setCookie('Nameaccount', response.headers.get('Nameaccount'), 2);
                window.location.href = "http://localhost:8000/mainMenu.html";
                */
            }
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
});


function setCookie(name, value, hours) {
    let expires = "";
    if (hours) {
        const date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => ('00' + byte.toString(16)).slice(-2)).join('');
}