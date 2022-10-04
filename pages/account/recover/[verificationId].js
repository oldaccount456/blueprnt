import Layout from '@/components/Layout';
import AccountPrompt from '@/components/Form/Prompt';
import InputField from '@/components/Form/InputField';
import {PasswordField} from '@/components/Form/InputField/Types';
import SubmitButton from '@/components/Form/SubmitButton';
import FormStatus from '@/components/Form/FormStatus';

import React from 'react';
import Axios from 'axios';

import {
    Form,
} from 'react-bootstrap';

import Cookies from 'js-cookie';
import { withRouter } from 'next/router';

class SetPassword extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
        }

        this.passwordComponent = React.createRef();
        this.confirmPasswordComponent = React.createRef();
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

    async resetPassword(verificationId, e){
        e.preventDefault();
        const passwordComponent = this.passwordComponent.current;
        const confirmPasswordComponent = this.confirmPasswordComponent.current;

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

        this.setState({
            processing: true
        });
        
        try{
            const resetPasswordReq = await Axios.post('/api/account/verify-request', {
                'verificationId': verificationId,
                'password': passwordComponent.state.value,
            });
            this.setState({
                processing: false
            });
            if(!resetPasswordReq.data.successful){
                return this.handleErrorPopUp(resetPasswordReq.data.message);
            }
            Cookies.set('token', resetPasswordReq.data.token);
            this.handleSuccessPopUp(`Your password has been changed.`);
            window.location.href = '/account/gallery';
        }
        catch(err){
            console.log(err)
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
        const { verificationId } = this.props.router.query
        return (
            <>
                <Layout user={this.props.user}>
                    <AccountPrompt headerText='Set a new password' width={'300px'}>
                        <Form onSubmit={this.resetPassword.bind(this)}>
                            <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                            <InputField id='password'>
                                <PasswordField ref={this.passwordComponent} fieldName={'Password'} />
                            </InputField>
                            <InputField id='confirm-password'>
                                <PasswordField ref={this.confirmPasswordComponent} fieldName={'Confirm Password'} />
                            </InputField>
                            <SubmitButton action={this.resetPassword.bind(this, verificationId)} actionText='UPDATE PASSWORD'/>  
                        </Form>
                    </AccountPrompt>
                </Layout>
            </>
        );
    }
}

export default withRouter(SetPassword);