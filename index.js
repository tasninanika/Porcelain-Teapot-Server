const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Test Route
app.get("/", (req, res) => {
  res.send("Tea Server is Cooking!!!");
});

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4vcsd99.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const teasCollection = client.db("PorcelainTea").collection("teas");

    // Read All Teas
    app.get("/teas", async (req, res) => {
      const data = await teasCollection.find().toArray();
      res.send(data);
    });

    // Read Single Tea
    app.get("/teas/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await teasCollection.findOne(filter);
      res.send(result);
    });

    // Create Tea
    app.post("/teas", async (req, res) => {
      const data = req.body;
      const result = await teasCollection.insertOne(data);
      res.send(result);
    });

    // Update Tea
    app.put("/teas/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTea = {
        $set: {
          name: data.name,
          chef: data.chef,
          category: data.category,
          supplier: data.supplier,
          taste: data.taste,
          details: data.details,
          photo: data.photo,
          price: data.price,
        },
      };
      const result = await teasCollection.updateOne(
        filter,
        updatedTea,
        options
      );
      res.send(result);
    });

    // Delete Tea
    app.delete("/teas/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await teasCollection.deleteOne(filter);
      res.send(result);
    });
  } finally {
    // client.close(); // Keep connection open
  }
}
run().catch(console.dir);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
