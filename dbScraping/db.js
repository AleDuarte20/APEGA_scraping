// const { MongoClient} = require('mongodb');
const mongoose = require('mongoose')


class mongooseHelper {
    constructor(server,database) {
      server ? this.server = server : null
      database ? this.database = database : null
    }
    
    // async connect() {
    //   try {
    //     this.mongoClient = await MongoClient.connect(`mongodb://${this.server}/${this.database}`, {useNewUrlParser: true})
    //     this.db = this.mongoClient.db(this.database);
    //     console.log('Successfully connected to MongoDB')
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }

    async connect() {
      await mongoose.connect(`mongodb://${this.server}/${this.database}`, {useNewUrlParser: true})
      console.log('Successfully connected to MongoDB')
    }
  
    async disconnect() {
      try{await mongoose.disconnect()}catch(error){console.log(error)}
      console.log('Closed mongodb')
    }
    
    // async disconnect() {
    //   try{ this.mongoClient ? this.mongoClient.close() : null; }catch(error){}
    //   console.log('closed mongodb')
    // }
  
  }
  
  module.exports = mongooseHelper