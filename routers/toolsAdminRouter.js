const toolsAdminRouter = require('express').Router();
const toolsModel = require('../models/toolsModel.js');
const authguard = require('../services/authguard.js');
const multer = require('../services/multer-config.js');
const fs = require('fs');

// ROUTE POUR AFFICHER LA PAGE ADMIN "GESTION DES OUTILS"
toolsAdminRouter.get('/tools', authguard(true), async (req,res) => {
    try {
        let tools;
        let toolsQuery = {};
        if(req.query.search) {
            toolsQuery = { title: { $regex: new RegExp(req.query.search, 'i') } };
            tools = await toolsModel.find(toolsQuery);
        } else {
            tools = await toolsModel.find();
        }
        res.render('adminTools/tools.twig', {
            header: 'admin',
            tools:tools
        })
    } catch (error) {
        res.send(error)
    }
})

// ROUTE POUR AFFICHER LA PAGE ADMIN "AJOUTER UN OUTIL"
toolsAdminRouter.get('/addTools',authguard(true), (req, res) => {
    try {
        res.render('adminTools/addTools.twig', {
            header: 'admin',
        })
    } catch (error) {
        res.send(error)
    }
})
// ROUTE POUR CREE UN OUTIL
toolsAdminRouter.post('/addTools', authguard(true), multer.single('image'), async (req,res) => {
    try {
        const tools = new toolsModel(req.body);
        if(req.file) {
            if(req.multerError) {
                throw{errorUpload:"le fichier n'est pas valide"}
            }
            tools.image = req.file.filename
        }
        tools.validateSync()
        await tools.save(); // sauvegarde en base de données
        res.redirect('/tools')

    } catch (error) {
        res.render("adminTools/addTools.twig")
    }
} )

// ROUTE POUR SUPPRIMER UN OUTIL
toolsAdminRouter.get('/deleteTools/:toolsid', authguard(true), async (req, res) => {
    try {
        const tools = await toolsModel.findById(req.params.toolsid);
        if (!tools) {
            return res.status(404).send("outil non trouvé");
        }
        // Supprimer l'outil de la base de données par ID
        await toolsModel.deleteOne({ _id: req.params.toolsid });
        // Vérifier si l'utilisateur a une image et la supprimer
        if (tools.image) {
            fs.unlink('assets/image/uploads/' + tools.image, (error) => {
                if (error) {
                    throw error;
                }
            });
        }
        res.redirect("/tools");
    } catch (error) {
        res.status(500).send("Une erreur s'est produite lors de la suppression de l'outil");
    }
});

//ROUTE POUR AFFICHER LA PAGE ADMIN "MODIFIER UN OUTILS"
toolsAdminRouter.get('/updateTools/:toolsid', authguard(true), async (req,res) =>{
    try {
        const tools = await toolsModel.findById(req.params.toolsid)
        if (!tools) {
            throw new error("outil non trouvé");
        }
        res.render("adminTools/updateTools.twig", {
            header:"admin",
            tools: tools
        })
    } catch (error) {
        
    }
} )

// ROUTE POUR MODIFIER UN OUTIL
toolsAdminRouter.post('/updateTools/:toolsid', authguard(true), multer.single('image'), async (req,res) => {
    try {
        if (req.file) {
            if (req.multerError) {
                throw { errorUpload: "le fichier n'est pas validé" }
            }
            req.body.image = req.file.filename
        }
        await toolsModel.updateOne({ _id: req.params.toolsid }, req.body);
        res.redirect("/tools");
    } catch (error) {
        res.render("adminTools/updateTools.twig")
    }
})

module.exports = toolsAdminRouter;