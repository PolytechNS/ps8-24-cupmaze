if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrl = 'http://localhost:8000';
} else {
    baseUrl = 'http://cupmaze.ps8.academy';
}
document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    // Récupération des valeurs des champs
    var formData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        username: document.getElementById("username").value
    };

    // Hachage du mot de passe
    /*await hashPassword(formData.password).then((hash) => {
        formData.password = hash;
    });*/

    // Envoi de la requête POST
    fetch(baseUrl+"/api/signup", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                //alert('Erreur:', response.status)
                if (response.status === 409) {
                    alert('Cet email est déjà utilisé');
                    //window.location.href = 'welcome.html';
                    return;
                }
            }
            alert('Inscription réussie');
            window.location.href = 'welcome.html';
        })
        .then(data => {
            console.log(data); // Affichage de la réponse du serveur
            // Vous pouvez ajouter ici un traitement pour la réponse du serveur
        })
        .catch(error => {
            console.error('Erreur lors de la requête:', error);
        });
});


async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => ('00' + byte.toString(16)).slice(-2)).join('');
}


/* UTILISER UNE CLE PUBLIQUE RSA POUR HACHER PLUS TARD
function hashPassword(password) {
    const publicKey = "-----BEGIN PUBLIC KEY-----" +
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMXQ3avyWg9w6C9s6E0TzGIbtf" +
        "Fp2cIuugVQRiCwYXMBzsNGvCTdAlof1eVHpcL/YuNK/AAG2E2yYAcXju8NPHdAwX" +
        "+3UOiotah+F+F1FHB4yW+P7HRnfO4w6rekPdYo/W8wt7PKsDuZBsB6T1EVtC4POE" +
        "WrV23PfU27a1QcZNOwIDAQAB" +
        "-----END PUBLIC KEY-----"
    const buffer = Buffer.from(password, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
}
 */

let buttonBack = document.getElementById("back");
buttonBack.addEventListener("click", function () {
    window.location.href = 'welcome.html';
});