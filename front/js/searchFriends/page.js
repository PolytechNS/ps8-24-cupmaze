function searchAccountOnDB(){

    const usernameWanted = document.getElementById("searchInput").value;

    const params = {
        username: usernameWanted
    };

    const queryString = new URLSearchParams(params).toString();

    fetch("http://localhost:8000/api/searchAccount?$"+queryString, {
        method: "GET",
    })
        .then(response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                alert("ON A BIEN RETROUVE");
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}