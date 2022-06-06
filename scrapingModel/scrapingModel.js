const mongoose = require('mongoose')

const datosModel = new mongoose.Schema({
    name:{
        type: String,
        unique: true,
    },
    // name:String,
    permitNumber:String,
    permitToPractice:String,
    address:String,
    phoneNumber:String,
    licenseDate:String,
    city:String,
    postalCode:String,
    province:String,
    member:String
})

module.exports = mongoose.model('apegadatos', datosModel)

// const User = mongoose.model('apegadatos', datosModel)
// module.exports = User
