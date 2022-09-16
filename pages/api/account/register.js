const bcrypt = require("bcryptjs");
const {account} = require('@/lib/database');
const botChecks = require('@/lib/botChecks').default;

const {
    validateStr, 
    validateUsername, 
    validatePassword, 
    validateEmail
} = require('@/utils/validator');

const getIp = require('@/utils/getIp').default;

export default async function register(req, res) {
    if(req.method === 'POST'){
        if(!validateStr(req.body.username)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid string for the username',
                successful: false
            });
        }
                
        if(!validateStr(req.body.password)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid string for the password',
                successful: false
            });
        }        
        
        if(!validateStr(req.body.email)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid string for the email address',
                successful: false
            });
        }

        const isUsernameValidated = validateUsername(req.body.username, true);
        if(!isUsernameValidated.success){
            return res.status(400).json({
                message: `You sent an invalid type of request, ${isUsernameValidated.message}`,
                successful: false
            });
        }

        const isPasswordValidated = validatePassword(req.body.password, true);
        if(!isPasswordValidated.success){
            return res.status(400).json({
                message: `You sent an invalid type of request, ${isPasswordValidated.message}`,
                successful: false
            });
        }

        const isEmailValidated = validateEmail(req.body.email, true);
        if(!isEmailValidated.success){
            return res.status(400).json({
                message: `You sent an invalid type of request, ${isEmailValidated.message}`,
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

        const ipAddress = getIp(req);
        const token = await createToken(newAccount, ipAddress);
        

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
