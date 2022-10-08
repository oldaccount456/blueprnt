import React from 'react';
import {
    Form
} from 'react-bootstrap';

import GeneralInputField from '@/components/Form/InputField/Types/GeneralInputField';
import styles from '../../InputField.module.css';

export default class NoteField extends GeneralInputField{
    constructor(props){
        super(props);

        this.formControlRef = React.createRef();
    }    

    validate(){
        if(!this.state.value){
            return {
                success: false,
                message: 'You must enter a note'
            };
        }
        if(this.state.value.length > 3000){
            return {
                success: false,
                message: 'Your note must be under 3000 characters long'
            };
        }
        return {
            success: true
        };
    }
    
    render(){
        return (
            <>
                <Form.Label id={styles['form-label']}>{this.props.fieldName}</Form.Label>
                {this.props.disabled ?
                (<Form.Control id={styles['form-input']} ref={this.formControlRef} value={this.props.value} onChange={this.updateField.bind(this)} type="text" as="textarea" rows={3}   disabled/>

                ) : (
                    <Form.Control id={styles['form-input']} ref={this.formControlRef} value={this.state.value} onChange={this.updateField.bind(this)} type="text" as="textarea" rows={3}   />
                )}
            </>
        )
    }
}