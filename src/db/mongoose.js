const mongoose=require('mongoose')

//mongoose data will look a bit different
//So, its database name is 'task-manager-api'
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false     //to avoid the deprication warning
})


// const me=new User({
//     name:'     Dipti     ',
//     email:'DIPTI@AGARWAL.IO    ',
//     password:'phone098!'
// })

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log('Error',error)
// })


// const task=new Task({
//     description:'      Pot Plants      ',
// })

// //then is a promise method call
// task.save().then(()=>{
//     console.log(task)
// }).catch((error)=>{
//     console.log('Error',error)
// })


