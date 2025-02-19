const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/testapp", { useNewUrlParser: true, useUnifiedTopology: true })

const ReportSchema = mongoose.Schema({

    booktitle:String,
    book_no :Number,
    description:String,
})


module.exports=mongoose.model('ReportModel' , ReportSchema)
