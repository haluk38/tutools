const userModel = require('../models/userModel');

const authguard = (role) => {
    return async (req, res, next) => {
        try {
            if (req.session.user) {
                let user = await userModel.findOne({ _id: req.session.user });
             
                if (user) {
                    if (role == true ) {
                        if(user.is_admin == role){
                            return next(); 
                        }
                    }else{
                        return next(); 

                    }
                }
            }
            res.redirect('/login');
        } catch (error) {
            res.status(500).send("Une erreur s'est produite lors de l'authentification");
            res.redirect('/login');
        }
    };
};

module.exports = authguard;
