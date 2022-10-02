const {createToken} = require('@/lib/authentication');
const {verifyRequest, account} = require('@/lib/database');
const botChecks = require('@/lib/botChecks').default;
const {validateStr} = require('@/utils/validator');

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
        
        await verifyRequest.destroy({
            where: {
                id: verificationIdQuery.id
            }
        });

        switch(verificationIdQuery.verification_action){
            case "verifyLoginRequest":
                const token = await createToken(userQuery, verificationIdQuery.given_data);
                return res.send(JSON.stringify({
                    message: '',
                    successful: true,
                    token: token
                }));
            case "verifyEmailRequest":
                await account.update({ email: verificationIdQuery.given_data }, { where: { id: userQuery.id }});
                return res.send(JSON.stringify({
                    message: '',
                    successful: true,
                }));
            case "verifyDeletionRequest":
                await account.destroy({
                    where: {
                        id: userQuery.id
                    }
                });
                return res.send(JSON.stringify({
                    message: '',
                    successful: true,
                }));

            default:
                return res.status(500).json({
                    message: 'An unexpected error occurred, please contact an administrator for more support. [1]',
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
