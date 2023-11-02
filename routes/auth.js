const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

// Have to learn more about JWT Tokens ;;
const JWT_SECRET = "H@qK@Kh@ufAj@bG@mH@";


//ROUTE 1: Create a user using: POST "/api/auth/createuser".  No Login required.

router.post('/createuser', [
    body('name', "Enter a valid name").isLength({ min: 3 }),
    body('email', "Enter a valid email").isEmail(),
    body('password', "Pasword is too short").isLength({ min: 5 }),
    body('password', "Password is too week").isStrongPassword()
], async (req, res) => {
    // If there are errors return badrequest with errors
    let success = true;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        // Check wether the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            success = false;
            return res.status(404).json({success, error: "Sorry this email is already registered." })
        }
        // Using salt and hash from bcrypt;
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create the users
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })
        // If a user registers himself we will return him an authentication token using JWT;
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({success, authtoken });

    }
    catch (error) {
        success=false;
        console.error(error.message);
        res.status(500).send(success,"Internal Server Error");
    }
});


//ROUTE 2: Authenticate a user using: POST "/api/auth/login".  No Login required.

router.post('/login', [
    body('email', "Enter a valid email").isEmail(),
    body('password', "Password can not be blank").exists()
], async (req, res) => {
    // If there are errors return badrequest with errors
    let success = true;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials." });
        }
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials." });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

});

//ROUTE 3: Get logged in user details using: POST "/api/auth/getuser".  Login required.

router.post('/getuser', fetchuser, async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;