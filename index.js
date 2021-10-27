const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express();
const cors = require ('cors');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sg0vz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
try {
  await client.connect();
  const database = client.db('Online_shop');
  const productCollection = database.collection('products');
  const orderCollection = database.collection('order');

  //get producta api
  app.get('/products', async(req,res)=>{
   const cursor = productCollection.find({});
   const count = await cursor.count();
  const page = req.query.page;
  const size = parseInt(req.query.size);
  let products;
  if(page){
  products = await cursor.skip(page*size).limit(size).toArray();
  }
  else{
    products = await cursor.toArray();
  }
  res.send({
    count,
    products
  });
  });

  //use post to get data by keys
  app.post('/products/bykeys', async(req, res)=>{
    const keys = req.body;
    const quary = {key: {$in: keys}}
    const products = await productCollection.find(quary).toArray();
    res.json(products);
  })

  //order api add
  app.post('/orders', async (req, res)=> {
    const order = req.body;
    const result = await orderCollection.insertOne(order);
    res.json(result);
  })
}

finally{
  // await client.close();
}
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ema john is running.')
  });

  app.listen(port, () => {
    console.log('server running at port', port);
  })