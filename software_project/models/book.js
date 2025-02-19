const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/testapp", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB:', error));

const NewBookSchema = mongoose.Schema({
    booktitle:String,
    author :String,
    Category:String,
    description:String,
    image:String,
})


module.exports=mongoose.model('book' , NewBookSchema)
