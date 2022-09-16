const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateStr = (value) => {
    return typeof value === 'string';
}

const validateUsername = (value, apiRoute=false) => {
    const errorMessage = 'You must enter a valid username (must be between 2-30 characters of length)';
    if(value.length < 2 || value.length > 30){
        return {
            success: false,
            message: apiRoute ? errorMessage.charAt(0).toLowerCase() + errorMessage.slice(1) : errorMessage /* make the first char lowercase for it to fit in the API route correctly */
        };
    }
    return {
        success: true
    };
}

const validatePassword = (value, apiRoute=false) => {
    /* TODO: Implement more password security checks i.e. enforcing special chars in password */
    const errorMessage = 'Your password must be more than 5 characters';
    if(value.length < 5){
        return {
            success: false,
            message: apiRoute ? errorMessage.charAt(0).toLowerCase() + errorMessage.slice(1) : errorMessage
        };
    }
    return {
        success: true
    };
}

const validateEmail = (value, apiRoute=false) => {
    const errorMessage = 'You must enter a valid email address (must be less than 320 characters and formatted correctly I.e. example@gmail.com';
    if(!EMAIL_REGEX.test(value) || value.length > 320){
        return {
            success: false,
            message: apiRoute ? errorMessage.charAt(0).toLowerCase() + errorMessage.slice(1) : errorMessage
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