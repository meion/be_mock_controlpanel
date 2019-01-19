import mongoose from "mongoose";
import assert from "assert";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { getModels } from './Models';
import db_config from "../config/db.json";
import config from "../config/example.json";

const secret = config.secret;
let db_connected = false;

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});
const db = mongoose.connection;

db.on('error', err => {
    console.error(err);
});
db.once('open', () => {
    db_connected = true;
});

function isConnected() {
    let timer;
    let counter = 0;
    function waitUntil(callback) {
        if (!db_connected) {
            counter++;
            if (counter >= 10) {
                callback(false);
                return;
            }
            timer = setTimeout(waitUntil, 500, callback);
        } else {
            clearTimeout(timer);
            callback(true);
        }
    }
    return new Promise( (resolve,reject) => {
        waitUntil(status => {
            if (status) {
                console.log("Connected correctly");
                resolve();
            } else {
                reject();
            }
        });
    });
}

const models = getModels();


function getUser(username, collectionName) {
    return new Promise(async (resolve, reject) => {
        try {
            await isConnected();
            const collection = db.collection(collectionName);
            let result = await collection.findOne({
                username: username
            });
            console.log('123123')
            resolve({user: result});
        } catch(e) {
            console.log('1123213')
            reject({
                error:{
                    message: JSON.stringify(e)
                }
            })
        }
    })
}

async function validateToken(token) {
    try {
        let result = await jwt.verify(token, secret);
        console.log(result);
        return result.id ? true : false;
    } catch {
        return false;
    }
}
async function validateUser(user, collectionName) {
    try {
        let newUser = await this.getUser(user.username, collectionName);
        let result = await bcrypt.compare(user.password, newUser.password)
        console.log(result);
        return result;
    } catch(e) {
        return e;
        // return new Promise((resolve, reject) => reject())
    }
}

function availableUsername(username, collectionName){
    return new Promise(async (resolve ,reject) => {
        try {
            await isConnected();
            const collection = db.collection(collectionName);
            let result = await collection.findOne({
                username: username
            });
            console.log(result);
            resolve(result === null ? true : false)
        } catch {
            reject(false);
        }
    })
}
function InsertMany(values, collectionName) {
    return new Promise(async (resolve, reject) => {
        try {
            await isConnected();
            const collection = db.collection(collectionName);
            let result = await collection.insertMany(values);
            console.log(result);
            resolve(result.result);
        } catch (err) {
            reject(err);
        }
    });
}
function InitDevEnviroment() {
    return new Promise(async (resolve,reject) => {
        await isConnected();
        db.collection("Fnutter")
        // const collection = db.collection(collectionName);
        // let result = await collection.insertMany(values);
        resolve(result.result);
    })
}
function Insert(value, collectionName) {
    return new Promise(async (resolve, reject) => {
        try{
            await isConnected();
            const collection = db.collection(collectionName);
            let result = await collection.insertOne(value);
            client.close();
            resolve(result.result)
        }catch{
            reject("Something went wrong");
        }
    })
}

export default {
    availableUsername,
    Insert,
    InsertMany,
    getUser
};
