import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';

import {
    Modal,
    Button
} from 'react-bootstrap';

import styles from '../Panel.module.css'; 

export default class DeleteAccountPrompt extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showPrompt: false,
        }
    }

    openPrompt(){
        this.setState({
            showPrompt: true
        });
    }

    closePrompt(e){
        this.setState({
            showPrompt: false
        })
    }

    async deleteAccount(){
        try{
            const deleteAccountReq = await Axios.post('/api/account/delete-account', {
                token: Cookies.get('token'),
            });
            this.setState({
                processing: false,
            });
            if(!deleteAccountReq.data.successful){
                alert(deleteAccountReq.data.message);
            }

            alert(`We'll need to verify your request, so we have sent a verification email to (${deleteAccountReq.data.emailAddr}). Please check both your inbox and spam folder for the email and follow the instructions on there.`)
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
            <Modal show={this.state.showPrompt} onHide={this.closePrompt.bind(this)}>
                <Modal.Header className={styles['delete-account']} closeButton>
                    <Modal.Title>Account Deletion Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles['delete-account']}>Are you sure you want to delete your account?</Modal.Body>
                <Modal.Footer className={styles['delete-account']}>
                    <Button id={styles['delete-account-btn']} variant="danger" onClick={this.deleteAccount.bind(this)}>
                        Yes
                    </Button>
                    <Button  id={styles['delete-account-btn']} variant="primary" onClick={this.closePrompt.bind(this)}>
                        No
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}