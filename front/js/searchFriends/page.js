function searchAccountOnDB(){
    fetch("http://localhost:8000/api/searchAccount", {
        method: "GET",
    })
        .then(response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                alert("APPEL A LAPI SEARCH ACCOUNT BIEN REALISE");
            }
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}