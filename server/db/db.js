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
        this.users = this.dbMain.collection("users");
    }
    async createSchemeCollection(){
        return await this.dbMain.createCollection("schemes");
    }

    async createUserCollection(){
        return await this.dbMain.createCollection("users");
    }
    async insertScheme({url, json, user}) {
        await this.collection.insertOne({url,json, user});
    }

    async findScheme(url){
        return this.collection.findOne({url});
    }

    async updateScheme(url,data){
        return await this.collection.updateOne({url},{$set:data},{upsert:true});
    }

    async deleteScheme (url){
        return this.collection.remove({url});
    }
    async findUser(username){
        return this.users.findOne({username});
    }

    async createUser({username, password}){
        return this.users.insertOne({username,password});
    }

    async findAllUserSchemes(username){
        return this.collection.find({user:username},{projection:{json:0,user:0,_id:0}}).toArray();
    }

}
module.exports = {
    db
}