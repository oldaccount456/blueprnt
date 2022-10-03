const {account} = require('@/lib/database');
const botChecks = require('@/lib/botChecks').default;
const {validateStr, validateUsername, validateEmail} = require('@/utils/validator');
const {createVerificationRequest} = require('@/utils/verification');

export default async function recoverAccount(req, res) {
    if(req.method === 'POST'){
        if(!validateStr(req.body.username)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid string for the username',
                successful: false
            });
        }
                
        if(!validateStr(req.body.email)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid string for the email',
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
        

        const userQuery = await account.findOne({where: {username: req.body.username}});
        if(!userQuery){
            return res.send(JSON.stringify({
                message: '',
                successful: true,
            }));
        }
        console.log(userQuery.email === req.body.email)
        if(userQuery.email === req.body.email){
            await createVerificationRequest(userQuery, 'verifyRecoveryRequest', userQuery.username);
        }
      
        return res.send(JSON.stringify({
            message: '',
            successful: true,
        }))
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}

