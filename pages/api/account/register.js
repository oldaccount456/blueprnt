const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const {account, currentJwt, loginHistory} = require('@/lib/database');
const botChecks = require('@/lib/botChecks').default;

const {validateStr, validateEmail} = require('@/utils/validator');
const getIp = require('@/utils/getIp').default;

export default async function create(req, res) {
    if(req.method === 'POST'){
        if(!validateStr(req.body.username)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid username',
                successful: false
            });
        }

        if(req.body.username.length >= 30){
            return res.status(400).json({
                message: 'You sent an invalid type of request, your username cannot be 30 characters or over',
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

        if(!validateStr(req.body.email)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid email address',
                successful: false
            });
        }
       
        if(!req.body.email.length > 320){
            return res.status(400).json({
                message: 'You sent an invalid type of request, your entire email address cannot be over 320 characters long',
                successful: false
            });
        }

        if(!validateEmail(req.body.email)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid email address',
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

        if(userQuery){
            return res.status(200).json({
                message: 'This username is already taken, please try another username.',
                successful: false
            });
        }

        const emailQuery = await account.findOne({where: {
            email: req.body.email
        }});

        if(emailQuery){
            return res.status(200).json({
                message: 'This email is already being used, please try another email address.',
                successful: false
            });
        }

        const password = await bcrypt.hash(req.body.password, 12);

        const newAccount = await account.create({
            id: null,
            username: req.body.username,
            password: password,
            email: req.body.email,
        });

        const token = jwt.sign({username: newAccount.username}, process.env.JWT_SECRET, {expiresIn: '24h'});
        const ipAddress = getIp(req);
        
        await currentJwt.create({
            id: null,
            account_id: newAccount.id,
            jwt_token: token
        });
        await loginHistory.create({
            id: null,
            account_id: newAccount.id,
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
