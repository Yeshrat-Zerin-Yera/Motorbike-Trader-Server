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
        // Database & Collections
        const userCollection = client.db('MotorbikeTraderDatabase').collection('Users');
        const blogCollection = client.db('MotorbikeTraderDatabase').collection('Blogs');

        // 🌼Users
        // 🍒Post Users To Database
        app.post('/users', async (req, res) => {
            const user = req?.body;
            // Varify If This Email User Already In User Collection
            const query = { email: user?.email };
            const signUpUsers = await userCollection.find(query).toArray();
            if (signUpUsers.length) {
                return res.send({ acknowledged: false });
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // 🍒Get User Role From Database By Email
        app.get('/users/role/:email', async (req, res) => {
            const email = req?.params?.email;
            const query = { email: email };
            const databaseUser = await userCollection.findOne(query);
            // Get Role Of The User
            const role = databaseUser?.role;
            res.send({ role: role });
        });

        // 🍒Get Sellers From Database By Role
        app.get('/users/sellers', async (req, res) => {
            const query = {};
            const databaseUsers = await userCollection.find(query).toArray();
            // Filter Database User By Role
            const sellers = databaseUsers.filter(databaseUser => databaseUser?.role === 'Seller');
            res.send(sellers);
        });

        // 🌼Blogs
        // 🍒Get Blogs From Database
        app.get('/blogs', async (req, res) => {
            const query = {};
            const blogs = await blogCollection.find(query).toArray();
            res.send(blogs);
        });
    }
    finally { }
};
run().catch(console.dir);

// Testing
app.get('/', async (req, res) => res.send('Motorbike Trader Server Running'));
app.listen(port, () => console.log(`Motorbike Trader Server Running On Port: ${port}`));