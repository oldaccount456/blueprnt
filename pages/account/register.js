import Layout from '@/components/Layout';
import AccountPrompt from '@/components/Form/Prompt';
import InputField from '@/components/Form/InputField';
import {UsernameField, PasswordField, EmailField, CaptchaField} from '@/components/Form/InputField/Types';
import SubmitButton from '@/components/Form/SubmitButton';
import FormStatus from '@/components/Form/FormStatus';

import React from 'react';
import Axios from 'axios';

import Cookies from 'js-cookie';

import {
    Form,
} from 'react-bootstrap';

export default class Register extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
        }

        this.usernameComponent = React.createRef();
        this.passwordComponent = React.createRef();
        this.confirmPasswordComponent = React.createRef();
        this.emailComponent = React.createRef();
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

    async register(e){
        e.preventDefault();
        const usernameComponent = this.usernameComponent.current;
        const passwordComponent = this.passwordComponent.current;
        const confirmPasswordComponent = this.confirmPasswordComponent.current;
        const emailComponent = this.emailComponent.current;
        const captchaComponent = this.captchaComponent.current;

        const usernameValidation = this.validateComponent(usernameComponent);
        if(!usernameValidation) return;

        const passwordValidation = this.validateComponent(passwordComponent);
        if(!passwordValidation) return;

        const confirmPasswordValidation = this.validateComponent(confirmPasswordComponent);
        if(!confirmPasswordValidation) return;

        if(passwordComponent.state.value !== confirmPasswordComponent.state.value){
            passwordComponent.highlight();
            confirmPasswordComponent.highlight();
            return this.handleErrorPopUp('Your passwords must match');
        }
        passwordComponent.unhighlight();
        confirmPasswordComponent.unhighlight();   

        const emailValidation = this.validateComponent(emailComponent);
        if(!emailValidation) return;

        const captchaValidation = this.validateComponent(captchaComponent, false);
        if(!captchaValidation) return;

        this.setState({
            processing: true
        });

        try{
            const createReq = await Axios.post('/api/account/register', {
                'username': usernameComponent.state.value,
                'password': passwordComponent.state.value,
                'email': emailComponent.state.value,
                'hcaptchaToken': captchaComponent.state.hcaptchaToken,
            });
            this.setState({
                processing: false
            });

            if(!createReq.data.successful){
                return this.handleErrorPopUp(createReq.data.message);
            }
            
            Cookies.set('token', createReq.data.token);
            this.handleSuccessPopUp(`Your account has been created`);
            return window.location.href = '/account/panel';
        }
        catch(err){
            console.log(err);
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
                <Layout>
                    <AccountPrompt headerText='Registration' width={'500px'}>
                        <Form onSubmit={this.register.bind(this)}>
                            <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>

                            <InputField id='username'>
                                <UsernameField ref={this.usernameComponent} fieldName={'Username'} />
                            </InputField>
                            <InputField id='password'>
                                <PasswordField ref={this.passwordComponent} fieldName={'Password'} />
                            </InputField>
                            <InputField id='confirm-password'>
                                <PasswordField ref={this.confirmPasswordComponent} fieldName={'Confirm Password'} />
                            </InputField>
                            <InputField id='email'>
                                <EmailField ref={this.emailComponent} fieldName={'Email Address'} />
                            </InputField>
                            <InputField id='hcaptcha'>
                                <CaptchaField ref={this.captchaComponent}/>
                            </InputField>
                            <SubmitButton action={this.register.bind(this)} actionText='Register'/>   
                        </Form>
                    </AccountPrompt>
                </Layout>
            </>
        );
    }
}