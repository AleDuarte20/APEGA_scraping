// const { MongoClient} = require('mongodb');
const mongoose = require('mongoose');


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
    //     console.log('Successfully connected to MongoDB');
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    
    // async disconnect() {
    //   try{ this.mongoClient ? this.mongoClient.close() : null; }catch(error){};
    //   console.log('Closed mongodb');
    // }

    //mongoose
    async connect() {
      try{await mongoose.connect(`mongodb://${this.server}/${this.database}`, {useNewUrlParser: true});
        console.log('Successfully connected to MongoDB');
      } catch(error){
        console.log(error);
      }
    };
    async disconnect() {
      try{await mongoose.disconnect()}catch(error){console.log(error)}
      console.log('Closed mongodb');
    };

  };
  
  module.exports = MongooseHelper;