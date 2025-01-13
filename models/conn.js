require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.Mongo_URI;
const client = new MongoClient(uri);
let conn, db;
const connectDB = async (db_name = 'crm') => {
    if (db) return db;
    try {
        if (!conn) {
            conn = await client.connect();
            console.log('Database Connected');
        }
        db = conn.db(db_name);
        return db;
    } catch (error) {
        console.error(e);
    }
}
connectDB();
module.exports = { getDB: connectDB }