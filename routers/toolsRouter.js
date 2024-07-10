const toolsRouter = require('express').Router();
const userModel = require('../models/userModel.js');
const toolsModel = require ('../models/toolsModel.js');
const authguard = require('../services/authguard.js');

// ROUTE POUR AFFICHER LES TUTORIELS
toolsRouter.get('/outils', authguard(false), async (req,res) => {
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
        let tools;
        let toolsQuery = {};
        if(req.query.search) {
            toolsQuery = { title: { $regex: new RegExp(req.query.search, 'i') } };
            tools = await toolsModel.find(toolsQuery);
        } else {
            tools = await toolsModel.find();
        }
        res.render('listTools/outils.twig', {
            header: userType,
            users : await userModel.find(),
            tools: tools,
        });
    } catch (error) {

        console.error("Erreur lors du rendu de la page de tableau de bord :", error);
        res.status(500).send("Une erreur s'est produite lors du rendu de la page de tableau de bord");
    }
});

module.exports = toolsRouter;