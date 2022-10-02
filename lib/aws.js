import aws from 'aws-sdk';

module.exports.getFileBuffer = (bucketKey) => {
    const s3 = new aws.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION,
    });

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: bucketKey,
    };
    
    return new Promise((resolve, reject) => {
        s3.getObject(params, (err, rest) => {
            if(err){
                return reject(err);
            }
        
            return resolve(Buffer.from(rest.Body));
        })
    });
}

module.exports.sendEmail = async (details) => {
    const SES_CONFIG = {
        accessKeyId: process.env.SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
        region: process.env.SES_REGION,
    };
    const ses = new aws.SES(SES_CONFIG);
    const params = {
        Destination: {
            ToAddresses: [details.to],
        },
        Message: {
            Body: {
                Html: { 
                    Data: details.html 
                },
            },
            Subject: { Data: details.subject },
        },
        Source: details.from,
    };
    try{
        const x = await ses.sendEmail(params).promise();
    }
    catch(e){
        console.log(e);
    }
}