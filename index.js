var express = require('express');
var bodyParser = require('body-parser');
const MongoHelper = require('./MongoHelper');
var jsv = require('json-validator');


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

app.post('/validate/user', async (req, res) => {
    const helper = new MongoHelper();
    let error_messages = jsv.validate(req.body, userSchema);
    if(error_messages.length > 0 ){
        res.send(error_messages);
    }
    let result = await helper.client.validateUser(req.body, "users");
    res.send(result);

})

app.post('/insert/user',async (req, res) => {
   const helper = new MongoHelper();
   let error_messages = jsv.validate(req.body, userSchema)
   let finalResult = "";
   if(error_messages.length > 0){
       res.send(error_messages);
   }else{
       let username = req.body.username;
       let password = req.body.password;
       let result = await helper.client.availableUsername(username, "users");
       if(result){
           finalResult = await helper.client.Insert({
               "username":username,
               "password":password
           }, "users");
       }else{
           finalResult = "Username already taken";
       }
       res.send(finalResult);
    }
       
})

console.log('Listening on port 3000');
app.listen(3000);