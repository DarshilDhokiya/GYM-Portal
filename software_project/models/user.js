const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/testapp")

const userSchema = mongoose.Schema({
    name : String,
    phone:Number,
    email:String,
    username: String, 
    password: String,
    role: { 
        type: String, 
        enum: ['librarian', 'user'], 
        default: "user" 
    }

})

module.exports=mongoose.model('user' , userSchema)

