import aws from 'aws-sdk';

export default async function getFileBuffer(bucketKey) {
    const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
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