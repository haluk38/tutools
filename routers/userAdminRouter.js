const userAdminRouter = require('express').Router();
const userModel = require('../models/userModel.js');
const authguard = require('../services/authguard.js')
const multer = require('../services/multer-config.js')
const fs = require('fs');


// ROUTE POUR AFFICHER LA PAGE ADMIN "GESTION"
userAdminRouter.get('/gestion', authguard(true), async (req, res) => {
    try {
        res.render('admin/gestion.twig', {
            header: 'admin'
        })
    } catch (error) {
        res.send(error)
    }
})

// ROUTE POUR AFFICHER LA PAGE ADMIN "GESTION DES USER"
userAdminRouter.get('/user', authguard(true), async (req, res) => {
    try {
        let users;
        let userQuery = {}; // Initialiser la requête de recherche
        // Vérifier si le paramètre de requête 'search' est présent
        if (req.query.search) {
            // Si oui, configurer la requête de recherche pour le nom d'employé
            userQuery = { name: { $regex: new RegExp(req.query.search, 'i') } };
            users = await userModel.find(userQuery);
        } else {
            users = await userModel.find();
        }
        res.render('adminUser/user.twig', {
            header: 'admin',
            users: users
        })
    } catch (error) {
        res.send(error)
    }
})
// ROUTE POUR SUPPRIMER UN USER
userAdminRouter.get('/delete/:userid', authguard(true), async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userid);
        if (!user) {
            return res.status(404).send("Utilisateur non trouvé");
        }
        // Supprimer l'utilisateur de la base de données par ID
        await userModel.deleteOne({ _id: req.params.userid });
        // Vérifier si l'utilisateur a une image et la supprimer
        if (user.image) {
            fs.unlink('assets/image/uploads/' + user.image, (error) => {
                if (error) {
                    throw error;
                }
            });
        }
        res.redirect("/user");
    } catch (error) {
        res.status(500).send("Une erreur s'est produite lors de la suppression de l'utilisateur");
    }
});

// ROUTE POUR AFFICHER LA PAGE ADMIN "MODIFIER UN USER"
userAdminRouter.get('/updateUser/:userid', authguard(true), async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userid);
        if (!user) {
            throw { error: "utilisateur introuvable" }
        }
        res.render("adminUser/updateUser.twig", {
            header: 'admin',
            user: user
        })
    } catch (error) {
        res.render("admin/gestion.twig")
    }
})

// ROUTE POUR MODIFIER UN USER
userAdminRouter.post('/updateUser/:userid', authguard(true), multer.single('image'), async (req, res) => {
    try {
        if (req.file) {
            if (req.multerError) {
                throw { errorUpload: "le fichier n'est pas validé" }
            }
            req.body.image = req.file.filename
        }
        await userModel.updateOne({ _id: req.params.userid }, req.body);
        res.redirect("/user");
    } catch (error) {
        res.render("adminUser/updateUser.twig")
    }
})

module.exports = userAdminRouter;