const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {body , validationResult} = require('express-validator');


//Create a user using: POST "/api/auth/createuser".  Doesn't require Auth No Login required.

router.post('/createuser',[
    body('name',"Enter a valid name").isLength({min:3}),
    body('email',"Enter a valid email").isEmail(),
    body('password',"Pasword is too short").isLength({min:5}),
    body('password',"Password is too week").isStrongPassword()
],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors:errors.array() });
    }

    try{
        // Check wether the user with this email exists already
        let user = await User.findOne({email:req.body.email});
        if(user){
            return res.status(402).json({error:"Sorry this email is already registered."})
        }
        // Create the users
        user = await User.create({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password
        })
        res.json(user);

    }
    catch(error){
        console.error(error.message);
        res.status(500).send("Some error occured at Database");
    }
})

module.exports = router;