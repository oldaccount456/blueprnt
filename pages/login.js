import Layout from '@/components/Layout';
import AccountPrompt from '@/components/Form/Prompt';
import InputField from '@/components/Form/InputField'
import SubmitButton from '@/components/Form/SubmitButton';
import FormStatus from '@/components/Form/FormStatus';

import parseBoolFromStr from '@/utils/envParser';

import React from 'react';
import Axios from 'axios';

import {
    Form,
} from 'react-bootstrap';

import Cookies from 'js-cookie';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default class Login extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            username: '',
            password: '',
            hcaptchaToken: '',
            hcaptchaSize: 'normal',
            successMessage: '',
            errorMessage: '',
            processing: false,
        }

        this.usernameField = React.createRef();
        this.passwordField = React.createRef();
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

    async login(e){
        e.preventDefault();
        if(!this.state.username){
            this.usernameField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('You must enter a username');
        }
        else if(this.state.username.length >= 30){
            this.usernameField.current.style.borderColor = 'red';
            return this.handleErrorPopUp("Usernames are below 30 characters");
        }
        this.usernameField.current.style.borderColor = '';

        if(!this.state.password){
            this.passwordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('You must enter a password');
        }
        else if(this.state.password.length > 255){
            this.passwordField.current.style.borderColor = 'red';
            return this.handleErrorPopUp('Passwords are below 255 characters');
        }
        this.passwordField.current.style.borderColor = '';

        if(parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA)){
            if(!this.state.hcaptchaToken){
                return this.handleErrorPopUp("Please fill out the captcha to verify you are not a bot")
            }
        }

        this.setState({
            processing: true
        });

        try{
            const loginReq = await Axios.post('/api/account/login', {
                'username': this.state.username,
                'password': this.state.password,
                'hcaptchaToken': this.state.hcaptchaToken,
            });
            this.setState({
                processing: false
            });
            if(!loginReq.data.successful){
                return this.handleErrorPopUp(loginReq.data.message);
            }
            Cookies.set('token', loginReq.data.token);
            this.handleSuccessPopUp(`You have successfully logged in`);
            return window.location.href = '/gallery';
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
            default:
                console.log('Unknown field given')
        }
    }

    render(){
        return (
            <>
                <Layout user={this.props.user}>
                    <AccountPrompt headerText='Login' width={'500px'}>
                        <Form onSubmit={this.login.bind(this)}>
                            <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                            <InputField id='username'>
                                <Form.Label>Username</Form.Label>
                                <Form.Control ref={this.usernameField} value={this.state.username} onChange={this.updateField.bind(this)}  type="text"  placeholder="Enter username" />
                            </InputField>
                            <InputField id='password'>
                                <Form.Label>Password</Form.Label>
                                <Form.Control ref={this.passwordField} value={this.state.password} onChange={this.updateField.bind(this)}  type="password"  placeholder="Enter password" />
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
                            <SubmitButton action={this.login.bind(this)} actionText='Login'/>   
                        </Form>
                    </AccountPrompt>
                </Layout>
            </>
        );
    }
}