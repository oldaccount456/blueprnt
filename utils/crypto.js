import crypto from 'crypto';
const algorithm = 'aes-256-ctr';

module.exports.encryptBuffer = (buffer, password) => {
    const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result;
}

module.exports.decryptBuffer = (buffer, password) => {
    const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);
    const iv = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const result = Buffer.concat([decipher.update(buffer), decipher.final()]);
    return result;
}

module.exports.encryptString = (string, password) => {
    const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const result = Buffer.concat([iv, cipher.update(string), cipher.final()]);
    return result.toString('hex');
}

module.exports.decryptString = (string, password) => {
    const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);
    const bufferFromStr = new Buffer(string, "hex")
    const iv = new Buffer(string, "hex").slice(0, 16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const result = Buffer.concat([decipher.update(new Buffer(string, "hex").slice(16)), decipher.final()]);
    return result.toString();
}

