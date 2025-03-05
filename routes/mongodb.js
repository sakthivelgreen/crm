const express = require('express');
const router = express.Router();

const { getDB } = require('../models/conn');
const { ObjectId } = require('mongodb');
let db;

router.use(async (req, res, next) => {
    try {
        if (!db) {
            db = await getDB();
        }
        next();
    } catch (error) {
        console.error('Error switching DB:', err);
        res.status(500).send('Internal Server Error');
    }
})

// POST route to insert data into various collections
router.post('/:module', async (req, res) => {
    try {
        const module = req.params.module;
        const collection = db.collection(module);
        const newItem = req.body; // Data from the client
        if (newItem['date-created'] == '') {
            newItem['date-created'] = new Date();
        }
        newItem['last-modified'] = new Date();
        if (newItem._id) {
            let id = newItem._id;
            newItem._id = new ObjectId(id);
        }
        // Insert the new document into the collection
        const result = await collection.insertOne(newItem);

        // Respond back with the inserted document's ID
        res.status(201).json({ message: `${module} inserted successfully`, id: result.insertedId });
    } catch (e) {
        console.error(e);
        res.status(500).send('Error inserting data');
    }
});

// GET route to fetch all documents from the specified collection
router.get('/:module', async (req, res) => {
    try {
        const module = req.params.module;
        const collection = db.collection(module);

        // Fetch all documents from the collection
        const data = await collection.find({}).toArray();

        // Respond with the fetched data
        res.status(200).json(data);
    } catch (e) {
        console.error(e);
        res.status(500).send('Error fetching data');
    }
});

// GET route to fetch a single document by its ID
router.get('/:module/:id', async (req, res) => {
    try {
        const module = req.params.module;
        const id = req.params.id;
        const collection = db.collection(module);
        // Fetch the document by its ID
        const data = await collection.findOne({ _id: new ObjectId(id) });

        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).send('Document not found');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('Error fetching data');
    }
});

// PUT route to update a document by its ID
router.put('/:module/:id', async (req, res) => {
    try {
        const module = req.params.module;
        const id = req.params.id;
        const updatedData = req.body;
        updatedData['last-modified'] = new Date();
        const collection = db.collection(module);
        // Update the document by its ID
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );

        if (result.matchedCount > 0) {
            res.status(200).json({ message: `${module} updated successfully`, data: result });
        } else {
            res.status(404).send('Document not found');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('Error updating data');
    }
});

// DELETE route to delete a document by its ID
router.delete('/:module/:id', async (req, res) => {
    try {
        const module = req.params.module;
        const id = req.params.id;
        const collection = db.collection(module);

        // Delete the document by its ID
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: `${module} deleted successfully` });
        } else {
            res.status(404).send('Document not found');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('Error deleting data');
    }
});

module.exports = router;
