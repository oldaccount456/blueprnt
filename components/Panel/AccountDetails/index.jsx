import {
    Container,
    Row,
    Col,
    Form,
    Button
} from 'react-bootstrap';
import FormStatus from '@/components/Form/FormStatus';
import DeleteAccount from '@/components/Modals/DeleteAccount';
import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import styles from '../Panel.module.css'; 


export default class AccountDetails extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            successMessage: '',
            errorMessage: '',
            processing: false,
            apiKey: props.accountDetails.apiKey

        }

        this.deleteAccountModalRef = React.createRef();
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

    async activateApiKey(){
        this.setState({
            processing: true
        });
        try{
            const activateKeyReq = await Axios.post('/api/account/activate-key', {
                token: Cookies.get('token'),
            });
            this.setState({
                processing: false,
            });
            if(!activateKeyReq.data.successful){
                return this.handleErrorPopUp(activateKeyReq.data.message);
            }
            this.setState({
                apiKey: activateKeyReq.data.apiKey
            });
            this.handleSuccessPopUp(`Your API key is: ${activateKeyReq.data.apiKey}`);
        }
        catch(err){
            console.log(err);
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

    async deactivateApiKey(){
        this.setState({
            processing: true
        });
        try{
            const deactivateKeyReq = await Axios.post('/api/account/deactivate-key', {
                token: Cookies.get('token'),
            });
            this.setState({
                processing: false,
            });
            if(!deactivateKeyReq.data.successful){
                return this.handleErrorPopUp(deactivateKeyReq.data.message);
            }
            this.setState({
                apiKey: 'Not Activated'
            });
            this.handleSuccessPopUp('Your API key has been deactivated');
        }
        catch(err){
            console.log(err);
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

    render(){
        return (
            <>
                <DeleteAccount 
                    handleSuccessPopUp={this.handleSuccessPopUp.bind(this)} 
                    handleErrorPopUp={this.handleErrorPopUp.bind(this)}
                    ref={this.deleteAccountModalRef}
                />
                <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                <Container>
                    <Row>
                        <Col>
                            <div id={styles['account-details-label']}>
                                Username
                            </div>
                            <Form.Control
                                type="text"
                                id={styles['account-details-field']}
                                value={this.props.accountDetails.username}
                                disabled
                                readOnly
                            />
                        </Col>
                        <Col>
                            <div id={styles['account-details-label']}>
                                Email
                            </div>
                            <Form.Control
                                type="text"
                                id={styles['account-details-field']}
                                value={this.props.accountDetails.email}
                                disabled
                                readOnly
                            />
                    
                        </Col>
                    </Row>
                    <Row className={styles['account-details-row-2']}>
                        <Col>
                            <div id={styles['account-details-label']}>
                                Creation Date
                            </div>
                            <Form.Control
                                type="text"
                                id={styles['account-details-field']}
                                value={this.props.accountDetails.createdAt}
                                disabled
                                readOnly
                            />
                        </Col>
                        <Col>
                            <div id={styles['account-details-label']}>
                                API Key - {this.state.apiKey === 'Not Activated' ? (
                                     <a onClick={this.activateApiKey.bind(this)} href='#'>Activate Key</a>
                                ) :  (
                                    <a onClick={this.deactivateApiKey.bind(this)} href='#'>Deactivate Key</a>
                                )}
                            </div>
                            <Form.Control
                                type="text"
                                id={styles['account-details-field']}
                                value={this.state.apiKey}
                                disabled
                                readOnly
                            />
                        </Col>
                    </Row>
                    <Row className={styles['account-details-row-2']}>
                        <Col>
                            <div id={styles['account-details-label']}>
                                Last Login IP
                            </div>
                            <Form.Control
                                type="text"
                                id={styles['account-details-field']}
                                value={this.props.lastLoginIP}
                                disabled
                                readOnly
                            />
                        </Col>
                        <Col>
                            <div id={styles['account-details-label']}>
                                Last Login Date
                            </div>
                            <Form.Control
                                type="text"
                                id={styles['account-details-field']}
                                value={this.props.lastLoginDate.split("+")[0]}
                                disabled
                                readOnly
                            />
                        </Col>
                    </Row>
                    <Row className={styles['account-details-row-2']}>
                        <Col>
                            <Button onClick={(() => {this.deleteAccountModalRef.current.openPrompt()})} id={styles['panel-action-btn']} variant='danger'>
                                Delete Account
                            </Button>
                        </Col>
                        <Col/>
                    </Row>
                </Container>
            </>
        )
    }
}