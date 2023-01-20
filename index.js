const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connection With MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3drcjwz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Varify JWT Function
function verifyJWT(req, res, next) {
    console.log(req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized Access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        req.decoded = decoded;
        next();
    });
};

// Run Function
async function run() {
    try {
        // Database & Collections
        const userCollection = client.db('MotorbikeTraderDatabase').collection('Users');
        const blogCollection = client.db('MotorbikeTraderDatabase').collection('Blogs');
        const productCollection = client.db('MotorbikeTraderDatabase').collection('Products');
        const bookingCollection = client.db('MotorbikeTraderDatabase').collection('Bookings');
        const paymentCollection = client.db('MotorbikeTraderDatabase').collection('Payments');

        // Verify Seller
        const verifySeller = async (req, rex, next) => {
            const decodedEmail = req.decoded.email;
            const filter = { email: decodedEmail };
            const user = await userCollection.findOne(filter);
            if (user?.role !== 'Seller') {
                return res.status(403).send({ message: 'Forbidden Access' });
            }
            next();
        };

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
        app.get('/users/buyers', verifyJWT, async (req, res) => {
            const query = {};
            const databaseUsers = await userCollection.find(query).toArray();
            // Filter Database User By Role
            const buyers = databaseUsers.filter(databaseUser => databaseUser?.role === 'Buyer');
            res.send(buyers);
        });

        // 🌼Products
        // 🍒Post A Product To Database
        app.post('/products', verifyJWT, verifySeller, async (req, res) => {
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

        // 🍒Advertise A Product From Database By Id
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

        // 🍒Delete A Product From Database By Id
        app.delete('/products/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        // 🍒Get Products By Category Id
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
            res.send(products);
        });

        // 🍒Get Advertised Products From Database By Advertised & Status Field
        app.get('/products/advertised', async (req, res) => {
            const query = { advertised: true, status: 'Available' };
            const products = await productCollection.find(query).toArray();
            res.send(products);
        });

        // 🍒Report A Product From Database By Id
        app.put('/products/report/:id', async (req, res) => {
            const id = req?.params?.id;
            const filter = { _id: ObjectId(id) };
            updateDoc = {
                $set: {
                    isReported: true
                }
            };
            const options = { upsert: true };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // 🍒Get Reported Products From Database By Is Reported Field
        app.get('/reportedproducts', async (req, res) => {
            const query = { isReported: true };
            const products = await productCollection.find(query).toArray();
            res.send(products);
        });

        // 🌼Bookings
        // 🍒Post A Booking To Database
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });

        // 🍒Get Bookings From Database By Email
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req?.query?.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Forbidden Access' });
            }
            const query = { buyerEmail: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        });

        // 🍒Get A Booking From Database By Id
        app.get('/bookings/payment/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingCollection.findOne(query);
            res.send(booking);
        });

        // 🌼Payment
        // 🍒Create Payment Intent
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking?.resellPrice;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        // 🍒Post Payment To Database
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
            // Set Booking Paid To True
            const bookingId = payment?.bookingId;
            const filter = { _id: ObjectId(bookingId) };
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionId: payment?.transactionId
                }
            }
            // Change Product Status To Sold
            const productId = payment?.productId;
            const productFilter = { _id: ObjectId(productId) };
            const productUpdateDoc = {
                $set: {
                    status: 'Sold'
                }
            }
            const updatedResult = await bookingCollection.updateOne(filter, updateDoc);
            const productUpdatedReasult = await productCollection.updateOne(productFilter, productUpdateDoc);
            res.send(result);
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

        // 🌼JWT
        // 🍒Get Users & Send JWT Token
        // node > require('crypto').randomBytes(64).toString('hex')
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            console.log(user);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' });
        });
    }
    finally { }
};
run().catch(console.dir);

// Testing
app.get('/', async (req, res) => res.send('Motorbike Trader Server Running'));
app.listen(port, () => console.log(`Motorbike Trader Server Running On Port: ${port}`));