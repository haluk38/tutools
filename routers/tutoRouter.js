const tutoRouter = require('express').Router();
const userModel = require('../models/userModel.js')
const tutoModel = require ('../models/tutoModel.js')
const authguard = require('../services/authguard.js')

// ROUTE POUR AFFICHER LES TUTORIELS
tutoRouter.get('/tuto', authguard(false), async (req,res) => {
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
        let tutos;
        let tutoQuery = {};
        if(req.query.search) {
            tutoQuery = { title: { $regex: new RegExp(req.query.search, 'i') } };
            tutos = await tutoModel.find(tutoQuery);
        } else {
            tutos = await tutoModel.find();
        }
        res.render('listTuto/tuto.twig', {
            header: userType,
            users : await userModel.find(),
            tutos: tutos,
        });
    } catch (error) {

        console.error("Erreur lors du rendu de la page de tableau de bord :", error);
        res.status(500).send("Une erreur s'est produite lors du rendu de la page de tableau de bord");
    }
});

// ROUTE POUR AFFICHER LE TUTORIEL
tutoRouter.get('/theTuto/:tutoid', authguard(false), async (req,res) =>{
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
        const tuto = await tutoModel.findById(req.params.tutoid).populate('tools steps');
        if(!tuto){
            throw{error: "tutoriel introuvable"}
        }res.render("listTuto/theTuto.twig",{
            header: userType,
            tuto: tuto
        })
    } catch (error) {
        res.render("listTuto/tuto.twig")
    }
})

module.exports = tutoRouter;
