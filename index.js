var express = require('express');
var bodyParser = require('body-parser');
const MongoHelper = require('./MongoHelper');
var jsv = require('json-validator');
var jsoncreater = require('jsonwebtoken');
var jwt = require('express-jwt');
var bcrypt = require('bcryptjs');
const secret = require('./config/example.json').secret;
var cors = require('cors');

var app = express();
var router = express.Router();
router.use(jwt({
    secret: secret,
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring (req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use('/api', router);


const validJSON = (json) => {
    let error_messages = jsv.validate(json, userSchema);
    return !error_messages.length ? true : false;
}

var userSchema = {
    username: {
        required: true,
        isLength: [4, 20]
    },
    password: {
        required: true,
        isLength: [4, 20]
    }
}

router.get('/', (req, res) =>{
    if(req.user){
        res.send({
            result:{
                message:"valid"
            }
        })
    }else{
        res.send({
            error:{
                message:"invalid"
            }
        })
    }
})
router.post('/register', async (req, res) => {
    if(!validJSON(req.body)){
        res.send({"error":{"message":"error"}});
        return;
    }
    const helper = new MongoHelper();
    try{
        let result = await helper.client.getUser(req.body.username, 'users');
        console.log(result);
        if(result){
            var token = jsoncreater.sign({id: result._id}, secret, {expiresIn: 86400});
            res.send({auth:true, token: token});
        }else{
            console.log('hello')
            res.send({
                "error":{
                    "message":"Couldnt verify user and therefore no token was generated"
                }
            })
        }
    }catch(e){
        console.log(e)
        res.send({
            "error":{
                message:"JSON.stringify(e)"
            }
        });
    }
})
router.post('/insert/user',async (req, res) => {
   const helper = new MongoHelper();
    if(!validJSON(req.body)){
        res.send(false);
    }
    let username = req.body.username;
    let hashpassword = bcrypt.hashSync(req.body.password, 8);
    let result = await helper.client.availableUsername(username, "users");
    if(result){
        finalResult = await helper.client.Insert({
            "username":username,
            "password":hashpassword
        }, "users");
    }else{
        finalResult = "Username already taken";
    }
    res.send({
        "result": finalResult
    });
    
})

console.log('Listening on port 3000');
app.listen(3000);