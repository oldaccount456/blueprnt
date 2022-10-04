import {
    Container,
    Row,
    Col,
    Button
} from 'react-bootstrap';

import FormStatus from '@/components/Form/FormStatus';
import {EmailField,VerificationField} from '@/components/Form/InputField/Types';
import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

import styles from '../Panel.module.css'; 

export default class EmailManagement extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
            verificationPrompt: false,
        };

        
        this.newEmailComponent = React.createRef();
        this.confirmNewEmailComponent = React.createRef();
        this.verificationCodeComponent = React.createRef();

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
        const validateComponent = component.validate();
        if(!validateComponent.success){
            this.handleErrorPopUp(validateComponent.message);
            if(handleHighlight) component.highlight();
            return false;
        }
        if(handleHighlight) component.unhighlight();
        return true;
    }

    async updateEmail(){
        const newEmailComponent = this.newEmailComponent.current;
        const confirmNewEmailComponent = this.confirmNewEmailComponent.current;
        
        const newEmailValidation = this.validateComponent(newEmailComponent);
        if(!newEmailValidation) return;
                
        const confirmNewEmailValidation = this.validateComponent(confirmNewEmailComponent);
        if(!confirmNewEmailValidation) return;

        if(newEmailComponent.state.value !== confirmNewEmailComponent.state.value){
            newEmailComponent.highlight();
            confirmNewEmailComponent.highlight();
            return this.handleErrorPopUp('Your emails do not match');
        }

        newEmailComponent.unhighlight();
        confirmNewEmailComponent.unhighlight();

        this.setState({
            processing: true
        });
        
        try{
            const updateEmailReq = await Axios.post('/api/account/update-email', {
                token: Cookies.get('token'),
                newEmail: newEmailComponent.state.value,
            });
            this.setState({
                processing: false,
            });
            if(!updateEmailReq.data.successful){
                return this.handleErrorPopUp(updateEmailReq.data.message);
            }
            this.setState({
                verificationPrompt: true
            });
            this.handleSuccessPopUp(`We'll need to verify your old email address (${updateEmailReq.data.oldEmailAddr}) in order to change it. Please check both your inbox and spam folder for a verification code.`)
        }
        catch(err){
            console.log(err);
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
    
    async verifyRequest(){
        const verificationCodeComponent = this.verificationCodeComponent.current;
        const verificationCodeValidation = this.validateComponent(verificationCodeComponent);
        if(!verificationCodeValidation) return;

        this.setState({
            processing: true
        });
        
        try{
            const verifyRequest = await Axios.post('/api/account/verify-request', {
                'verificationId': verificationCodeComponent.state.value,
            });
            this.setState({
                processing: false,
            });
            if(!verifyRequest.data.successful){
                return this.handleErrorPopUp(verifyRequest.data.message);
            }
            window.location.href = '/account/panel';
        }
        catch(err){
            console.log(err);
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
                <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                <Container>
                    {this.state.verificationPrompt ? (
                    <>
                        <Row className={styles['account-details-row-2']}>
                            <Col>
                                <div id={styles['account-details-label']}>
                                    Verification Code
                                </div>
                                <VerificationField ref={this.verificationCodeComponent} fieldName={''}/>
                            </Col>
                            
                        </Row>
                        <Row className={styles['account-details-row-2']}>
                            <Col>
                                <Button onClick={this.verifyRequest.bind(this)} id={styles['panel-action-btn']} variant='success'>Verify</Button>
                            </Col>
                        </Row>
                    </>
                    ) : (
                        <>
                            <Row>
                                <Col>
                                    <div id={styles['account-details-label']}>
                                        New Email
                                    </div>
                                    <EmailField ref={this.newEmailComponent} fieldName={''}/>
                                </Col>
                                <Col>
                                    <div id={styles['account-details-label']}>
                                        Confirm New Email
                                    </div>
                                    <EmailField ref={this.confirmNewEmailComponent} fieldName={''}/>
                                </Col>
                            </Row>
                            <Row className={styles['account-details-row-2']}>
                                <Col>
                                    <Button onClick={this.updateEmail.bind(this)} id={styles['panel-action-btn']}  variant='success'>Change Email</Button>
                                </Col>
                            </Row>
                        </>
                    )}
                </Container>
            </>
        )
    }
}