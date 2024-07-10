const tutoAdminRouter = require('express').Router();
const tutoModel = require('../models/tutoModel.js');
const authguard = require('../services/authguard.js');
const upload = require('../services/multer-config.js');
const stepModel = require('../models/stepModel.js')
const toolsModel = require('../models/toolsModel.js')
const fs = require('fs');
const { log } = require('console');

// ROUTE POUR AFFICHER LA PAGE ADMIN "GESTION DES TUTORIELS"
tutoAdminRouter.get('/tutoriel', authguard(true), async (req, res) => {
    try {
        let tutos;
        let tutoQuery = {};
        if(req.query.search) {
            tutoQuery = { title: { $regex: new RegExp(req.query.search, 'i') } };
            tutos = await tutoModel.find(tutoQuery);
        } else {
            tutos = await tutoModel.find();
        }
        res.render('adminTuto/tutoriel.twig', {
            header: 'admin',
            tutos: tutos
        })
    } catch (error) {
        res.send(error)
    }
})

// ROUTE POUR AFFICHER LA PAGE ADMIN "AJOUTER UN TUTORIEL"
tutoAdminRouter.get('/addTuto', authguard(true), async (req, res) => {
    try {
        res.render('adminTuto/addTuto.twig', {
            header: 'admin',
            tools: await toolsModel.find()
        })
    } catch (error) {
        res.send(error)
    }
})

// ROUTE POUR CREE UN TUTORIEL
tutoAdminRouter.post('/addTuto', authguard(true), upload.array('photo', 10), async (req, res) => {
    try {
        const tools = await toolsModel.find()
        const tuto = new tutoModel({
            title: req.body.title,
            description: req.body.description,
            time: req.body.time,
            level: req.body.level,
            tools: req.body.tools,
            etape: req.body.etape
        }); // création d'un tutoriel
        if (req.files) {
            if (req.multerError) {
                throw { errorUpload: "le fichier n'est pas valide" }
            }
            tuto.image = req.files[0].filename
        }
        const steps = req.body.steps
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]
            const newStep = new stepModel(step)
            newStep.photo = req.files[i + 1].filename
            tuto.steps.push(newStep._id)
            await newStep.save()
        }
        await tuto.save(); // sauvegarde du tutoriel en base de données
        res.redirect('/tutoriel')
    } catch (error) {
        res.render('adminTuto/addTuto.twig')
    }
})

// ROUTE POUR SUPPRIMER UN TUTORIEL
tutoAdminRouter.get('/deleteTuto/:tutoid', authguard(true), async (req, res) => {
    try {
        const tuto = await tutoModel.findByIdAndDelete(req.params.tutoid);
        if (!tuto) {
            throw new Error("Tutoriel non trouvé");
        }
        // Supprimer les images associées au tutoriel
        if (tuto.image) {
            fs.unlink('assets/image/uploads/' + tuto.image, (error) => {
                if (error) {
                    throw error;
                }
            });
        }
        const steps = await stepModel.find({ _id: { $in: tuto.steps } });
        steps.forEach(step => {
            if (step.photo) {
                fs.unlink('assets/image/uploads/' + step.photo, (error) => {
                    if (error) {
                        throw error;
                    }
                });
                
            }
        });
        await stepModel.deleteMany({ _id: { $in: tuto.steps } })
        res.redirect('/tutoriel');
    } catch (error) {
        res.render('/adminTuto/tutoriel.twig');
    }
});

// ROUTE POUR AFFICHER LA PAGE ADMIN "MODIFIER UN TUTORIEL"
tutoAdminRouter.get('/updateTuto/:tutoid', authguard(true), async (req, res) => {
    try {
        const tools = await toolsModel.find();
        const tuto = await tutoModel.findById(req.params.tutoid).populate("steps")
        if (!tuto) {
            throw new Error("Tutoriel non trouvé");
        }
        res.render("adminTuto/updateTuto.twig", {
            header: 'admin',
            tuto: tuto,
            tools: tools
        });
    } catch (error) {
        res.render("adminTuto/tutoriel.twig");
    }
});

// ROUTE POUR MODIFIER UN TUTORIEL
tutoAdminRouter.post('/updateTuto/:tutoid', authguard(true), upload.array('photo', 10), async (req, res) => {
    try {
        console.log(req.files);
        const tuto = await tutoModel.findById(req.params.tutoid).populate('steps');
        if (!tuto) {
            throw new Error('Tutoriel non trouvé');
        }
        // Mettre à jour les champs du tutoriel
        tuto.title = req.body.title;
        tuto.description = req.body.description;
        tuto.time = req.body.time;
        tuto.level = req.body.level;
        tuto.etape = req.body.etape;
        // Mettre à jour l'image si un nouveau fichier est uploadé
        if (req.files && req.files.length > 0) {
            if (req.multerError) {
                throw { errorUpload: "Le fichier n'est pas valide" };
            }
            tuto.image = req.files[0].filename;
        }
        // Mettre à jour les étapes du tutoriel
        if (req.body.steps) {
            const steps = req.body.steps;
            for (let i = 0; i < steps.length; i++) {
                if (i < tuto.steps.length) {
                    const stepId = tuto.steps[i];
                    const updatedStep = await stepModel.findByIdAndUpdate(stepId._id, steps[i], { new: true });
                    if (!updatedStep) {
                        throw new Error(`Étape avec l'ID ${stepId} non trouvée`);
                    }
                }else{
                    const newStep = new stepModel(steps[i])
                    newStep.photo = "dsdsdsd"
                    newStep.save()
                    await tutoModel.updateOne({ _id: tuto._id }, { $push: { steps: newStep._id } })
                }
            }
           
        }
        // Sauvegarder les modifications du tutoriel
        await tuto.save();
        res.redirect('/tutoriel');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// ROUTE POUR SUPPRIMER UNE ETAPE 
tutoAdminRouter.get('/deleteStep/:stepId/:tutoId', authguard(true), async (req, res) => {
    try {
        const tuto = await tutoModel.findOne({_id : req.params.tutoId})
        console.log(tuto.steps.length);
        if (tuto.steps.length > 1) {
            await stepModel.deleteOne({ _id: req.params.stepId })
            await tutoModel.updateOne({ _id: req.params.tutoId }, { $pull: { steps: req.params.stepId } })
            res.redirect("/updateTuto/" + req.params.tutoId)
        }
    } catch (error) {
        res.render("adminTuto/tutoriel.twig");
    }
});


module.exports = tutoAdminRouter;