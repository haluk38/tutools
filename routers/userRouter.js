const userRouter = require('express').Router();
const userModel = require('../models/userModel.js');
const bcrypt = require("bcrypt")
const authguard = require('../services/authguard.js')
const multer = require('../services/multer-config.js')

// ROUTE POUR AFFICHER LA PAGE D'ACCUEIL
userRouter.get('/accueil', (req, res) => {
    // Ce bloc try-catch est utilisé pour gérer les erreurs potentielles qui pourraient survenir lors de l'exécution du code à l'intérieur du bloc try
    try {
        // la fonction res.render() est utilisée pour rendre un modèle
        res.render('home/index.twig', {
            // objet contenant des données à passer au modèle lors du rendu.
            'route': '/accueil'
        })
        // Si une erreur se produit pendant l'exécution du bloc try, elle sera capturée par le bloc catch et cette ligne enverra une réponse contenant l'erreur.
    } catch (error) {
        res.send(error)
    }
})

// ROUTE POUR AFFICHER LA PAGE INSCRIPTION
userRouter.get('/inscription', (req, res) => {
    try {
        res.render('subscribe/form.twig', {
            'route': '/inscription'
        })
    } catch (error) {
        res.send(error)
    }
})

// ROUTE POUR CREE UN USER
userRouter.post("/inscription", multer.single('image'), async (req, res) => {
    try {
        const user = new userModel(req.body); // creation d'un utilisateur
        if(req.file) {
            if(req.multerError) {
                throw{errorUpload:"le fichier n'est pas valide"}
            }
            user.image = req.file.filename
        }
        user.validateSync()
        await user.save(); // sauvegarde en base de données
        res.redirect('/login')
    } catch (error) {
        res.render('subscribe/form.twig', {
            error: error.errors
        })
    }
})

// ROUTE POUR AFFICHER LA PAGE LOGIN
userRouter.get('/login', (req, res) => {
    res.render('login/form.twig')
})

// ROUTE SE CONNECTER 
userRouter.post('/login', async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email })
        if (user) {
            if (bcrypt.compare(req.body.password, user.password)) {
                req.session.user = user._id;
                res.redirect('/dashboard')
            } else {
                throw { password: "mauvais mot de passe" }
            }
        } else {
            throw { email: "cet utilisateur n'est pas enregistrer" }
        }
    } catch (error) {
        res.render('login/form.twig', {
            error: error.errors
        })
    }
})

//ROUTE POUR AFFICHER LE DASHBOARD 
userRouter.get('/dashboard', authguard(false), async (req, res) => {
    try {
        const user = await userModel.findById(req.session.user)
        let userType;
        if (user.is_admin) {
            // ont affiche le dashboard de l'admin
            userType = 'admin'
        } else {
            // sinon ont affiche le dashboard user
            userType = 'user'
        }
        res.render('dashboard/index.twig', {
            header: userType,
            users : await userModel.find()
        });
    } catch (error) {

        console.error("Erreur lors du rendu de la page de tableau de bord :", error);
        res.status(500).send("Une erreur s'est produite lors du rendu de la page de tableau de bord");
    }
});

//ROUTE POUR LA DÉCONNEXION
userRouter.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/accueil'); // Redirige vers la page de connexion après la déconnexion
    });
});

module.exports = userRouter;