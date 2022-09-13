import {
    Container,
    Row,
    Col,
    Form,
    Button
} from 'react-bootstrap';

import FormStatus from '@/components/Form/FormStatus';
import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

export default class PasswordManagement extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            successMessage: '',
            errorMessage: '',
            processing: false,
        };

        
        this.oldPasswordField = React.createRef();
        this.newPasswordField = React.createRef();
        this.confirmNewPasswordField = React.createRef();
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

    updateField(e){
        switch(e.target.id){
            case "old-password":
                this.setState({
                    oldPassword: e.target.value
                });
                break;
            case "new-password":
                this.setState({
                    newPassword: e.target.value
                });
                break;
            case "confirm-new-password":
                this.setState({
                    confirmNewPassword: e.target.value
                });
                break;
        }
    }
    async updatePassword(e){
        if(e){
            e.preventDefault();
        }

        if(!this.state.oldPassword){
            this.oldPasswordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp("Please enter your current password");
        }
        this.oldPasswordField.current.style.borderColor = '';
        if(!this.state.newPassword){
            this.newPasswordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp("Please enter your new password");
        }
        if(this.state.newPassword.length < 5){
            this.newPasswordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp("Your new password has to be longer than 5 characters");
        }
        this.newPasswordField.current.style.borderColor = '';
        if(!this.state.confirmNewPassword){
            this.confirmNewPasswordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp("Please confirm your new password");
        }
        this.confirmNewPasswordField.current.style.borderColor = '';

        if(this.state.newPassword !== this.state.confirmNewPassword){
            this.newPasswordField.current.style.borderColor = 'red';
            this.confirmNewPasswordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp("Your new passwords do not match");
        }
        this.newPasswordField.current.style.borderColor = '';
        this.confirmNewPasswordField.current.style.borderColor = '';

        this.setState({
            processing: true
        });
        
        try{
            const changePasswordReq = await Axios.post('/api/account/change-password', {
                token: Cookies.get('token'),
                oldPassword: this.state.oldPassword,
                newPassword: this.state.newPassword,
            });
            this.setState({
                processing: false,
            });
            Cookies.set('token', changePasswordReq.data.token);
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
                    <Form onSubmit={this.updatePassword.bind(this)}>
                        <Row>
                            <Col>
                                <div className='panel-form-label'>
                                    Old Password
                                </div>
                                <Form.Control
                                    id='old-password'
                                    type="password"
                                    value={this.state.oldPassword}
                                    onChange={this.updateField.bind(this)}
                                    ref={this.oldPasswordField}
                                />
                            </Col>
                            <Col/>
                        </Row>
            
                        <Row className='account-details-row-2'>
                            <Col>
                                <div className='panel-form-label'>
                                    New Password
                                </div>
                                <Form.Control
                                    id='new-password'
                                    type="password"
                                    value={this.state.newPassword}
                                    onChange={this.updateField.bind(this)}
                                    ref={this.newPasswordField}
                                />
                            </Col>
                            <Col>
                                <div className='panel-form-label'>
                                    Confirm New Password
                                </div>
                                <Form.Control
                                    id='confirm-new-password'
                                    type="password"
                                    value={this.state.confirmNewPassword}
                                    onChange={this.updateField.bind(this)}
                                    ref={this.confirmNewPasswordField}
                                />
                            </Col>
                        </Row>
                        <Row className='account-details-row-2'>
                            <Col>
                                <Button onClick={this.updatePassword.bind(this)} className='panel-form-label' variant='primary'>Submit</Button>
                            </Col>
                            <Col/>
                        </Row>
                    </Form>
                </Container>
            </>
        )
    }
}