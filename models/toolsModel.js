// cette ligne de code permet d'importer le module mongoose, ce qui permettra d'utiliser ses fonctionnalités dans le script JavaScript.
const mongoose = require("mongoose");

const toolsSchema = new mongoose.Schema({
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
    link:{
        type: String,
        required: [true, "une URL est requis"],
    },

    tutos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tutorial"
    }],
});

const tools = mongoose.model('tools', toolsSchema);

module.exports = tools;