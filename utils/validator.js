const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateStr = (value) => {
    return value ? typeof value === 'string' : false;
}

const validateEmail = (value) => {
    return EMAIL_REGEX.test(value);
}

module.exports = {
    validateStr,
    validateEmail,
}