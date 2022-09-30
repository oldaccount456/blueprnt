import Layout from '@/components/Layout';
import AccountPrompt from '@/components/Form/Prompt';
import InputField from '@/components/Form/InputField';
import {UsernameField, PasswordField, CaptchaField} from '@/components/Form/InputField/Types';
import SubmitButton from '@/components/Form/SubmitButton';
import FormStatus from '@/components/Form/FormStatus';

import React from 'react';
import Axios from 'axios';

import {
    Form,
} from 'react-bootstrap';

import Cookies from 'js-cookie';

export default class Login extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
        }

        this.usernameComponent = React.createRef();
        this.passwordComponent = React.createRef();
        this.captchaComponent = React.createRef();
    }

    handleErrorPopUp(errorMessage){
        return this.setState({
            errorMessage: errorMessage,
            successMessage: '',
        });
    }

      
    handleSuccessPopUp(successMessage){
        return this.setState({
            successMessage: successMessage,
            errorMessage: '',
        });
    }

    validateComponent(component, handleHighlight=true){
        const validateField = component.validate();
        if(!validateField.success){
            this.handleErrorPopUp(validateField.message);
            if(handleHighlight) component.highlight();
            return false;
        }

        if(handleHighlight) component.unhighlight();
        return true;
    }

    async login(e){
        e.preventDefault();
        const usernameComponent = this.usernameComponent.current;
        const passwordComponent = this.passwordComponent.current;
        const captchaComponent = this.captchaComponent.current;

        const usernameValidation = this.validateComponent(usernameComponent);
        if(!usernameValidation) return;

        const passwordValidation = this.validateComponent(passwordComponent);
        if(!passwordValidation) return;

        const captchaValidation = this.validateComponent(captchaComponent, false);
        if(!captchaValidation) return;

        this.setState({
            processing: true
        });

        try{
            const loginReq = await Axios.post('/api/account/login', {
                'username': usernameComponent.state.value,
                'password': passwordComponent.state.value,
                'hcaptchaToken': captchaComponent.state.hcaptchaToken,
            });
            this.setState({
                processing: false
            });
            if(!loginReq.data.successful){
                return this.handleErrorPopUp(loginReq.data.message);
            }
            Cookies.set('token', loginReq.data.token);
            this.handleSuccessPopUp(`You have successfully logged in`);
            return window.location.href = '/gallery';
        }
        catch(err){
            console.log(err)
            captchaComponent.resetCaptcha();
            let errorMessage = (!err.response.data.message || err.response.data.message == "") ?  "There was an error, please contact an admin for more." : err.response.data.message;
            if(Number(err.response.status) === 429){
                errorMessage = err.response.data
            }
            this.setState({
                processing: false,
            });
            return this.handleErrorPopUp(errorMessage);
        } 

    }

    render(){
        return (
            <>
                <Layout user={this.props.user}>
                    <AccountPrompt headerText='Login' width={'500px'}>
                        <Form onSubmit={this.login.bind(this)}>
                            <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                            <InputField id='username'>
                                <UsernameField ref={this.usernameComponent} fieldName={'Username'} />
                            </InputField>
                            <InputField id='password'>
                                <PasswordField ref={this.passwordComponent} fieldName={'Password'} />
                            </InputField>
                            <InputField id='hcaptcha'>
                                <CaptchaField ref={this.captchaComponent}/>
                            </InputField>
                            <SubmitButton action={this.login.bind(this)} actionText='Login'/>   
                        </Form>
                    </AccountPrompt>
                </Layout>
            </>
        );
    }
}