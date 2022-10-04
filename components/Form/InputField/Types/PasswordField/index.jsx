import React from 'react';
import {
    Form
} from 'react-bootstrap';

import GeneralInputField from '@/components/Form/InputField/Types/GeneralInputField';
import {validatePassword} from '@/utils/validator';
import styles from '../../InputField.module.css';

export default class PasswordField extends GeneralInputField{
    constructor(props){
        super(props);

        this.formControlRef = React.createRef();
    }

    validate(){
        if(!this.state.value){
            return {
                success: false,
                message: 'You must enter a password'
            };
        }
        return validatePassword(this.state.value);
    }
    
    render(){
        return (
            <>
                <Form.Label id={styles['form-label']}>{this.props.fieldName}</Form.Label>
                <Form.Control id={styles['form-input']} ref={this.formControlRef} value={this.state.value} onChange={this.updateField.bind(this)} type="password" />
            </>
        )
    }
}