require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const router = express.Router();
const uri = process.env.Mongo_URI;
const client = new MongoClient(uri);

// Connect to MongoDB Atlas
async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
    } catch (e) {
        console.error(e);
    }
}
connectToMongo(); // Initialize the connection to MongoDB

// POST route to insert data into various collections
router.post('/:module', async (req, res) => {
    try {
        const module = req.params.module;
        const collection = client.db('crm').collection(module);
        const newItem = req.body; // Data from the client

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
        const collection = client.db('crm').collection(module);

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
        const collection = client.db('crm').collection(module);
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
        const collection = client.db('crm').collection(module);

        // Update the document by its ID
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );

        if (result.matchedCount > 0) {
            res.status(200).json({ message: `${module} updated successfully` });
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
        const collection = client.db('crm').collection(module);

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
