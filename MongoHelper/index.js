const MongoClient = require('mongodb').MongoClient;
const db_config = require('../config/db.json');
const assert = require('assert');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const secret = require('../config/example.json').secret;
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
        this.getUser = this.getUser.bind(this);
        this.validateToken = this.validateToken.bind(this);
    }
    getUser(username, collectionName){
        const client = new MongoClient(this.url, { useNewUrlParser: true });
        return new Promise((resolve, reject) => {
            try{
                client.connect(async (err) => {
                    assert.equal(null, err);
                    console.log("Connected correctly");
                    const db = client.db(this.dbName);
                    const collection = db.collection(collectionName);
                    let result = await collection.findOne({
                        username: username
                    });
                    resolve(result);
                });
            }catch{
                reject(false)
            }
        })
    }
    async validateToken(token){
        try{
            let result = await jwt.verify(token, secret);
            console.log(result);
            return result.id ? true : false;
        }catch{
            return false;
        }
    }
    async validateUser(user, collectionName){
        try{
            let newUser = await this.getUser(user.username, collectionName);
            let result = await bcrypt.compare(user.password, newUser.password)
            console.log(result);
            return result;
        }catch(e){
            return e;
            // return new Promise((resolve, reject) => reject())
        }
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