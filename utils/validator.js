const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateStr = (value) => {
    return typeof value === 'string';
}

const validateUsername = (value) => {
    if(value.length < 2 || value.length > 30){
        return {
            success: false,
            message: 'You must enter a valid username (must be between 2-30 characters of length)'
        };
    }
    return {
        success: true
    };
}

const validatePassword = (value) => {
    /* TODO: Implement more password security checks i.e. enforcing special chars in password */
    if(value.length < 5){
        return {
            success: false,
            message: 'Your password must be more than 5 characters'
        };
    }
    return {
        success: true
    };
}

const validateEmail = (value) => {
    if(!EMAIL_REGEX.test(value) || value.length > 320){
        return {
            success: false,
            message: 'You must enter a valid email address (must be less than 320 characters and formatted correctly I.e. example@gmail.com)'
        };
    }
    return {
        success: true
    };
}

module.exports = {
    validateStr,
    validateUsername,
    validatePassword,
    validateEmail,
}