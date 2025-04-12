const { MongoClient } = require('mongodb');
// const mongoose = require('mongoose');
logger = require('./Log').build()

const Settings = require('../Settings')
settings = Settings.build();


class MongoHelper {
    constructor({ server, dbName }) {
        this.server = server ? server : 'localhost:27017'
        this.dbName = dbName ? dbName : 'Apega'
    };

    //MongoClient
    async connect() {
        logger.info(`try to conect mongodb://${this.server}/${this.dbName}`)
        try {
            this.mongoClient = await MongoClient.connect(`mongodb://${this.server}/${this.dbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
            this.db = this.mongoClient.db(this.dbName);
            logger.info('Successfully connected to MongoDB');
            return true
        } catch (error) {
            logger.info(error);
        }
    }

    async disconnect() {
        try { this.mongoClient ? this.mongoClient.close() : null; } catch (error) { };
        logger.info('Closed mongodb');
    }

    //mongoose
    // async connect() {
    //   try{mongoose.connect(`mongodb://${this.server}/${this.database}`, {useNewUrlParser: true});
    //     logger.info('Successfully connected to MongoDB');
    //   } catch(error){
    //     logger.info(error);
    //   }
    // };
    // async disconnect() {
    //   try{await mongoose.disconnect()}catch(error){logger.info(error)}
    //   logger.info('Closed mongodb');
    // };

};

module.exports = MongoHelper;
// module.exports = MongooseHelper;