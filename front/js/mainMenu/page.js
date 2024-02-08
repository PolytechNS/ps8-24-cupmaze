const jwt= require("jsonwebtoken");

let token = JSON.parse(document.cookie.split('; ').find(row => row.startsWith('jwt')).split('=')[1]);
console.log(token);
// verify the token
jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
        console.error(err);
        return;
    }
    // retrieve the email value from the token
    console.log(decoded.email);
    document.getElementById("nameCurrentPlayer").innerHTML = decoded.email;
});
