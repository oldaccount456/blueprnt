import {
    Container,
    Row,
    Col,
    Form,
    Button
} from 'react-bootstrap';

import DeleteAccountPrompt from '@/components/Panel/DeleteAccountPrompt';
import React from 'react';
/* import styles from './AccountDetails.module.css'; */

export default function AccountDetails(props){
    const deleteAccountPromptRef = React.createRef();
    return (
        <>
            <DeleteAccountPrompt ref={deleteAccountPromptRef}/>
            <Container>
                <Row>
                    <Col>
                        <div className='panel-form-label'>
                            Username
                        </div>
                        <Form.Control
                            type="text"
                            value={props.accountDetails.username}
                            disabled
                            readOnly
                        />
                    </Col>
                    <Col>
                        <div className='panel-form-label'>
                            Email
                        </div>
                        <Form.Control
                            type="text"
                            value={props.accountDetails.email}
                            disabled
                            readOnly
                        />
                
                    </Col>
                </Row>
                <Row className='account-details-row-2'>
                    <Col>
                        <div className='panel-form-label'>
                            Creation Date
                        </div>
                        <Form.Control
                            type="text"
                            value={props.accountDetails.createdAt}
                            disabled
                            readOnly
                        />
                    </Col>
                    <Col>
                        <div className='panel-form-label'>
                            API Key - <a href='#'>Activate</a>
                        </div>
                        <Form.Control
                            type="text"
                            value={props.accountDetails.apiKey}
                            disabled
                            readOnly
                        />
                    </Col>
                </Row>
                <Row className='account-details-row-2'>
                    <Col>
                        <div className='panel-form-label'>
                            Last Login IP
                        </div>
                        <Form.Control
                            type="text"
                            value={props.lastLoginIP}
                            disabled
                            readOnly
                        />
                    </Col>
                    <Col>
                        <div className='panel-form-label'>
                            Last Login Date
                        </div>
                        <Form.Control
                            type="text"
                            value={props.lastLoginDate.split("+")[0]}
                            disabled
                            readOnly
                        />
                    </Col>
                </Row>
                <Row className='account-details-row-2'>
                    <Col>
                        <Button onClick={(() => {deleteAccountPromptRef.current.openPrompt()})} className='panel-form-label' variant='danger'>
                            Delete Account
                        </Button>
                    </Col>
                    <Col/>
                </Row>
            </Container>
        </>
    )
}