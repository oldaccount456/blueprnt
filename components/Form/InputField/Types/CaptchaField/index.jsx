import React from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

import GeneralInputField from '@/components/Form/InputField/Types/GeneralInputField';
import parseBoolFromStr from '@/utils/envParser';

export default class CaptchaField extends GeneralInputField{
    constructor(props){
        super(props);

        this.state = {
            hcaptchaToken: '',
            hcaptchaSize: 'normal',
        }

        this.formControlRef = React.createRef();
    }

    componentDidMount() {
        if(window.innerWidth < 390){
            this.setState({
                hcaptchaSize: 'compact'
            })
        }   
    }

    resetCaptcha(){
        if(parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA)){
            this.formControlRef.current.resetCaptcha();
            this.setState({
                hcaptchaToken: ''
            });
        }
    }

    handleCaptcha(token, ekey){
        this.setState({
            hcaptchaToken: token
        })
    }

    validate(){
        if(parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA)){
            if(!this.state.hcaptchaToken){
                return {
                    success: false,
                    message: 'You must fill out the captcha'
                };
            }
            return {
                success: true,
            };
        }
        return {
            success: true,
        };
    }


    render(){
        return (
            parseBoolFromStr(process.env.NEXT_PUBLIC_USING_HCAPTCHA) ? (
                <HCaptcha
                    size={this.state.hcaptchaSize}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                    onVerify={(token,ekey) => this.handleCaptcha(token, ekey)}
                    ref={this.formControlRef}
                />
            ) : (null)
        )
    }
}