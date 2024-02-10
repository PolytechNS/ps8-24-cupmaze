document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    // Récupération des valeurs des champs
    var formData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        username: document.getElementById("username").value
    };

    // Hachage du mot de passe
    await hashPassword(formData.password).then((hash) => {
        console.log('Mot de passe haché:', hash);
        formData.password = hash;
        console.log('Mot de passe haché:', formData.password);
    });

    // Envoi de la requête POST
    fetch("http://localhost:8000/api/signup", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 409) {
                    alert('Cet email est déjà utilisé');
                    return;
                }
            }
            alert('Inscription réussie !');
            window.location.href = 'http://localhost:8000/';
        })
        .then(data => {
            console.log(data); // Affichage de la réponse du serveur
            // Vous pouvez ajouter ici un traitement pour la réponse du serveur
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
});


async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => ('00' + byte.toString(16)).slice(-2)).join('');
}
