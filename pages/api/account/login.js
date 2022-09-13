const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {account, currentJwt, loginHistory} = require('@/lib/database');
const botChecks = require('@/lib/botChecks').default;

const {validateStr} = require('@/utils/validator');
const getIp = require('@/utils/getIp').default;


export default async function login(req, res) {
    if(req.method === 'POST'){
        if(!validateStr(req.body.username)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid username',
                successful: false
            });
        }

        if(req.body.username.length >= 30){
            return res.status(400).json({
                message: 'You sent an invalid type of request, your username is not 30 characters or over',
                successful: false
            });
        }
        
        if(!validateStr(req.body.password)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid password',
                successful: false
            });
        }

        if(req.body.password.length < 5){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a password that is more than 5 characters',
                successful: false
            });
        }

        try{   
            await botChecks(req, res);
        }
        catch(e){
            console.log(e)
            return res.status(403).json({
                message: e,
                successful: false
            });
        }
        
        const userQuery = await account.findOne({where: {
            username: req.body.username
        }});

        if(!userQuery){
            return res.status(200).json({
                message: 'This username does not exist in our systems.',
                successful: false
            });
        }
      
        const checkPassword = await bcrypt.compare(req.body.password, userQuery.password);

        if(!checkPassword){
            return res.status(401).json({
                message: 'Your password is incorrect.',
                successful: false
            });
        }
        const token = jwt.sign({username: userQuery.username}, process.env.JWT_SECRET, {expiresIn: '24h'});
        const ipAddress = getIp(req);
        
        await currentJwt.create({
            id: null,
            account_id: userQuery.id,
            jwt_token: token
        });
        await loginHistory.create({
            id: null,
            account_id: userQuery.id,
            ip_address: ipAddress
        });
        return res.send(JSON.stringify({
            message: '',
            successful: true,
            token: token
        }))
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}


