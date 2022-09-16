const bcrypt = require("bcryptjs");
const {account} = require('@/lib/database');
const {checkToken, createToken, destroyToken} = require('@/lib/authentication').default;

const botChecks = require('@/lib/botChecks').default;
const {validateStr} = require('@/utils/validator');
const getIp = require('@/utils/getIp').default;

export default async function changePassword(req, res) {
    if(req.method === 'POST'){
        if(!validateStr(req.body.token)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid token',
                successful: false
            });
        }

        if(!validateStr(req.body.oldPassword)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid old password',
                successful: false
            });
        }
        
        if(!validateStr(req.body.newPassword)){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a valid new password',
                successful: false
            });
        }

        if(req.body.newPassword.length < 5){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a new password that is more than 5 characters',
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
                    message: 'You sent an invalid type of request, please provide a valid authorization token',
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
        const checkOldPassword = await bcrypt.compare(req.body.oldPassword, userQuery.password)

        if(!checkOldPassword){
            return res.status(400).json({
                message: 'Your old password is incorrect',
                successful: false
            });
        }

        const checkNewPassword = await bcrypt.compare(req.body.newPassword, userQuery.password)
        if(checkNewPassword){
            return res.status(400).json({
                message: 'Your new password is the same as your current password, please choose a different one',
                successful: false
            });
        }

        const newPasswordHash = await bcrypt.hash(req.body.newPassword, 12);
        await account.update({ password: newPasswordHash }, { where: { id: userQuery.id }});

        await destroyToken(userQuery);
        const ipAddress = getIp(req);
        const token = await createToken(userQuery, ipAddress);
        
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


