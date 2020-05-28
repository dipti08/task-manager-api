//REST-API

//use of envrionment variables for --> security and customizability
//since index.js and app.js are duplicates of each other, we dont require to keep the duplicates.
//we are only keeping the port and app.listen
//for testing, we will be using app.js

const app=require('./app')

//Because we need to deploy our application on heroku
const port=process.env.PORT   //process.env -> where our environment variables are stored provided by Heroku when Heroku runs our node application

app.listen(port,()=>{
    console.log('Server is up on port '+port)
})

