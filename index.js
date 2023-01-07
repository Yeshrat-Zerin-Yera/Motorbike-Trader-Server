const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const productCollection = client.db('MotorbikeTraderDatabase').collection('Products');

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

        // 🍒Delete A User From Database By Id
        app.delete('/users/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        // 🍒Verify A Seller From Database By Id
        app.put('/users/:id', async (req, res) => {
            const id = req?.params?.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: 'Verified'
                }
            };
            const options = { upsert: true };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // 🍒Get Buyers From Database By Role
        app.get('/users/buyers', async (req, res) => {
            const query = {};
            const databaseUsers = await userCollection.find(query).toArray();
            // Filter Database User By Role
            const buyers = databaseUsers.filter(databaseUser => databaseUser?.role === 'Buyer');
            res.send(buyers);
        });

        // 🌼Products
        // 🍒Post Products To Database
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        // 🍒Get Products From Database By Email
        app.get('/products', async (req, res) => {
            const email = req?.query?.email;
            const query = { email: email };
            const products = await productCollection.find(query).toArray();
            res.send(products);
        });

        // 🍒Advertise A Product From Database
        app.put('/products/advertise/:id', async (req, res) => {
            const id = req?.params?.id;
            const filter = { _id: ObjectId(id) };
            updateDoc = {
                $set: {
                    advertised: true
                }
            };
            const options = { upsert: true };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // 🍒Delete A Product From Database
        app.delete('/products/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        // 🍒Get Products By Category
        app.get('/categories/:id', async (req, res) => {
            const id = req?.params?.id;
            // Get Category By Id
            let category;
            if (id === '1') category = 'Yamaha';
            else if (id === '2') category = 'Honda';
            else if (id === '3') category = 'Suzuki';
            else if (id === '4') category = 'Hero';
            else if (id === '5') category = 'Bajaj';
            else category = 'TVS';
            const query = { category: category };
            const products = await productCollection.find(query).toArray();
            // Check If Product Seller Verified
            // const usersQuery = { status: 'Verified' };
            // const users = await userCollection.find(usersQuery).toArray();
            // users.forEach(user => {
            //     const verifiedProducts = products.filter(product => product?.email === user?.email);
            //     verifiedProducts.map(verifiedProduct => {
            //         app.patch('/categories/:id', async (req, res) => {
            //             const email = verifiedProduct?.email;
            //             filter = { email: email };
            //             const updateDoc = {
            //                 $set: {
            //                     isSellerVerified: true
            //                 }
            //             };
            //             const result = await productCollection.updateMany(filter, updateDoc);
            //             res.send(result);
            //         });
            //     });
            // });
            res.send(products);
        });

        // 🌼Blogs
        // 🍒Get Blogs From Database
        app.get('/blogs', async (req, res) => {
            const query = {};
            const blogs = await blogCollection.find(query).toArray();
            res.send(blogs);
        });

        // 🍒Get A Blog From Database By Id
        app.get('/blogs/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const blog = await blogCollection.findOne(query);
            res.send(blog);
        });
    }
    finally { }
};
run().catch(console.dir);

// Testing
app.get('/', async (req, res) => res.send('Motorbike Trader Server Running'));
app.listen(port, () => console.log(`Motorbike Trader Server Running On Port: ${port}`));