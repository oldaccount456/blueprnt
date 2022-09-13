import aws from 'aws-sdk';

export default async function getFileBuffer(bucketKey) {
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