const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {account, blacklistedJwt, currentJwt} = require('@/lib/database');
const authenticateUser = require('@/lib/authentication').default;

const botChecks = require('@/lib/botChecks').default;
const {validateStr} = require('@/utils/validator');

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
                const {username} = await authenticateUser(token);
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

        const allCurrentJwt = await account.findOne({
            include: [currentJwt],
            where: {
                id: userQuery.id
            }
        });

        for(let jwt_obj of allCurrentJwt.current_jwts){
            await blacklistedJwt.create({
                id: null,
                jwt_token: jwt_obj.jwt_token
            });
            await currentJwt.destroy({where: {
                jwt_token: jwt_obj.jwt_token
            }});
        }

        const newPasswordHash = await bcrypt.hash(req.body.newPassword, 12);
        await account.update({ password: newPasswordHash }, { where: { id: userQuery.id }});
        const token = jwt.sign({username: userQuery.username}, process.env.JWT_SECRET, {expiresIn: '24h'});
        
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


