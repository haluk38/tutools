// cette ligne de code permet d'importer le module mongoose, ce qui permettra d'utiliser ses fonctionnalités dans le script JavaScript.
const mongoose = require("mongoose");
const step = require("./stepModel");
const tools = require("./toolsModel");

const tutorialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Le titre est requis"],
    },
    image: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        required: [true, "Une Description est requise"],
    },
    time: {
        type: Number,
        required: [true, "le temps est requis"],
    },
    level: {
        type: Number,
        required: [true, "le niveau est requis"],
    },
    etape: {
        type: Number,
        required: [true, "le nombre d'étape est requis"],
    },
    tools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tools"
    }],
    steps: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: "steps"
    }]
});


const Tutorial = mongoose.model('tutorial', tutorialSchema);

module.exports = Tutorial;