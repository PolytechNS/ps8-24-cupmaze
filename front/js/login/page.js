document.getElementById("login-form").addEventListener("submit", function(event){
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    // Récupération des valeurs des champs
    var formData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

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
                if(response.status === 400){
                    alert("Il y'a des champs manquants au formulaire");
                    return;
                }
                if(response.status === 401){
                    alert('Email ou mot de passe incorrect');
                    return;
                }
            } else {
                alert("Utilisateur bien présent !");
                const token = response.headers.get('Set-Cookie');
                setCookie('jwt', token, 2);
                alert('Token sauvegardé dans le cookie');
                window.location.href = "http://localhost:8000/mainMenu.html";
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