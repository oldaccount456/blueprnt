import React from 'react';
import {
    Form
} from 'react-bootstrap';

import {validateEmail} from '@/utils/validator';

export default class EmailField extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            email: '',
        }
        this.emailFormControlRef = React.createRef();
    }

    validate(){
        if(!this.state.email){
            return {
                success: false,
                message: 'You must enter an email address'
            };
        }
        else if(!validateEmail(this.state.email)){
            return {
                success: false,
                message: 'You must enter a valid email address'
            };
        }
        else if(this.state.email.length > 320){
            return {
                success: false,
                message: 'Your email address cannot be over 320 characters long'
            };
        }
        return {
            success: true,
        };
    }
    
    highlight(){
        this.emailFormControlRef.current.style.borderColor = 'red';
    }

    unhighlight(){
        this.emailFormControlRef.current.style.borderColor = '';
    }
    
    updateField(e){
        this.setState({
            email: e.target.value
        })
    }

    render(){
        return (
            <>
                <Form.Label>{this.props.fieldName}</Form.Label>
                <Form.Control ref={this.emailFormControlRef} value={this.state.email}  onChange={this.updateField.bind(this)} type="email" placeholder="Email Address" />
            </>
        )
    }
}