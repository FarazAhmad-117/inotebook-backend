const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');



//ROUTE 1: Fetch all notes using: GET "/api/notes/fetchallnotes".  Login required.

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


//ROUTE 2: Add a new note using: POST "/api/notes/addnote".  Login required.

router.post('/addnote', fetchuser, [
    body('title', "Enter a valid title").isLength({ min: 3 }),
    body('description', "Description must be atleast 5 characters").isLength({ min: 5 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // If there are errors return badrequest with errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


//ROUTE 3: Update an existing note using: PUT "/api/notes/updatenote/:id".  Login required.

router.put('/updatenote/:id', fetchuser, [
    body('title', "Enter a valid title").isLength({ min: 3 }),
    body('description', "Description must be atleast 5 characters").isLength({ min: 5 })
], async (req, res) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), err: "This is error" });
    }
    const { title, description, tag } = req.body;
    // Creating a newNote object;
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };
    try {
        // Find the note to be updated and update it;
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(400).send("Not Found");
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        return res.json(note);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


//ROUTE 4: Delete an existing note using: DELETE "/api/notes/deletenote/:id".  Login required.

router.delete('/deletenote/:id', fetchuser,
    async (req, res) => {
        
        try {
            // Find the note to be deleted and delete it;
            let note = await Note.findById(req.params.id);
            if (!note) {
                return res.status(400).send("Not Found");
            }

            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not Allowed");
            }

            note = await Note.findByIdAndDelete(req.params.id);
            return res.json({"Success":"Note has been deleted",note:note});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

module.exports = router;