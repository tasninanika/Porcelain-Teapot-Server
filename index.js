const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4vcsd99.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const teaCollection = client.db("teaDB").collection("tea");

    // user database
    const userCollection = client.db("teaDB").collection("users");

    // get data
    app.get("/tea", async (req, res) => {
      const cursor = teaCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // update data
    app.get("/tea/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await teaCollection.findOne(query);
      res.send(result);
    });

    // insert data
    app.post("/tea", async (req, res) => {
      const newTea = req.body;
      console.log(newTea);
      const result = await teaCollection.insertOne(newTea);
      res.send(result);
    });

    // update data
    app.put("/tea/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTea = req.body;
      const tea = {
        $set: {
          name: updatedTea.name,
          chef: updatedTea.chef,
          supplier: updatedTea.supplier,
          taste: updatedTea.taste,
          category: updatedTea.category,
          details: updatedTea.details,
          url: updatedTea.url,
        },
      };
      const result = await teaCollection.updateOne(filter, tea, options);
      res.send(result);
    });

    // delete data
    app.delete("/tea/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await teaCollection.deleteOne(query);
      res.send(result);
    });

    // users related apis
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log("creating new user");
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tea server is running");
});

app.listen(port, () => {
  console.log(`Server is cooking on port: ${port}`);
});
