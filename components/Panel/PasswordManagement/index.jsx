import {
    Container,
    Row,
    Col,
    Button
} from 'react-bootstrap';
import {PasswordField} from '@/components/Form/InputField/Types';
import FormStatus from '@/components/Form/FormStatus';
import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

export default class PasswordManagement extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
        };

        
        this.oldPasswordComponent = React.createRef();
        this.newPasswordComponent = React.createRef();
        this.confirmNewPasswordComponent = React.createRef();
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
        const validateUsername = component.validate();
        if(!validateUsername.success){
            this.handleErrorPopUp(validateUsername.message);
            if(handleHighlight) component.highlight();
            return false;
        }

        if(handleHighlight) component.unhighlight();
        return true;
    }

    async updatePassword(){
        const oldPasswordComponent = this.oldPasswordComponent.current;
        const newPasswordComponent = this.newPasswordComponent.current;
        const confirmNewPasswordComponent = this.confirmNewPasswordComponent.current;

        const oldPasswordValidation = this.validateComponent(oldPasswordComponent);
        if(!oldPasswordValidation) return;

        const newPasswordValidation = this.validateComponent(newPasswordComponent);
        if(!newPasswordValidation) return;

        const confirmNewPasswordValidation = this.validateComponent(confirmNewPasswordComponent);
        if(!confirmNewPasswordValidation) return;

        if(newPasswordComponent.state.value !== confirmNewPasswordComponent.state.value){
            newPasswordComponent.highlight();
            confirmNewPasswordComponent.highlight();
            return this.handleErrorPopUp('Your new passwords must match');
        }
        newPasswordComponent.unhighlight();
        confirmNewPasswordComponent.unhighlight();   

        this.setState({
            processing: true
        });
        
        try{
            const updatePasswordReq = await Axios.post('/api/account/update-password', {
                'token': Cookies.get('token'),
                'oldPassword': oldPasswordComponent.state.value,
                'newPassword': newPasswordComponent.state.value,
            });
            this.setState({
                processing: false,
            });
            if(!updatePasswordReq.data.successful){
                return this.handleErrorPopUp(updatePasswordReq.data.message);
            }
            Cookies.set('token', updatePasswordReq.data.token);
            this.handleSuccessPopUp('Your password has been updated')
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
                    <Row>
                        <Col>
                                <div className='panel-form-label'>
                                    Old Password
                                </div>
                                <PasswordField ref={this.oldPasswordComponent} fieldName={''} />
                            </Col>
                        <Col/>
                    </Row>
                    <Row className='account-details-row-2'>
                        <Col>
                            <div className='panel-form-label'>
                                New Password
                            </div>
                            <PasswordField ref={this.newPasswordComponent} fieldName={''} />
                        </Col>
                        <Col>
                            <div className='panel-form-label'>
                                Confirm New Password
                            </div>
                            <PasswordField ref={this.confirmNewPasswordComponent} fieldName={''} />
                        </Col>
                    </Row>
                    <Row className='account-details-row-2'>
                        <Col>
                            <Button onClick={this.updatePassword.bind(this)} className='panel-form-label' variant='primary'>Change Password</Button>
                        </Col>
                        <Col/>
                    </Row>
                </Container>
            </>
        )
    }
}