const jwt = require('jsonwebtoken');
const {
    blacklistedJwt, 
    currentJwt, 
    loginHistory, 
    account
} = require('@/lib/database');

const checkToken = async (token) => {
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

const createToken = async (user, ipAddress) => {
    const token = jwt.sign({username: user.username}, process.env.JWT_SECRET, {expiresIn: '24h'});
    await currentJwt.create({
        id: null,
        account_id: user.id,
        jwt_token: token
    });
    await loginHistory.create({
        id: null,
        account_id: user.id,
        ip_address: ipAddress
    });
    return token;
}

const destroyToken = async (user) => {
    const allCurrentJwt = await account.findOne({
        include: [currentJwt],
        where: {
            id: user.id
        }
    });

    for(let jwt_obj of allCurrentJwt.current_jwts){
        await blacklistedJwt.create({
            id: null,
            jwt_token: jwt_obj.jwt_token
        });
        await currentJwt.destroy({where: {
            jwt_token: jwt_obj.jwt_token
        }});
    }
}

module.exports = {
    checkToken,
    createToken,
    destroyToken
}