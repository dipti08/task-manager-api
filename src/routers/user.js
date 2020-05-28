const express=require('express')
const multer=require('multer')
const sharp=require('sharp')
const User=require('../models/user')
const auth=require('../middleware/auth') //the authorisation is required to be added to the indivdual middlewares except the login and the signup
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')
const router=new express.Router()

// router.get('/test',(req,res)=>{
//     res.send('From a new file')
// })


//JSON Web Tokens(JWT) are required for login authentication systems
//JWT cab be used to expire the token after certain amount of time so that the user can logged out after certain amount of time
//or never expire the token so that the user can remain logged in for infinit amount of time


//###########USERS######################
//using async-await function of javascript instead of using the promise chaining
//Password is required when a new user is added
//Sign-up
router.post('/users',async(req,res)=>{
    const user=new User(req.body)

    try{
        await user.save() 
        sendWelcomeEmail(user.email,user.name)
        //authorization created as soon as the new user comes in
        const token=await user.generateAuthToken()
        res.status(201).send({user,token})
        
    }catch(e){
        res.status(400).send(e)
    }
    
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
})

//authorization for logging in
router.post('/users/login',async (req,res)=>{
    try{
        //functions -->findByCredentials and generateAuthToken are present inside the 'user models'
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        //when we pass an object to res.send(), it call JSON.stringify() behind the scene
        res.send({user,token})  //using the shorthand syntax to define both the properties, instead of using this-->{user:user.getPublicProfile()}, we use only {user} because in the user model, we are writing a toJSON method which is allowed to run without even calling explicitely
    }catch(e){
        res.status(400).send()
    }
})

//for logout
//if we are loggen in from multiple devices and we want to logout from one but not from other devices
router.post('/users/logout',auth,async(req,res)=>{
    try{
        //since we are already authenticated, no need to fetch the user again
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()

    }
})

//to logout all the sessions
router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})


//async function will only be run if the middleware 'auth' calls the next function
router.get('/users/me',auth,async(req,res)=>{
    //#####'id' is not required when the user is already logged in. This route will send the user profile when the user is logged in######
    //this function will only be run if the user is authenticated
    //Change the route from 'READ USERS' to 'READ PROFILE' in postman
    res.send(req.user)

    //When a user is logged in, no need to show all the users information. Only the logged in users profile information will be shown.
    // try{
    //     const users=await User.find({})
    //     res.send(users)
    // }catch(e){
    //     res.status(500).send()
    // }

    //#####old method#######
    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})


//#####We should not be bale to get a user by id unless it is our own user id
//#####For this,we have our route above to fetch our own user id
// //get the details for the dynamic value provided by the user
// //req.params is the id that is provided in the call
// router.get('/users/:id',async(req,res)=>{
//     const _id=req.params.id
    
//     try{
//         const user=await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(500).send()
//     }

//     //#####Old Method#########
//     // User.findById(_id).then((user)=>{
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send()
//     // })
// })

//Password is required when a user updates something
router.patch('/users/me',auth,async(req,res)=>{
    //trying to update a property which is something we cannot change
    //that is trying to change a roperty which is not present in the database eg. height is ignored by the mongoose
    //so, writing a code for only those properties which
    //are allowed to be changed
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','email','password','age']
    //if we have all true->every will return true
    //even if one false is present, every will return false
    const isValidOperation=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates'})
    }

    //taking the input from the user as to what field he wants to update instead of statistically mentioning
    try{

        //adjustment made to update for hashing of password
        //done in the user models' userSchema
        
        //const user=await User.findById(req.params.id)

        updates.forEach((update)=>{
            req.user[update]=req.body[update]
        })

        await req.user.save()
        ///////////////////////////////////////

       // const user=await User.findByIdAndUpdate(req.params.id, req.body,{new:true,runValidators:true})

       //not needed becuase we do not need to check if the user existed or not (using the id) 
       //we are talking of our own profile which will only be visible if the user is logged in
        // if(!user){//if there is no user with the id mentioned
        //     return res.status(404).send()
        // }

        res.send(req.user)
    }catch(e){
        //if validation is not handled
        res.status(400).send(e)
    }
})

//instead of using /users/:id->use /users/me to avoid accessing other users maliciously
//the below function allows the logged in user to delete their own profile
router.delete('/users/me',auth,async(req,res)=>{
    try{
        // const user=await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove() //deleting a user requires authentication which is why we rae using 'req.user'
        sendCancelationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        return res.status(500).send()
    }
})


const upload=multer({
    //dest:'avatars', //we do not want the profile pic to be saved insode the file system, hence this is not required. Instead, we will directly pass the image inside our function which will upload it on the server and can be viewed inside the Robo3T.
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})

//this route will be used to upload or update a new avatar picture in our profile
router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer //avatar is a new field created insode the user model
    await req.user.save()
    res.send()
},(error,req,res,next)=>{    //this part handles the error that might occur for not uploading anything
    res.status(400).send({error:error.message})
})

//this route will be used to delete the picture from our profile
router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

//to directly view the image in the browser using the owner id that is
//allowing the clients to fetch the images using the url structure
router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)

        if(!user||!user.avatar){
            throw new Error()
        }

        res.set('Content-type','image/png')   //setting up the response headerss
        res.send(user.avatar)

    }catch(e){
        res.status(404).send()
    }
})

module.exports=router