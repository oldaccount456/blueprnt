const axios = require('axios');
const rateLimit = require('express-rate-limit');

const getIp = require('@/utils/getIp').default;
const parseBoolFromStr = require('@/utils/envParser').default;

const rateLimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000, // every 15 minutes
    max: 10, // Limit each IP to 10 app requests per `window` (here, per 15 minutes)
    message: 'You are sending API requests too quickly, please try again in 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default async function botChecks(req, res, includeCaptchaChecks=true){
    if(parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA) && includeCaptchaChecks){
        if(!req.body.hcaptchaToken){
            throw 'You sent an invalid type of request, please fill out the captcha';
        }
    }
    
    const ip = getIp(req);
    if(parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA) && includeCaptchaChecks){
        try{
            const resp = await axios.post(
                'https://hcaptcha.com/siteverify', 
                `response=${req.body.hcaptchaToken}&secret=${process.env.HCAPTCHA_SECRET}&remoteip=${ip}&sitekey=${process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}`
            );
            
            if(!resp.data.success){
                console.log(resp.data)
                throw 'Your captcha input is invalid, please retry filling out the captcha or contact an administrator for more support';
            }
        }
        catch(e){
            console.log(e);
            throw 'An internal error occurred whilst verifying your captcha input, please contact an administrator if you keep getting this error'
        }
    }
    req.ip = ip;
    try{ 
        await runRateLimitCheck(req, res, rateLimitOptions);
    }
    catch(e){
        throw 'You are being rate limited, please wait for 15 minutes before retrying'
    }
}

const runRateLimitCheck = (req, res, fn) =>  {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}