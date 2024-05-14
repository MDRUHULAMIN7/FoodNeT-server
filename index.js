const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
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
app.use(cookieParser())
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

// midlewaeres

const logger = (req,res,next)=>{
  console.log ( 'logger',req.method,req.url);
  next();
}

const verrifyToken=(req,res,next)=>{
  const token=req?.cookies?.token;
  if(!token){
    return res.status(401).send({message:'unauthorized access'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err, decoded)=>{
if(err){
  return res.status(401).send({message:'unauthorized access'})
}

req.user = decoded;
next()
  })
  console.log('token in middlewre',token);
  
}
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

app.get('/foods-email/:email',logger,verrifyToken,async(req,res)=>{
  const email = req.params.email;
  console.log('token owner info',req.user);
  // if(req.user.email !== req.query.email ){
  //   return res.status(403).send({message:'forbiden access'})
  // }
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
      =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
console.log('token',token);
      res.cookie('token', token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production', 
        // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
secure:true,
sameSite:'none',
maxAge:60*60*1000
    })
      .send({success:true,token})
    })

    // app.post('/logout',async(req,res)=>{
    //   const user = req.body;
    //   console.log('logout');
    //   res.clearCookie('token',{maxAge:0}).send({success:true})
    // })
    app.get('/logout', async (req, res) => {

      res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true })
      .send({ success: true })
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