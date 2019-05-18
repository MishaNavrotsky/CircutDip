class db {
    constructor(connectString) {
        this.mongoClient = require("mongodb").MongoClient;
        this.connection = undefined;
        this.collection = undefined;
        this.dbMain = undefined;
    }
    async connect(connectString) {
        this.connection = await this.mongoClient(connectString, {
            useNewUrlParser: true
        }).connect();
        this.dbMain = this.connection.db("main");
        this.collection = this.dbMain.collection("schemes");
    }
    async createCollection(){
        return await this.dbMain.createCollection("schemes");
    }
    async insert({url, json}) {
        await this.collection.insertOne({url,json});
    }

    async find(url){
        return this.collection.findOne({url});
    }

    async update(url,data){
        return await this.collection.updateOne({url},{$set:{data}},{upsert:true});
    }

}
module.exports = {
    db
}