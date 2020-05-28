//here the express app will be set up and exported and our test suites can be loaded in
//and index.js will also be loaded in just as so we can call app.listen()

const express=require('express')
require('./db/mongoose')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app=express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter )

module.exports=app