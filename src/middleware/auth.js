const jwt=require('jsonwebtoken')
const User=require('../models/user')

const auth=async(req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ','')
        //make sure that the token is valid and created by our server and has not expired
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        //grabbing the user from the database. Search criteria is 'id' 
        //because in user models, we have ,mentioned 'id' as the criteria for the jwt sign.
        //so,decoded has the property 'id' which can be used
        //'tokens:token' is going to look for one the values of the token in the 'tokens array' that has been provided by the user
        const user=await User.findOne({_id:decoded._id,'tokens.token':token})
        //if the user logs out, this token will be still valid.

        if(!user){
            throw new Error()
        }
        req.token=token
        req.user=user
        next()
    }catch(e){
        res.status(400).send({error:'Please authenticate.'})
    }
}

module.exports=auth