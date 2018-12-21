var express = require('express');
var bodyParser = require('body-parser');
const MongoHelper = require('./MongoHelper');
var jsv = require('json-validator');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const secret = require('./config/example.json').secret;
var cors = require('cors');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

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



app.get('/', function(req, res){
    res.send('hello')
});

const validJSON = (json) => {
    let error_messages = jsv.validate(json, userSchema);
    return !error_messages.length ? true : false;
}

const getToken = (headers) => {
    if(!headers['authorization'])return;
    let token = headers['authorization'].split(' ');
    return token[token.length - 1];
}
const validateRequest = async (headers, client) => {
    return await client.validateToken(getToken(headers));

}
const error = {
    error:{
        "reason":"unauthorized",
        "message":"Got a valid JWT-token?"
    }
}

app.post('/register', async (req, res) => {
    if(!validJSON(req.body)){
        res.send({"error":{"message":"erroe"}});
        return;
    }
    const helper = new MongoHelper();
    try{
        let result = await helper.client.getUser(req.body.username, 'users');
        console.log(result);
        if(result){
            var token = jwt.sign({id: result._id}, secret, {expiresIn: 86400});
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
app.get('/validate/token', async (req,res) => {
    const helper = new MongoHelper();
    var token = getToken(req.headers);
    let validRequest = await validateRequest(req.headers, helper.client);
    if(!validRequest){
        res.send({
            "error":{
                ...error.error
            }
        })
    }
    let result = await helper.client.validateToken(token);
    console.log(result);
    if(result){
        res.send({
            "result":{
                token: token,
                message:"is_valid"
            }
        })
    }else{
        res.send({
            "result":{
                token:token,
                message:"is_invalid"
            }
        })
    }
})


app.post('/validate/user', async (req, res) => {
    const helper = new MongoHelper();
    let validRequest = await validateRequest(req.headers, helper.client);
    if(!validRequest){
        res.send({
            "error":{
                ...error.error
            }
        });
        return;
    }
    if(!validJSON(req.body)){
        res.send(false);
    }
    try{
        let user = {
            "username": req.body.username,
            "password": req.body.password
        }
        let result = await helper.client.validateUser(user, "users");
        res.send({
            "result": result
        });
    }catch(e){
        res.send({
            "error":{
                message:"231"
            }
        })
    }

})

app.post('/insert/user',async (req, res) => {
   const helper = new MongoHelper();
   let error_messages = jsv.validate(req.body, userSchema)
   let finalResult = "";
   let validRequest = await validateRequest(req.headers, helper.client);
   if(!validRequest){
        res.send({
            "error":{
                ...error.error
            }
        })
    }
   if(error_messages.length > 0){
       res.send(error_messages);
   }else{
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
    }
       
})

console.log('Listening on port 3000');
app.listen(3000);