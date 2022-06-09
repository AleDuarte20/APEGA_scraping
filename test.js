const MongooseHelper = require('./generic-helper/MongooseHelper');
const db = new MongooseHelper('localhost:27017','Apega');
const model = require('./Model/usersModel');
process.env.uuid = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)

logger = require('./generic-helper/Log').build()
const Settings = require('./Settings')
settings = Settings.build();

// logger.info(`TEST FOR LOGGER JEJE`)


async function testMongoose(){
    await db.connect();
    const list = await model
    .find({
        // postalCode:"Without Postal Code",
        province:"BC"
    });
    await db.disconnect();
    logger.info((`list: ${JSON.stringify(list)}`));
    // logger.info((`list: ${JSON.stringify(list,null,2)}`));
    return list;
}

//for use this function you need change mongoose for mongoClient in MongooseHelper.js
async function testMongoClient(){
    await db.connect();
    const list = await db.db
    .collection('apegadatos')
    .find({
        // postalCode:"Without Postal Code",
        province:"BC"
    })
    // .limit(5)
    .toArray();
    await db.disconnect();
    logger.info((`list: ${JSON.stringify(list)}`));
    // logger.info((`list: ${JSON.stringify(list,null,2)}`));
    return list;
}

;(async () =>{
    await testMongoose();
    // await testMongoClient();
 })()