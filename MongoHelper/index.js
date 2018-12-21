const MongoClient = require('mongodb').MongoClient;
const db_config = require('../config/db.json');
const assert = require('assert');

module.exports = class MongoHelper{
    constructor(){
        this.client = new Client(db_config.url, db_config.dbName);
    }
}
class Client{
    constructor(url, dbName){
        this.url = url;
        this.dbName = dbName;
        this.client = new MongoClient(url, { useNewUrlParser: true });
        this.Insert = this.Insert.bind(this);
        this.availableUsername = this.availableUsername.bind(this);
    }
    validateUser(user, collectionName){
        const client = new MongoClient(this.url, { useNewUrlParser: true });
        let validated = false;
        return new Promise((resolve, reject) => {
            try{
                client.connect(async (err) => {
                    assert.equal(null, err);
                    console.log("Connected correctly");
                    const db = client.db(this.dbName);
                    const collection = db.collection(collectionName);
                    let result = await collection.findOne({
                        username: user.username
                    });
                    if(result !== null){
                        validated = user.username === result.username && user.password === result.password;
                    }
                    resolve(validated);
                });
            }catch{
                reject(false)
            }
        })
    }

    availableUsername(username, collectionName){
        const client = new MongoClient(this.url, { useNewUrlParser: true });
        return new Promise((resolve ,reject) => {
            try{
                client.connect(async (err) => {
                    console.log(err);
                    assert.equal(null, err);
                    console.log("Connected correctly");
                    const db = client.db(this.dbName);
                    const collection = db.collection(collectionName);
                    let result = await collection.findOne({
                        username: username
                    });
                    console.log(result);
                    resolve(result === null ? true : false)

                })
            }catch{
                reject(false);
            }
        })
    }
    async Insert(value, collectionName){
        const client = new MongoClient(this.url, { useNewUrlParser: true });
        return new Promise((resolve, reject) => {
            try{
                client.connect(async (err) => {
                    assert.equal(null, err);
                    console.log('Connected correctly');
                    const db = client.db(this.dbName);
                    const collection = db.collection(collectionName);
                    let result = await collection.insertOne(value);
                    client.close();
                    resolve(result.result)
                });
            }catch{
                reject("Something went wrong");
            }
        })
    }
}