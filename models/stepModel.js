const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
        title: {
            type: String,
            required: [true, "Le titre est requis"],
        },
        description: {
            type: String,
            required: [true, "Une Description est requise"],
        },
        photo: {
            type: String, 
            required: [true, "Une Image est requis"],
        }
});

const step = mongoose.model('steps', stepSchema);

module.exports = step;