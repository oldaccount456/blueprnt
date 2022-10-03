import Layout from '@/components/Layout';
import AccountPrompt from '@/components/Form/Prompt';
import InputField from '@/components/Form/InputField';
import {UsernameField, EmailField, CaptchaField} from '@/components/Form/InputField/Types';
import SubmitButton from '@/components/Form/SubmitButton';
import FormStatus from '@/components/Form/FormStatus';

import React from 'react';
import Axios from 'axios';

import {
    Form,
} from 'react-bootstrap';

import Cookies from 'js-cookie';

export default class RecoverAccount extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
        }

        this.usernameComponent = React.createRef();
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

    async recoverAccount(e){
        e.preventDefault();
        const usernameComponent = this.usernameComponent.current;
        const emailComponent = this.emailComponent.current;
        const captchaComponent = this.captchaComponent.current;

        const usernameValidation = this.validateComponent(usernameComponent);
        if(!usernameValidation) return;

        const emailValidation = this.validateComponent(emailComponent);
        if(!emailValidation) return;

        const captchaValidation = this.validateComponent(captchaComponent, false);
        if(!captchaValidation) return;

        this.setState({
            processing: true
        });

        try{
            const recoverReq = await Axios.post('/api/account/recover', {
                'username': usernameComponent.state.value,
                'email': emailComponent.state.value,
                'hcaptchaToken': captchaComponent.state.hcaptchaToken,
            });
            this.setState({
                processing: false
            });
            if(!recoverReq.data.successful){
                return this.handleErrorPopUp(recoverReq.data.message);
            }
            return this.handleSuccessPopUp('An email has been to sent to your address with a link to recover your account, if your username and email are matching in our records.');
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
                    <AccountPrompt headerText='Recover Account' width={'500px'}>
                        <Form onSubmit={this.recoverAccount.bind(this)}>
                            <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                            <InputField id='username'>
                                <UsernameField ref={this.usernameComponent} fieldName={'Username'} />
                            </InputField>
                            <InputField id='email'>
                                <EmailField ref={this.emailComponent} fieldName={'Email'} />
                            </InputField>
                            <InputField id='hcaptcha'>
                                <CaptchaField ref={this.captchaComponent}/>
                            </InputField>
                            <SubmitButton action={this.recoverAccount.bind(this)} actionText='Recover'/>   
                        </Form>
                    </AccountPrompt>
                </Layout>
            </>
        );
    }
}