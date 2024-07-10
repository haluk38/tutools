// import du module express (framework) en utilisant la fonction require()
const express = require("express");
// import du module mongoose (biliotheque mongoDB)
const mongoose = require("mongoose");
// cette ligne de code permet d'importer et d'utiliser le module express-session 
// dans votre application Express, ce qui vous permet de mettre en œuvre la gestion 
// des sessions utilisateur. Cela peut être utile pour suivre l'état de l'authentification 
// de l'utilisateur, stocker des informations temporaires liées à la session utilisateur, etc.
const session = require('express-session')
// Cette route importe userRouter situé dans le répertoire "router"
const userRouter = require("./routers/userRouter");
const userAdminRouter = require("./routers/userAdminRouter")
const tutoAdminRouter = require("./routers/tutoAdminRouter")
const toolsAdminRouter = require("./routers/toolsAdminRouter")
const tutoRouter = require("./routers/tutoRouter")
const toolsRouter = require("./routers/toolsRouter")


// cette ligne crée une nouvelle instance de l'application express.js en appelant la fonction 'express()'
// L'objet 'app' est l'instance principale de votre application Express, à partir de laquelle vous allez configurer vos routes, middleware, etc.
const app = express();

// cette ligne de code configure l'application Express pour qu'elle puisse automatiquement analyser les corps de requête entrants au format JSON. 
// Cela permet à votre application de recevoir des données JSON dans les requêtes HTTP et de les traiter facilement dans votre code
app.use(express.json())
// cette ligne de code ajoute un middleware à l'application Express qui sert les fichiers statiques à partir du répertoire "./assets" lorsque les routes 
// correspondent à des fichiers dans ce répertoire. Par exemple, si vous avez un fichier "style.css" dans le répertoire "assets", il sera accessible à l'URL "/style.css" à partir du serveur Express.
app.use(express.static("./assets"))

app.use(express.urlencoded({extended: true}))
// Cette ligne utilise le routeur utilisateur userRouter que vous avez importé précédemment en tant que middleware pour votre application Express. 
// Cela signifie que toutes les requêtes entrantes passeront d'abord par ce routeur utilisateur pour voir si elles correspondent à l'une des routes définies dans le routeur
app.use(session({
    secret:'votre_secret_key',
    resave: true,
    saveUninitialized: true,
}))

// permet d'appeler la route en question lorsque l'application Express recevra une requête HTTP correspondante.

app.use(userRouter)
app.use(userAdminRouter)
app.use(tutoAdminRouter)
app.use(toolsAdminRouter)
app.use(tutoRouter)
app.use(toolsRouter)




app.listen(3002, (err) => {
    console.log(err ? err : "connecter au server");
});

mongoose.connect("mongodb://localhost:27017/projet_tutools")