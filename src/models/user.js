const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')

//we will pass an object which defines all the properties for that schema into the 'Schema()'
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

//virtual property is not an actual data stored in the database
//it is a relationship between two entities --> here is between the 'user' and the 'task'.
userSchema.virtual('tasks',{    //tasks is the name given to the virtual property
    ref:'Task',
    localField:'_id',   //owner id
    foreignField:'owner'
})

//methods on the individual instance
//toJSON is allowed to run even though we are not explicitely calling it
userSchema.methods.toJSON=function(){
    //we want mongoose with just our user data
    const user=this
    //this will give us just the log profile data
    const userObject=user.toObject()

    //we can manipulate the userObject now
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar    //removing from the 'read-profile' response

    return userObject
}

//methods on the instance/individual user
userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

//setting up on the userSchema will allow it to access directly on the User model in other files
//methods on the actual on the uppercase U-> User model
userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})  //shorthand for {email:email}
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch)
    {
        throw new Error('Unable to login')
    }
    return user;
}



//'pre' running for --> before the user has been saved that is hashing of password
//normal function because () does not take the 'this' argument
//This is a MIDDLEWARE
//To continuously run the middleware, adjustments are needed to be made, like the ones made in the user routers patch file
//Hash the plain text password before saving
userSchema.pre('save',async function(next){
    const user=this

    //will be true if the user is created or updated
    //creating a hashed password of the user password and overwriting the original content with the hashed password
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }    

    next()
})

//Delete user task when user is removed
userSchema.pre('remove',async function(next){
    const user=this
    //Delete multiple tasks using the owner field
    await Task.deleteMany({owner:user._id})   //we will delete all teh tasks where the owner id will be mentioned.
    next()
})

const User=mongoose.model('User',userSchema)


module.exports=User