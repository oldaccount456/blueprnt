import React from 'react';
import {
    Form
} from 'react-bootstrap';

import GeneralInputField from '@/components/Form/InputField/Types/GeneralInputField';
import {validatePassword} from '@/utils/validator';

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
        else if(!validatePassword(this.state.value)){
            return {
                success: false,
                message: 'Your password must be more than 5 characters'
            };
        }
        return {
            success: true,
        };
    }
    
    render(){
        return (
            <>
                <Form.Label>{this.props.fieldName}</Form.Label>
                <Form.Control ref={this.formControlRef} value={this.state.value} onChange={this.updateField.bind(this)} type="password" placeholder={this.props.fieldName} />
            </>
        )
    }
}