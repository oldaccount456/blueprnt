import Layout from '@/components/Layout';
import AccountPrompt from '@/components/Form/Prompt';
import SubmitButton from '@/components/Form/SubmitButton';
import FormStatus from '@/components/Form/FormStatus';

import React from 'react';
import Axios from 'axios';

import {
    Form,
} from 'react-bootstrap';

import Cookies from 'js-cookie';
import { withRouter } from 'next/router';

export async function getServerSideProps(context){
    const { verificationId } = context.params;
    return {
        props: {
            verificationId: verificationId, 
        }
    }
}

class VerifyDeletion extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
        }
        this.verifyRequest();
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

    async verifyRequest(){
        this.setState({
            processing: true
        });

        try{
            const deletionVerificationReq = await Axios.post('/api/account/verify-request', {
                'verificationId': this.props.verificationId,
            });
            this.setState({
                processing: false
            });
            if(!deletionVerificationReq.data.successful){
                return this.handleErrorPopUp(deletionVerificationReq.data.message);
            }
            Cookies.set('token', '');
            this.handleSuccessPopUp(`Your account has been permanently deleted.`);
        }
        catch(err){
            console.log(err)
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

    continue(e){
        e.preventDefault();
        window.location.href = '/';
    }

    render(){
        return (
            <>
                <Layout user={this.props.user}>
                    <AccountPrompt headerText='Verify Deletion Request' width={'500px'}>
                        <Form onSubmit={this.continue.bind(this)}>
                            <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                            <SubmitButton action={this.continue.bind(this)} actionText='Continue'/>   
                        </Form>
                    </AccountPrompt>
                </Layout>
            </>
        );
    }
}

export default withRouter(VerifyDeletion);