// cette ligne de code permet d'importer le module mongoose, ce qui permettra d'utiliser ses fonctionnalités dans le script JavaScript.
const mongoose = require("mongoose");

// cette ligne de code permet d'importer et d'utiliser le module "bcrypt" dans votre application Node.js, 
// ce qui vous permet de sécuriser les mots de passe en les hachant avant de les stocker dans une base de données, par exemple.
const bcrypt = require("bcrypt");

// schéma pour un modèle d'utilisateur en utilisant Mongoose
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Le Nom est requis"],
    },
    firstname: {
        type: String,
        required: [true, "Le prènom est requis"],
    },
    email: {
        type: String,
        required: [true, "le mail est requis"],
        validate: [
            {
                validator: (v) => {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/g.test(v);
                },
                message: "Entrez un mail valide",
            },
            {
                validator: async function (v) {
                    const userModel = mongoose.model("users");
                    const duplicatedmember = await userModel.findOne({
                        email: v,
                    });
                    return !duplicatedmember;
                },
                message: "cet email est déjà enregistré",
            },
        ],
    },
    image: {
        type: String,
        default: "",
    },
    password: {
        type: String,
        required: [true, "le mot de passe est requis"],
    },
    is_admin: {
        type: Boolean,
        default : false,
    },
})

userSchema.pre("save", function (next){
    if (!this.isModified("password")) {
        return next();
    }
    bcrypt.hash(this.password, 10, (error, hash) =>{
        if (error) {
            return next(error);
        } 
        this.password = hash;
        next()
    });
});

// 1 - users :  nom de la collection MongoDB dans laquelle les documents utilisateurs seront stockés
// 2 - userSchema : schéma défini précédemment pour les utilisateurs
// 3 - Une fois que le modèle userModel est créé, vous pouvez l'utiliser pour effectuer des opérations 
// CRUD (Créer, Lire, Mettre à jour, Supprimer) sur la collection users dans la base de données MongoDB
const userModel = mongoose.model('users', userSchema)

// 1- Ainsi, une fois que cette ligne de code est exécutée, le modèle userModel est disponible pour 
// être importé et utilisé dans d'autres fichiers de votre projet Node.js en utilisant la syntaxe require()
module.exports = userModel



