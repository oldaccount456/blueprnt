

import {bucketObject} from '@/lib/database';
import {getFileBuffer} from '@/lib/aws';
import bufferToStream from '@/utils/handleBuffer';

export default async function fileByBucketKey(req, res) {
    if(req.method === 'GET'){
        const { bucketKey } = req.query;
        try{
            const bucketObj = await bucketObject.findOne({where: {
                bucket_key: bucketKey
            }});
            if(!bucketObj){
                return res.status(404).json({
                    message: `This file was not found (for bucket key: ${bucketKey}).`,
                    successful: false
                });
            }
            const fileBuffer = await getFileBuffer(bucketKey);  
            const readableStream = bufferToStream(fileBuffer);     
            res.setHeader('Content-Type', bucketObj.mimetype)
            return res.send(readableStream);
        }
        catch(e){
            console.log(e)
            return res.status(404).json({
                message: `This file was not found (for bucket key: ${bucketKey}).`,
                successful: false
            });
        }
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a GET request.',
        successful: false
    });
}

