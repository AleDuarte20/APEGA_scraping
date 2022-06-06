const mongooseHelper = require('./dbScraping/db');
const db = new mongooseHelper('127.0.0.1:27017','Apega')

async function testMongoDb(){

    await db.connect()
    const list = await db.db
    .collection('apegadatos')
    .find({
        // postalCode:"Without Postal Code",
        province:"BC"
    })
    // .limit(5)
    .toArray()
    await db.disconnect()
    console.log((`list: ${JSON.stringify(list,null,2)}`))
    return list
}

;(async () =>{
    await testMongoDb()
 })()