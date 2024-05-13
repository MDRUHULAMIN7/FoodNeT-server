const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 5000;

app.use(cors(
  {
    origin:[
      'http://localhost:5173'
    ],
    credentials:true
  }
));
app.use(express.json());

// console.log(process.env.DB_PASS,process.env.DB_USER);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aymctjj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    // Send a ping to confirm a successful connection

    const foodsCollection = client.db('FoodNeT').collection('foods');


app.patch('/foods/:id',async(req,res)=>{
    const id =req.params.id
    const foodstatus = req.body;
    const options ={upsert:true};
    const query = {_id: new ObjectId(id)}
    const updateDoc ={
        $set:foodstatus,
    }
    const result = await foodsCollection.updateOne(query,updateDoc,options)
    res.send(result)
})
// updatefood

app.put('/foods-update/:id',async(req,res)=>{
  const id = req.params.id;
  const filter={_id:new ObjectId(id)}
  const options={upsert:true}
  const updatedFood = req.body;

  const food={
    $set:{
      donatorname:updatedFood.donatorname,
      donatoremail:updatedFood.donatoremail,
      donatorphoto:updatedFood.donatorphoto,
      name:updatedFood.name,
      image:updatedFood.image,
      quantity:updatedFood.quantity,
      location:updatedFood.location,
      date:updatedFood.date,
      foodstatus:updatedFood.foodstatus,
      additonalnotes:updatedFood.additonalnotes


    }
  }
  const result = await foodsCollection.updateOne(filter,food,options)
  res.send(result)
})


// delete food
app.delete('/foods-id/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id:new ObjectId(id)}
  const result = await foodsCollection.deleteOne(query)
  res.send(result)
})





// 
app.get('/foods/:search',async(req,res)=>{
  const search = req.params.search;
  let query={
    name:{$regex:search},
  }
  const result = await foodsCollection.find(query).toArray();
  res.send(result)
})

app.get('/foods-email/:email',async(req,res)=>{
  const email = req.params.email;
  const query={ donatoremail:email}
  

  const result= await foodsCollection.find(query).toArray();
  res.send(result)
})


    app.get('/foods',async(req,res)=>{
        const cursor = foodsCollection.find()

        const result = await cursor.toArray();
        res.send(result)
    })


    // auth releted  
    app.post('/jwt',async(req,res)=>{
      const user = req.body;
      console.log('used for token',user);
      const token 
      =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'333d'})

      res.send({token})
    })
 

    app.post('/foods',async(req,res)=>{
        const newFoods = req.body;
        const result = await foodsCollection.insertOne(newFoods)
        res.send(result)
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('server running')
})



app.listen(port,()=>{
    console.log(`assignment-11-server is running on port:${port}`);
})