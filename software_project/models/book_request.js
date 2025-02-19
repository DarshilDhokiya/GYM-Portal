const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/testapp", { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).catch((error) => console.error('Failed to connect to MongoDB:', error));

const BookRequestSchema = new mongoose.Schema({
    booktitle: { type: String, required: true },
    author: { type: String, required: true },
    Category:String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true } ,
    Date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('book_request_Model', BookRequestSchema);
