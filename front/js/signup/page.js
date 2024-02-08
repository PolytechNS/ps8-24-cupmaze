document.getElementById("signup-form").addEventListener("submit", function(event){
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    // Récupération des valeurs des champs
    var formData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        username: document.getElementById("username").value
    };

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
                if(response.status === 409){
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
