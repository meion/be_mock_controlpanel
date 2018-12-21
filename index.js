var express = require('express');
var bodyParser = require('body-parser');
const MongoHelper = require('./MongoHelper');
var jsv = require('json-validator');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const secret = require('./config/example.json').secret;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.post('/register', async (req, res) => {
    if(!validJSON(req.body)){
        res.send("Wrong JSON-format");
    }
    const helper = new MongoHelper();
    try{
        let result = await helper.client.getUser(req.body.username, 'users');
    }catch{
        res.send(false);
    }
    if(result){
        var token = jwt.sign({id: result._id}, secret, {expiresIn: 86400});
        res.status(200).send({auth:true, token: token})
    }else{
        res.status(500).send("Couldn't verify user and therefore no token was generated")
    }
})

app.post('/validate/user', async (req, res) => {
    const helper = new MongoHelper();
    if(!validJSON(req.body)){
        res.send(false);
    }
    try{
        let user = {
            username: req.body.username,
            password: req.body.password
        }
        let result = await helper.client.validateUser(user, "users");
        res.send(result);
    }catch{
        res.send(false)
    }

})

app.post('/insert/user',async (req, res) => {
   const helper = new MongoHelper();
   let error_messages = jsv.validate(req.body, userSchema)
   let finalResult = "";
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
       res.send(finalResult);
    }
       
})

console.log('Listening on port 3000');
app.listen(3000);