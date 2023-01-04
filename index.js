const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connection With MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3drcjwz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Run Function
async function run() {
    try {

    }
    finally { }
};
run().catch(console.dir);

// Testing
app.get('/', async (req, res) => res.send('Motorbike Trader Server Running'));
app.listen(port, () => console.log(`Motorbike Trader Server Running On Port: ${port}`));