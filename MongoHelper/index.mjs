import mongoose from "mongoose";
import assert from "assert";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { Item, Group, Person, Order } from './Models';
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



export function getUser(username) {
    return new Promise(async (resolve, reject) => {
        try {
            await isConnected();
            let result = await Person.findOne({
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
async function validateUser(user) {
    try {
        let newUser = await this.getUser(user.username);
        let result = await bcrypt.compare(user.password, newUser.password)
        console.log(result);
        return result;
    } catch(e) {
        return e;
        // return new Promise((resolve, reject) => reject())
    }
}

export function availableUsername(username){
    return new Promise(async (resolve ,reject) => {
        try {
            await isConnected();
            let result = await Person.findOne({
                username: username
            });
            console.log(result);
            resolve(result === null ? true : false)
        } catch {
            reject(false);
        }
    })
}

export function InsertMany(values, model) {
    return new Promise(async (resolve, reject) => {
        try {
            await isConnected();
            let result = await model.insertMany(values);
            console.log(result);
            resolve(result.result);
        } catch (err) {
            reject(err);
        }
    });
}

export function InitDevEnviroment() {
    return new Promise(async (resolve,reject) => {
        await isConnected();
        db.collection("Fnutter")
        // let result = await collection.insertMany(values);
        resolve(result.result);
    })
}

export function Insert(value, model) {
    return new Promise(async (resolve, reject) => {
        try{
            await isConnected();
            let result = await model.insertOne(value);
            client.close();
            resolve(result.result)
        }catch{
            reject("Something went wrong");
        }
    })
}
