const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateStr = (value) => {
    return typeof value === 'string';
}

const validateUsername = (value) => {
    return value.length >= 2 && value.length <= 30;
}

const validatePassword = (value) => {
    /* TODO: Implement more password security checks i.e. enforcing special chars in password */
    return value.length > 5;
}

const validateEmail = (value) => {
    return EMAIL_REGEX.test(value) && value.length < 320;
}

module.exports = {
    validateStr,
    validateUsername,
    validatePassword,
    validateEmail,
}