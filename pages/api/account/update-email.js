const {account} = require('@/lib/database');
const {checkToken} = require('@/lib/authentication');
const botChecks = require('@/lib/botChecks').default;
const {validateStr, validateEmail} = require('@/utils/validator');
const {createVerificationRequest} = require('@/utils/verification');

export default async function updateEmail(req, res) {
    if(req.method === 'POST'){
        if(!validateStr(req.body.token)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid string for the token',
                successful: false
            });
        }
                
        if(!validateStr(req.body.newEmail)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid string for the old password',
                successful: false
            });
        }        
        
        const isEmailValidated = validateEmail(req.body.newEmail, true);
        if(!isEmailValidated.success){
            return res.status(400).json({
                message: `You sent an invalid type of request, ${isEmailValidated.message}`,
                successful: false
            });
        }

        const getUsername = async (token) => {
            try{
                const {username} = await checkToken(token);
                return username;
            }
            catch(e){
                return res.status(400).json({
                    message: 'You sent an invalid type of request, your authorization token is not valid',
                    successful: false
                });
            }
        }

        try{   
            await botChecks(req, res, false);
        }
        catch(e){
            console.log(e)
            return res.status(403).json({
                message: e,
                successful: false
            });
        }

        const username = await getUsername(req.body.token);
        const userQuery = await account.findOne({where: {
            username: username
        }});

        if(!userQuery){
            return res.status(500).json({
                message: 'An internal error occurred, please relogout and relogin again or contact an administrator for more support.',
                successful: false
            });
        }
        await createVerificationRequest(userQuery, 'verifyEmailRequest', req.body.newEmail);
        return res.send(JSON.stringify({
            message: '',
            successful: true,
            oldEmailAddr: userQuery.email
        }))
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}


