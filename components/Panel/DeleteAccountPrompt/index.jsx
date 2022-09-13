import React from 'react';

import {
    Modal,
    Button
} from 'react-bootstrap';

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

        alert('Sending verif email and deleting..')

    }

    render(){
        return (
            <Modal show={this.state.showPrompt} onHide={this.closePrompt.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Account Deletion Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete your account?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.deleteAccount.bind(this)}>
                        Yes
                    </Button>
                    <Button variant="primary" onClick={this.closePrompt.bind(this)}>
                        No
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}