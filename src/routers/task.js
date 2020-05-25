const express=require('express')
const Task=require('../models/task')
const auth=require('../middleware/auth')
const router=new express.Router()

//###########TASKS######################
router.post('/tasks',auth,async(req,res)=>{
    //const task=new Task(req.body)

    const task=new Task({
        ...req.body,
       owner: req.user._id 
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(404).send(e)
    }

    // task.save().then(()=>{
    //     res.status(201).send(task)
    // }).catch((e)=>{
    //     req.status(400).send(e)
    // })
})


//GET /tasks?completed=false/true
//GET /tasks?limit=10&skip=0    --> skip=0 means fetching the first page on google, skip=2 means fetching the second page on google, skip=4 means third page, 6 means 4th page and so on.
//initially if we have only four tasks then for limit=2&skip=0, we get our first two tasks then limit=2&skip=2, we get our next two tasks that are for the second page
//if limit=3, then the skip for the pages can be done as 0,3,6,9,......
//GET /tasks?sortBy=createdAt_asc/desc OR createdAt:asc/desc
router.get('/tasks',auth,async(req,res)=>{
    const match={}
    const sort={}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'    //to convert the string into boolean data type
    }

    //createdAt:-1 //desc:-1 -->asc will show from the first task, desc will show from the last task
    //completed:1    //-1 will show true first then will show false first
    if(req.query.sortBy)
    {
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1   //ternary operator
    }

    try{
        //const tasks=await Task.find({owner:req.user._id})
        //OR
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit), //limit to the number of tasks taht can be shown
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate() //'tasks' is the virtual relationship made in the user model
        res.send(req.user.tasks)
        res.send(tasks)
    }catch(e){
        res.status(500).send()
    }
    
    // Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch ((e)=>{
    //     res.status(500).send()
    // })
})

router.get('/tasks/:id',auth,async(req,res)=>{
    const _id=req.params.id

    try{
        //const task=await Task.findById(_id)
        const task=await Task.findOne({_id,owner:req.user._id})

        if(!task)
        {
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }

    // Task.findById(_id).then((task)=>{
    //     if(!task){
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})

router.patch('/tasks/:id',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['description','completed']
    const isValidOperation=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid Updates'})
    }
    
    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        //const task=await Task.findById(req.params.id)

        //const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update)=>{
            task[update]=req.body[update]
        })

        await task.save()

        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
        //const task=await Task.findByIdAndDelete(req.params.id)
        
        //we are basically searching for the task and his respective owner
        //first parameter is the search parameter for the task, the second parameter is the id of the owner who has the respective task
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})

        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})



module.exports=router
