function searchAccountOnDB(){

    const usernameWanted = document.getElementById("searchInput").value;

    const params = {
        username: usernameWanted
    };

    const queryString = new URLSearchParams(params).toString();

    fetch("http://localhost:8000/api/searchAccount?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                alert("Utilisateur retrouvé");
                let ret = await response.json();
                const resultDiv = document.getElementById("searchResult");
                resultDiv.innerHTML = "";
                const usernameParagraph = document.createElement("p");
                usernameParagraph.textContent = `Nom d'utilisateur : ${ret.username}`;
                resultDiv.appendChild(usernameParagraph);
                const addButton = document.createElement("button");
                addButton.textContent = "Ajouter en ami";
                addButton.addEventListener("click", () => {
                    alert(`L'utilisateur ${ret.username} a été ajouté en ami.`);
                });
                resultDiv.appendChild(addButton);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}