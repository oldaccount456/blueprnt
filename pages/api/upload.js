import nextConnect from 'next-connect';
import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import path from 'path';

import {storage, account, bucketObject} from '@/lib/database';
import authenticateUser from '@/lib/authentication';
import settings from '@/utils/settings.json';
import {validateStr} from '@/utils/validator';

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new aws.S3();
const uploadData = {};

const uploadOperation = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,

        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: async (req, file, cb) => {
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

            if(!uploadData[req.body.uploadReqId]){
                return callback(new Error(`An internal error occurred, please try again`));
            }

            const fileExt = path.extname(file.originalname);
            const fileHash = await getValidBucketKey();
            await bucketObject.create({
                storage_id: uploadData[req.body.uploadReqId]['storageId'],
                bucket_key: `${fileHash}${fileExt}`,
                mimetype: file.mimetype
            });
            cb(null, `${fileHash}${fileExt}`);
        }
    }),
    
    fileFilter: async function (req, file, callback) {
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

        if(!validateStr(req.body.uploadReqId)){
            return callback(new Error(`You must provide an upload ID to identify your request`));
        }

        if(req.body.loggedIn === undefined){
            return callback(new Error(`You must provide whether you want this to be apart of your account or part of a public upload`));
        }

        const fileSize = parseInt(req.headers["content-length"]);
        if(fileSize > 8000000){
            return callback(new Error(`You have uploaded files more than 8mb in total, please make sure they are under 8mb in total`));
        }

        const fileExt = path.extname(file.originalname);
        const allowedExtensions = settings.allowedExts.map(ext => ext.toLowerCase());

        if(!allowedExtensions.includes(fileExt.toLowerCase())){
            return callback(new Error(`Image upload only supports the following image extensions: ${settings.allowedExts.join(', ')}`));
        }
        if(!settings.allowedMimetypes.includes(file.mimetype)){
            return callback(new Error(`Image upload only supports the following mimetypes: ${settings.allowedMimetypes.join(', ')}`));
        }
    
        if(!uploadData[req.body.uploadReqId]){
            const getUploaderId = async (token) => {
                try{
                    const {username} = await authenticateUser(token);
                    const accountQuery = await account.findOne({where: {
                        username: username
                    }});
                    return accountQuery ? accountQuery.id : 1;
                }
                catch(e){
                    /* console.log(e); */
                    return 1;
                }
            }
            const endpointHash = await getValidEndpoint();
            const verifiedId = req.body.loggedIn ? await getUploaderId(req.body.token) : 1;
            const storageRecord = await storage.create({
                id: null,
                account_id: verifiedId,
                endpoint_hash: endpointHash
            });
            uploadData[req.body.uploadReqId] = {
                'endpointHash': endpointHash,
                'storageId': storageRecord.id
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
    return res.send(JSON.stringify({
        message: '',
        successful: true,
        endpointHash: endpointHash
    }))
});

export default updateImageRoute;

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};