//create db
const pg = require('pg');
//connect to db
const client = new pg.Client('postgres://localhost/icecreamshop_db');

//Express server
const express=require('express');
const app=express();

//set up port to listedn
const port = 3000;
app.listen(port);

//cors library
const cors=require('cors');
app.use(cors());

const init=async ()=>{
  await client.connect();
  console.log("connected to db");

  // const SQL1=`CREATE TABLE flavors(
  //             id SERIAL PRIMARY KEY,
  //             name VARCHAR(20)
  // )`
  // const dbrespose=await client.query(SQL1);
  // console.log("table created")

  //data seeding
  const SQL = `INSERT INTO flavors (name) VALUES ('pineapple');`
  const dbrespose=await client.query(SQL);
  console.log("data seeded....");
}

init();

//configure Express route for /api/icecream
app.get('/api/icecream', async (req,res,next)=>{
     try{
      const SQL=`SELECT * FROM flavors;`
        const dbresponse = await client.query(SQL);
        console.log("dbresponse select *  ",dbresponse.rows);
        res.send(dbresponse.rows);
     }catch(error){
      next(error);
     }
})

//configure Express route for querying data for given id
app.get("/api/icecream/:id", async (req,res,next)=>{
 try{
    console.log("/api/icecream/:id  " ,req.params.id);
    //get records matching id = req.params.id
    const SQL =`SELECT * FROM flavors
                WHERE id=$1;`
    
    const dbresponse = await client.query(SQL,[req.params.id]);
        console.log("dbresponse /api/icecream/:id  ",dbresponse.rows);
    //handle rows=0
    if(!dbresponse.rows.length){
        //handle error use Next()
        console.log("error handling ...",req.params);
        next(
          {
            name: "Error occured",
            message:`food with ${req.params.id} not found` 
          }          
          )
          res.sendStatus(500);
          // res.send(dbresponse.rows);
    }else{
      //send back the response      
      res.send(dbresponse.rows[0]);
    }

 }catch(error){
  next(error);
 }
}
)

//configure Express route for deleting data for given id
app.delete('/api/icecream/:id',async (req,res,next)=>{
     try{
        console.log("delete /api/icecream/:id ...",req.params.id)
          const SQL = `DELETE FROM flavors
                       WHERE id=$1;`
         const dbresponse = await client.query(SQL,[req.params.id]);
         console.log("deleted record....",dbresponse.rows);
         res.sendStatus(204);
     }catch(error){
      next(error);
     }
})

//Error handler for no rows returned
app.use((error,req,res,next)=>{
  //in case of error, send back error obj
 res.send(error);
})

//Default error handler 
app.use('*',(req,res,next)=>{
   res.send("The route entered does not exist.")
})