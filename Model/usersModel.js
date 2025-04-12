const mongoose = require('mongoose')

const datosModel = new mongoose.Schema({
   
    AddressLine:String,
    City:String,
    CompanyID:String,
    Country:String,
    DateIssued:String,
    FullPracticeDesignation:String,
    LegalName:String,
    PermitNumber:String,
    PhoneAreaCode:String,
    PhoneCountryCode:String,
    PhoneNumber:String,
    Province:String,
    ResponsibleMember:String,
    ZipCode:String,
})

module.exports = mongoose.model('apegadatos', datosModel)

// const User = mongoose.model('apegadatos', datosModel)
// module.exports = User
