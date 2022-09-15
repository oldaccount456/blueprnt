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
            validated: false,
        }

        this.emailFormControlRef = React.createRef();
    }

    validate(){
        console.log(this.state.email.length)
        if(!this.state.email){
            this.setState({validated: false})
            this.emailFormControlRef.current.style.borderColor = 'red';
            return this.props.handleErrorPopUp('You must enter an email address');
        }
        else if(!validateEmail(this.state.email)){
            this.setState({validated: false})
            this.emailFormControlRef.current.style.borderColor = 'red';
            return this.props.handleErrorPopUp('You must enter a valid email address');
        }
        else if(this.state.email.length > 320){
            this.setState({validated: false})
            this.emailFormControlRef.current.style.borderColor = 'red';
            return this.props.handleErrorPopUp('Your email address cannot be over 320 characters long');
        }
        this.emailFormControlRef.current.style.borderColor = '';
        this.setState({validated: true});
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
                <Form.Control ref={this.emailFormControlRef} value={this.state.email} onChange={this.updateField.bind(this)} type="email" placeholder="Email Address" />
            </>
        )
    }
}