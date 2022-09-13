import Layout from '@/components/Layout';
import AccountPrompt from '@/components/Form/Prompt';
import InputField from '@/components/Form/InputField'
import SubmitButton from '@/components/Form/SubmitButton';
import FormStatus from '@/components/Form/FormStatus';

import parseBoolFromStr from '@/utils/envParser';
import {validateEmail} from '@/utils/validator';

import React from 'react';
import Axios from 'axios';

import Cookies from 'js-cookie';
import HCaptcha from '@hcaptcha/react-hcaptcha';

import {
    Form,
} from 'react-bootstrap';

export default class Register extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            username: '',
            password: '',
            passwordConfirm: '',
            email: '',
            hcaptchaToken: '',
            hcaptchaSize: 'normal',
            successMessage: '',
            errorMessage: '',
            processing: false,
        }

        this.usernameField = React.createRef();
        this.passwordField = React.createRef();
        this.passwordConfirmField = React.createRef();
        this.emailField = React.createRef();
        this.captchaRef = React.createRef();
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

    componentDidMount() {
        if(window.innerWidth < 390){
            this.setState({
                hcaptchaSize: 'compact'
            })
        }   
    }

    async register(e){
        e.preventDefault();
        if(!this.state.username){
            this.usernameField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('You must enter a username');
        }
        else if(this.state.username.length >= 30){
            this.usernameField.current.style.borderColor = 'red';
            return this.handleErrorPopUp("Your username must be below 30 characters");
        }
        this.usernameField.current.style.borderColor = '';

        if(!this.state.password){
            this.passwordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('You must enter a password');
        }
        else if(this.state.password.length > 255){
            this.passwordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('Your password must be below 255 characters');
        }
        this.passwordField.current.style.borderColor = '';

        if(!this.state.passwordConfirm){
            this.passwordConfirmField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('You must confirm your password');
        }
        this.passwordConfirmField.current.style.borderColor = '';

        if(this.state.password !== this.state.passwordConfirm){
            this.passwordField.current.style.borderColor = 'red';
            this.passwordConfirmField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('Your passwords must match');
        }

        this.passwordField.current.style.borderColor = '';
        this.passwordConfirmField.current.style.borderColor = '';

        if(!this.state.email){
            this.emailField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('You must enter an email address');
        }
        else if(!validateEmail(this.state.email)){
            this.emailField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('You must enter a valid email address');
        }
        else if(this.state.email.length > 100){
            this.emailField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('Your email address cannot be over 100 characters long');
        }
        this.emailField.current.style.borderColor = '';
        if(parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA)){
            if(!this.state.hcaptchaToken){
                return this.handleErrorPopUp("Please fill out the captcha to verify you are not a bot")
            }
        }

    
        this.setState({
            processing: true
        });
        try{
            const createReq = await Axios.post('/api/account/register', {
                'username': this.state.username,
                'password': this.state.password,
                'email': this.state.email,
                'hcaptchaToken': this.state.hcaptchaToken,
            });
            this.setState({
                processing: false
            });

            if(!createReq.data.successful){
                return this.handleErrorPopUp(createReq.data.message);
            }
            
            Cookies.set('token', createReq.data.token);
            this.handleSuccessPopUp(`Your account has been created`);
            return window.location.href = '/panel';
        }
        catch(err){
            console.log(err)
            if(parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA)){
                this.captchaRef.current.resetCaptcha();
                this.setState({
                    hcaptchaToken: ''
                });
            }

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

    handleCaptcha(token, ekey){
        this.setState({
            hcaptchaToken: token
        })
    }

    updateField(e){
        switch(e.target.id){
            case "username":
                this.setState({
                    username: e.target.value
                });
                break;
            case "password":
                this.setState({
                    password: e.target.value
                });
                break;
            case "password-confirm":
                this.setState({
                    passwordConfirm: e.target.value
                });
                break;
            case "email":
                this.setState({
                    email: e.target.value
                });
                break;
            default:
                console.log('Unknown field given')
        }
    }


    render(){

        return (
            <>
                <Layout>
                    <AccountPrompt headerText='Registration' width={'500px'}>
                        <Form onSubmit={this.register.bind(this)}>
                            <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                            <InputField id='username'>
                                <Form.Label>Username</Form.Label>
                                <Form.Control ref={this.usernameField} value={this.state.username} onChange={this.updateField.bind(this)}  type="text"  placeholder="Enter username" />
                            </InputField>
                            <InputField id='password'>
                                <Form.Label>Password</Form.Label>
                                <Form.Control ref={this.passwordField} value={this.state.password} onChange={this.updateField.bind(this)}  type="password"  placeholder="Enter password" />
                            </InputField>
                            <InputField id='password-confirm'>
                                <Form.Label>Password Confirm</Form.Label>
                                <Form.Control ref={this.passwordConfirmField} value={this.state.passwordConfirm} onChange={this.updateField.bind(this)}  type="password"  placeholder="Confirm your password" />
                            </InputField>
                            <InputField id='email'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control ref={this.emailField} value={this.state.email} onChange={this.updateField.bind(this)}  type="email"  placeholder="Email Address" />
                            </InputField>
                            <InputField id='hcaptcha'>
                                {parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA) ? (
                                <HCaptcha
                                        size={this.state.hcaptchaSize}
                                        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                                        onVerify={(token,ekey) => this.handleCaptcha(token, ekey)}
                                        ref={this.captchaRef}
                                    />
                                ) : (null)}
                            </InputField>
                            <SubmitButton action={this.register.bind(this)} actionText='Register'/>   
                        </Form>
                    </AccountPrompt>
                </Layout>
            </>
        );
    }
}