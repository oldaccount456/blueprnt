const bcrypt = require('bcryptjs');
const {createToken, destroyToken} = require('@/lib/authentication');
const {verifyRequest, account} = require('@/lib/database');
const botChecks = require('@/lib/botChecks').default;
const {validateStr, validatePassword} = require('@/utils/validator');
const getIp = require('@/utils/getIp').default;

export default async function verifyRequest_(req, res) {
    if(req.method === 'POST'){ 
        if(!validateStr(req.body.verificationId)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid string for the verification ID',
                successful: false
            });
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
        
        const verificationIdQuery = await verifyRequest.findOne({where: {
            verification_hash: req.body.verificationId
        }});
        
        if(!verificationIdQuery){
            return res.status(200).json({
                message: 'This verification ID was not found. Please make sure you followed the right link',
                successful: false
            });
        }

        if(new Date() > new Date(verificationIdQuery.created_at).addHours(2)){
            return res.status(200).json({
                message: 'This verification code has expired, please try requesting another one or contact an administrator.',
                successful: false
            });
        }

        const userQuery = await account.findOne({
            where: {
                id: verificationIdQuery.account_id
            }
        });

        if(!userQuery){
            return res.status(500).json({
                message: 'An unexpected error occurred, please contact an administrator for more support. [0]',
                successful: false
            });
        }
        


        const verificationActions = {
            verifyLoginRequest: async () => {
                const token = await createToken(userQuery, verificationIdQuery.given_data);
                return {
                    successful: true,
                    message: '',
                    token: token
                }
            },
            verifyRecoveryRequest: async () => {
                if(!validateStr(req.body.password)){
                    return {
                        successful: false, 
                        statusCode: 400,
                        message: 'You sent an invalid type of request, please provide a valid string for the password'
                    }
                }
                const isPasswordValidated = validatePassword(req.body.password, true);
                if(!isPasswordValidated.success){
                    return {
                        successful: false, 
                        statusCode: 400,
                        message: `You sent an invalid type of request, ${isPasswordValidated.message}`
                    }
                }

                const newPasswordHash = await bcrypt.hash(req.body.password, 12);
                await account.update({ password: newPasswordHash }, { where: { id: userQuery.id }});
                await destroyToken(userQuery);
                const ipAddress = getIp(req);
                const token = await createToken(userQuery, ipAddress);
                return {
                    successful: true,
                    message: '',
                    token: token
                }
            },

            verifyEmailRequest: async () => {
                await account.update({ email: verificationIdQuery.given_data }, { where: { id: userQuery.id }});
                return {
                    successful: true,
                    message: '',
                }
            },
            
            verifyDeletionRequest: async () => {
                await account.destroy({where: {id: userQuery.id}});
                return {
                    successful: true,
                    message: '',
                }
            }
        }
        const action = verificationActions[verificationIdQuery.verification_action];
        const result = await action();
        if(result.successful){
            await verifyRequest.destroy({
                where: {
                    id: verificationIdQuery.id
                }
            });
            return res.send(JSON.stringify(result));
        }
        else{
            return res.status(result.statusCode).json({
                message: result.message,
                successful: false
            }); 
        }
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}

Date.prototype.addHours = function(hrs){
    this.setHours(this.getHours() + hrs);
    return this;
}
