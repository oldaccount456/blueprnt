import {
    Container,
    Row,
    Col,
    Button
} from 'react-bootstrap';

import FormStatus from '@/components/Form/FormStatus';
import {EmailField} from '@/components/Form/InputField/Types';
import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

export default class EmailManagement extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
        };

        
        this.newEmailComponent = React.createRef();
        this.confirmNewEmailComponent = React.createRef();

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


    async updateEmail(e){
        if(e){
            e.preventDefault();
        }

        const newEmailComponent = this.newEmailComponent.current;
        const confirmNewEmailComponent = this.confirmNewEmailComponent.current;

        const validateNewEmail = newEmailComponent.validate();
        if(!validateNewEmail.success){
            this.handleErrorPopUp(validateNewEmail.message);
            return newEmailComponent.highlight();
        }
        newEmailComponent.unhighlight();

        const validateConfirmEmail = confirmNewEmailComponent.validate();
        if(!validateConfirmEmail.success){
            this.handleErrorPopUp(validateConfirmEmail.message);
            return confirmNewEmailComponent.highlight();
        };
        confirmNewEmailComponent.unhighlight();

        if(newEmailComponent.state.email !== confirmNewEmailComponent.state.email){
            newEmailComponent.highlight();
            confirmNewEmailComponent.highlight();
            return this.handleErrorPopUp('Your emails do not match, please enter it correctly');
        }
    
        newEmailComponent.unhighlight();
        confirmNewEmailComponent.unhighlight();

        this.setState({
            processing: true
        });
        
        try{
            const changeEmailReq = await Axios.post('/api/account/change-email', {
                token: Cookies.get('token'),
                newEmail: newEmailComponent.state.email,
                newPassword: confirmNewEmailComponent.state.email,
            });
            this.setState({
                processing: false,
            });
            // show prompt for validating past email??
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
                    
                        <Row className='account-details-row-2'>
                            <Col>
                                <div className='panel-form-label'>
                                    New Email
                                </div>
                                <EmailField ref={this.newEmailComponent} fieldName={''}/>
                            </Col>
                            <Col>
                                <div className='panel-form-label'>
                                    Confirm New Email
                                </div>
                                <EmailField ref={this.confirmNewEmailComponent} fieldName={''}/>
                            </Col>
                        </Row>
                        <Row className='account-details-row-2'>
                            <Col>
                                <Button onClick={this.updateEmail.bind(this)} className='panel-form-label' variant='primary'>Change Email</Button>
                            </Col>
                            <Col/>
                        </Row>
                </Container>
            </>
        )
    }
}