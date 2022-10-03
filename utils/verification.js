const {verifyRequest} = require('@/lib/database');
const {sendEmail} = require('@/lib/aws');
const getEmailContent = require('@/utils/getEmailContent').default;
const getIpDetails = require('@/utils/getIpDetails').default;

const emailActions = {
    verifyLoginRequest: {
        send: async (userQuery, content, _) => {
            await sendEmail({
                'from': process.env.SYSTEM_EMAIL_ADDRESS,
                'to': userQuery.email,
                'subject': 'Verify BluePrnt login from new location',
                'html': content
            });
        },
        getTemplateData: async (userQuery, verificationCode, data) => {
            const locationDetails = await getIpDetails(data); 
            return {
                templateVariables: {
                    '{USERNAME}': userQuery.username,
                    '{IP_ADDRESS}': data,
                    '{LOCATION}': locationDetails,
                    '{DOMAIN_ENDPOINT}': process.env.DOMAIN_ENDPOINT,
                    '{CODE_HERE}': verificationCode,
                },
                templateName: 'verify-login.html'
            };
        },
    },

    verifyRecoveryRequest: {
        send: async (userQuery, content, _) => {
            await sendEmail({
                'from': process.env.SYSTEM_EMAIL_ADDRESS,
                'to': userQuery.email,
                'subject': `Password Reset Request for BluePrnt`,
                'html': content
            });
        },
        getTemplateData: async (userQuery, verificationCode, _) => {
            return {
                templateVariables: {
                    '{CODE_HERE}': verificationCode,
                    '{USERNAME}': userQuery.username,
                    '{DOMAIN_ENDPOINT}': process.env.DOMAIN_ENDPOINT,
                },
                templateName: 'recover-account.html',
            };
        },
    },
    verifyEmailRequest: {
        send: async (userQuery, content, verificationCode) => {
            await sendEmail({
                'from': process.env.SYSTEM_EMAIL_ADDRESS,
                'to': userQuery.email,
                'subject': `Your BluePrnt email verification code is: ${verificationCode}`,
                'html': content
            });
        },
        getTemplateData: async (_, verificationCode, __) => {
            return {
                templateVariables: {
                    '{CODE_HERE}': verificationCode,
                },
                templateName: 'update-email.html',
            };
        },
    },

    verifyDeletionRequest: {
        send: async (userQuery, content, _) => {
            await sendEmail({
                'from': process.env.SYSTEM_EMAIL_ADDRESS,
                'to': userQuery.email,
                'subject': `Verify your BluePrnt account deletion request`,
                'html': content
            });
        },
        getTemplateData: async (userQuery, verificationCode, _) => {
            return {
                templateVariables: {
                    '{USERNAME}': userQuery.username,
                    '{DOMAIN_ENDPOINT}': process.env.DOMAIN_ENDPOINT,
                    '{CODE_HERE}': verificationCode,
                },
                templateName: 'delete-account.html',
            };
        },
    },
}

module.exports.createVerificationRequest = async (userQuery, verificationAction, data) => {
    const verificationCode = await getUniqueVerificationCode();
    const emailAction = emailActions[verificationAction];
    const templateData = await emailAction.getTemplateData(userQuery, verificationCode, data);
    const emailContent = await renderEmailTemplate(templateData);
    await emailAction.send(userQuery, emailContent, verificationCode);
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

const renderEmailTemplate = async (templateData) => {
    let emailContent = await getEmailContent(templateData.templateName);
    for(const variable in templateData.templateVariables){
        emailContent = emailContent.replace(variable, templateData.templateVariables[variable])
    }
    return emailContent;
}