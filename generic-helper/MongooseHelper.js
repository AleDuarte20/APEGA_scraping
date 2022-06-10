// const { MongoClient} = require('mongodb');
const mongoose = require('mongoose');
logger = require('./Log').build()

const Settings = require('../Settings')
settings = Settings.build();


class MongooseHelper {
    constructor(server,database) {
      server ? this.server = server : null
      database ? this.database = database : null
    };
    
    //MongoClient
    // async connect() {
    //   try {
    //     this.mongoClient = await MongoClient.connect(`mongodb://${this.server}/${this.database}`, {useNewUrlParser: true});
    //     this.db = this.mongoClient.db(this.database);
    //     logger.info('Successfully connected to MongoDB');
    //   } catch (error) {
    //     logger.info(error);
    //   }
    // }
    
    // async disconnect() {
    //   try{ this.mongoClient ? this.mongoClient.close() : null; }catch(error){};
    //   logger.info('Closed mongodb');
    // }

    //mongoose
    async connect() {
      try{await mongoose.connect(`mongodb://${this.server}/${this.database}`, {useNewUrlParser: true});
        logger.info('Successfully connected to MongoDB');
      } catch(error){
        logger.info(error);
      }
    };
    async disconnect() {
      try{await mongoose.disconnect()}catch(error){logger.info(error)}
      logger.info('Closed mongodb');
    };

  };
  
  module.exports = MongooseHelper;