const bcrypt = require("bcryptjs");
const events = require('events');

const {account, loginHistory, verifyLogin} = require('@/lib/database');
const botChecks = require('@/lib/botChecks').default;
const {createToken} = require('@/lib/authentication');
const {sendEmail} = require('@/lib/aws');

const {validateStr, validateUsername, validatePassword} = require('@/utils/validator');
const getIp = require('@/utils/getIp').default;
const getEmailContent = require('@/utils/getEmailContent').default;
const getIpDetails = require('@/utils/getIpDetails').default;

const verifyLoginEmailEvent = new events.EventEmitter();

export default async function login(req, res) {
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

        const ipAddress = getIp(req);
        const allLogins = await loginHistory.findAll({});
        const allLoginsByIp = allLogins.map((login) => ((
            login.ip_address
        )));

        if(!allLoginsByIp.includes(ipAddress)){
            verifyLoginEmailEvent.emit('sendEmail', userQuery, ipAddress);
            return res.status(401).json({
                message: 'New login location detected, please check your email.',
                successful: false
            });
        }

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

const getUniqueVerificationCode = async () => {
    let uniqueVerificationCode = Math.random().toString(26).slice(2);
    const verificationCodeExists = await verifyLogin.findOne({where: {
        verification_hash: uniqueVerificationCode
    }});
    while(verificationCodeExists){
        uniqueVerificationCode = Math.random().toString(26).slice(2);
    }
    return uniqueVerificationCode;
}


verifyLoginEmailEvent.on('sendEmail', async (userQuery, ipAddress) => {
    const emailContent = await getEmailContent('verify-login.html');
    const uniqueId = await getUniqueVerificationCode();
    const locationDetails = await getIpDetails(ipAddress); 
    await verifyLogin.create({
        id: null,
        account_id: userQuery.id,
        ip_address: ipAddress,
        verification_hash: uniqueId
    });
    const editedEmailContent = emailContent
    .replace('{USERNAME}', userQuery.username)
    .replace('{IP_ADDRESS}', ipAddress)
    .replace('{LOCATION}', locationDetails)
    .replace('{DOMAIN_ENDPOINT}', process.env.DOMAIN_ENDPOINT)
    .replace('{CODE_HERE}', uniqueId);
    await sendEmail({
        'from': process.env.SYSTEM_EMAIL_ADDRESS,
        'to': userQuery.email,
        'subject': 'Verify BluePrnt login from new location',
        'html': editedEmailContent
    });
});