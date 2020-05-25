//REST-API

//use of envrionment variables for --> security and customizability


const express=require('express')
require('./db/mongoose')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app=express()
//Because we need to deploy our application on heroku
const port=process.env.PORT   //process.env -> where our environment variables are stored provided by Heroku when Heroku runs our node application

//######Using the Express Middleware###############
//next is specefic to using middleware 
//this middleware is required to provide authentication to the other fields
//except the signup and login 
//NOTE:we have created tokens for signup and login

// app.use((req,res,next)=>{
//     if(req.method==='GET'){
//         res.send('GET requests are disabled')
//     }else{
            //next() will cause the route handlers to execute
            //if next() is not mentioned, then the postman keeps on loading and doesn't show anything
//         next()
//     }
// })

// app.use((req,res,next)=>{
//     res.status(503).send('Site is currently down. Check back soon.')
//     //since next() is not used, the other routers will not run.
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter )

app.listen(port,()=>{
    console.log('Server is up on port '+port)
})

