import React from 'react';

import {
    Modal,
    Button
} from 'react-bootstrap';
import InputField from '@/components/Form/InputField';
import {PasswordField} from '@/components/Form/InputField/Types';
import FormStatus from '@/components/Form/FormStatus';
import styles from '@/components/Modals/Modals.module.css'; 

export default class PasswordPrompt extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
            showPrompt: false,
        }

        this.encryptionPasswordComponent = React.createRef();
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

    openPrompt(){
        this.setState({
            showPrompt: true
        });
    }

    closePrompt(){
        if(!this.validateComponent(this.encryptionPasswordComponent.current)) return;
        this.props.updateEncryptionPassword(this.encryptionPasswordComponent.current.state.value);
        this.setState({
            showPrompt: false
        })
    }

    render(){
        return (
            <Modal show={this.state.showPrompt} onHide={this.closePrompt.bind(this)}>
                <Modal.Header className={styles['modal-style']} closeButton>
                    <Modal.Title>{this.props.header}</Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles['modal-style']}>
                <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                    <InputField id='password'>
                        <PasswordField ref={this.encryptionPasswordComponent} fieldName={'Encryption Password'} />
                    </InputField>
                </Modal.Body>
                <Modal.Footer className={styles['modal-style']}>
                    <Button className={styles['modal-btn']} variant="danger" onClick={this.closePrompt.bind(this)}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}