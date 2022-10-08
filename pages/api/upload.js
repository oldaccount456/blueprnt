import nextConnect from 'next-connect';
import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import path from 'path';

import {storage, account, bucketObject} from '@/lib/database';
import {checkToken} from '@/lib/authentication';
import settings from '@/utils/settings.json';
import {validateStr} from '@/utils/validator';

aws.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
});

const s3 = new aws.S3();
const uploadData = {};

const uploadOperation = multer({
    limits: {
        fileSize: settings.maxFileSize,
    },
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,            
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: async (req, file, cb) => {
            if(!uploadData[req.body.uploadReqId]){
                return callback(new Error(`An internal error occurred, please try again`));
            }   
            const fileExt = path.extname(file.originalname);
            const fileHash = await getValidBucketKey();
            await bucketObject.create({
                storage_id: uploadData[req.body.uploadReqId]['storageId'],
                bucket_key: `${fileHash}${fileExt}`,
                mimetype: file.mimetype,
            });
            cb(null, `${fileHash}${fileExt}`);
        }
    }),
    
    fileFilter: async function (req, file, callback) {
        const headersFileSize = parseInt(req.headers["content-length"]);
        if(headersFileSize > settings.maxFileSize){
            return callback(new Error(`You have uploaded files more than 4mb in total, please make sure they are under 4mb in total`));
        }
        const fileExt = path.extname(file.originalname);
        const allowedExtensions = settings.allowedExts.map(ext => ext.toLowerCase());

        if(!allowedExtensions.includes(fileExt.toLowerCase()) && !req.body.encrypted){
            return callback(new Error(`Image upload only supports the following image extensions: ${settings.allowedExts.join(', ')}`));
        }
        if(!settings.allowedMimetypes.includes(file.mimetype) && !req.body.encrypted){
            return callback(new Error(`Image upload only supports the following mimetypes: ${settings.allowedMimetypes.join(', ')}`));
        }
        if(!validateStr(req.body.uploadReqId)){
            req.body.uploadReqId = getUniqueUploadId();
        }
        if(validateStr(req.body.note)){
            if(req.body.note.length > 3000){
                return callback(new Error('Your note must be below 3000 characters long'));
            }
        }
        if(!uploadData[req.body.uploadReqId]){
            const endpointHash = await getValidEndpoint();
            const verifiedId = await getUploaderId(req.body.token, req.body.apiKey);
            const storageRecord = await storage.create({
                id: null,
                account_id: verifiedId,
                endpoint_hash: endpointHash,
                encrypted: req.body.encrypted === 'true',
                view_amount: isNaN(req.body.viewAmount) || (Number(req.body.viewAmount) <= 0 || Number(req.body.viewAmount) > 10) ? 0 : Number(req.body.viewAmount),
                expiry: validateStr(req.body.expiry) ? settings.expiryTimes[req.body.expiry] : Object.keys(settings.expiryTimes)[0],
                note: validateStr(req.body.note) ? req.body.note : ''
            });
            uploadData[req.body.uploadReqId] = {
                'endpointHash': endpointHash,
                'storageId': storageRecord.id,
            };
        }
        callback(null, true);
    },
});

const updateImageRoute = nextConnect({
    onError(error, req, res) {
        console.log(error)
        res.status(501).json({ message: `${error.message}` });
    },
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
});



updateImageRoute.use(uploadOperation.array('allFiles'));

updateImageRoute.post( async (req, res) => {
    if(!uploadData[req.body.uploadReqId]){
        return res.status(400).json({
            message: 'An internal error occurred, please try again later.',
            successful: false
        });
    }
    const endpointHash = uploadData[req.body.uploadReqId]['endpointHash'];
    delete uploadData[req.body.uploadReqId];
    return res.send(`${process.env.DOMAIN_ENDPOINT}/${endpointHash}`)
});

export default updateImageRoute;

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};

const getUploaderId = async (token, apiKey) => {
    const queryApiKey = async () => {
        try{
            const apiKeyQuery = await account.findOne({
                where: {
                    api_key: apiKey
                }
            })
            return apiKeyQuery.id;
        }
        catch(e){
            return 1;
        }
    } 
    try{
        const {username} = await checkToken(token);
        const accountQuery = await account.findOne({where: {
            username: username
        }});
        return accountQuery ? accountQuery.id : 1;
    }
    catch(e){
        const apiKeyQuery = await queryApiKey();
        return apiKeyQuery;
    }
}

const getUniqueUploadId = () => {
    let endpoint = Math.random().toString(26).slice(2);
    while(uploadData[endpoint]){
        endpoint = Math.random().toString(26).slice(2);
    }
    return endpoint;
}

const getValidBucketKey = async () => {
    let hash = Math.random().toString(26).slice(2);
    const bucketKeyExists = await bucketObject.findOne({where: {
        bucket_key: hash
    }});
    while(bucketKeyExists){
        hash = Math.random().toString(26).slice(2);
    }
    return hash;
}

const getValidEndpoint = async () => {
    let endpoint = Math.random().toString(26).slice(2);
    const endpointExists = await storage.findOne({where: {
        endpoint_hash: endpoint
    }});
    while(endpointExists){
        endpoint = Math.random().toString(26).slice(2);
    }
    return endpoint;
}