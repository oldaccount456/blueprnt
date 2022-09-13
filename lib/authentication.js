const jwt = require('jsonwebtoken');
const {blacklistedJwt} = require('@/lib/database');

export default async function authenticateUser(token){
    const queryBlacklistedToken = await blacklistedJwt.findOne({where: {
        jwt_token: token
    }});
    return new Promise((resolve, reject) => {
        if(queryBlacklistedToken) return reject('Blacklisted Token');
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return reject(err);
            }
            else{
                return resolve(user);
            }
        })
    });  
}

