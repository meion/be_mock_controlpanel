import express from 'express';
import bodyParser from 'body-parser';
import { getUser, Insert, InsertMany, availableUsername } from './MongoHelper';
import jsonValidate from 'json-validator';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import bcrypt from 'bcrypt';
import config from './config/example.json';
import cors from 'cors';

const secret = config.secret;

var app = express();
var router = express.Router();
router.use(expressJwt({
    secret: secret,
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring (req) {
        const authorization = req.headers.authorization ? req.headers.authorization.split(' ') : false;
        if (authorization && authorization[0] === "Bearer") {
            return authorization[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
}).unless(({path: ['/api/register']})));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use('/api', router);


const validJSON = (json) => {
    let error_messages = jsonValidate.validate(json, userSchema);
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
    res.send({
        result:{
            message:"valid"
        }
    })
})
router.post('/register', async (req, res) => {
    if(!validJSON(req.body)){
        res.send({"error":{"message":"error"}});
        return;
    }
    try{
        let result = await getUser(req.body.username, 'users');
        let correctPass = await bcrypt.compare(req.body.password, result.user.password);
        if(result.user !== 'null' && correctPass){
            var token = jwt.sign({id: result.user._id}, secret, {expiresIn: 86400});
            res.send({
                auth:true, 
                token: token,
                roles: result.user.roles
            });
        }else{
            res.send({error:{message:'not a valid user'}})
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
router.post('/InitDevDB', async(req, res) => {

})


router.post('/insert/Items', async (req, res) => {
    await InsertMany(req.body.values, "Item");
    res.send({
        "result": "OK"
    });
});


router.post('/insert/user',async (req, res) => {
    if(!validJSON(req.body)){
        res.send(false);
    }
    let username = req.body.username;
    let hashpassword = bcrypt.hashSync(req.body.password, 8);
    let result = await availableUsername(username, "users");
    if(result){
        finalResult = await Insert({
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
