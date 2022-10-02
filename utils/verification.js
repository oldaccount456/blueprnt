const {verifyRequest} = require('@/lib/database');
const {sendEmail} = require('@/lib/aws');
const getEmailContent = require('@/utils/getEmailContent').default;
const getIpDetails = require('@/utils/getIpDetails').default;

module.exports.createVerificationRequest = async (userQuery, verificationAction, data) => {
    const verificationCode = await getUniqueVerificationCode();
    switch(verificationAction){
        case "verifyLoginRequest":
            const verifyLoginContent = await getEmailContent('verify-login.html');
            const locationDetails = await getIpDetails(data); 
            const editedVerifyLoginContent = verifyLoginContent
            .replace('{USERNAME}', userQuery.username)
            .replace('{IP_ADDRESS}', data)
            .replace('{LOCATION}', locationDetails)
            .replace('{DOMAIN_ENDPOINT}', process.env.DOMAIN_ENDPOINT)
            .replace('{CODE_HERE}', verificationCode);
            await sendEmail({
                'from': process.env.SYSTEM_EMAIL_ADDRESS,
                'to': userQuery.email,
                'subject': 'Verify BluePrnt login from new location',
                'html': editedVerifyLoginContent
            });
            break;
        case "verifyEmailRequest":
            const updateEmailContent = await getEmailContent('update-email.html');
            const editedUpdateEmailContent = updateEmailContent
            .replace('{CODE_HERE}', verificationCode);
            await sendEmail({
                'from': process.env.SYSTEM_EMAIL_ADDRESS,
                'to': userQuery.email,
                'subject': `Your BluePrnt email verification code is: ${verificationCode}`,
                'html': editedUpdateEmailContent
            });
            break;
        case "verifyDeletionRequest":
            const deleteAccountContent = await getEmailContent('delete-account.html');
            const editedDeleteAccountContent = deleteAccountContent
            .replace('{USERNAME}', userQuery.username)
            .replace('{DOMAIN_ENDPOINT}', process.env.DOMAIN_ENDPOINT)
            .replace('{CODE_HERE}', verificationCode);
            await sendEmail({
                'from': process.env.SYSTEM_EMAIL_ADDRESS,
                'to': userQuery.email,
                'subject': `Verify your BluePrnt account deletion request`,
                'html': editedDeleteAccountContent
            });
            break;
        default: 
            console.log("Unknown action given");
    }
    await verifyRequest.create({
        id: null,
        account_id: userQuery.id,
        verification_hash: verificationCode,
        verification_action: verificationAction,
        given_data: data
    });
    return verificationCode;
}

const getUniqueVerificationCode = async () => {
    let uniqueVerificationCode = Math.random().toString(26).slice(2);
    const verificationCodeExists = await verifyRequest.findOne({where: {
        verification_hash: uniqueVerificationCode
    }});
    while(verificationCodeExists){
        uniqueVerificationCode = Math.random().toString(26).slice(2);
    }
    return uniqueVerificationCode;
}