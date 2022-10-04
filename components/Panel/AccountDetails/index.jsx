import {
    Container,
    Row,
    Col,
    Form,
    Button
} from 'react-bootstrap';

import DeleteAccountPrompt from '@/components/Panel/DeleteAccountPrompt';
import React from 'react';
import styles from '../Panel.module.css'; 

export default function AccountDetails(props){
    const deleteAccountPromptRef = React.createRef();
    return (
        <>
            <DeleteAccountPrompt ref={deleteAccountPromptRef}/>
            <Container>
                <Row>
                    <Col>
                        <div id={styles['account-details-label']}>
                            Username
                        </div>
                        <Form.Control
                            type="text"
                            id={styles['account-details-field']}
                            value={props.accountDetails.username}
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
                            value={props.accountDetails.email}
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
                            value={props.accountDetails.createdAt}
                            disabled
                            readOnly
                        />
                    </Col>
                    <Col>
                        <div id={styles['account-details-label']}>
                            API Key - <a href='#'>Activate</a>
                        </div>
                        <Form.Control
                            type="text"
                            id={styles['account-details-field']}
                            value={props.accountDetails.apiKey}
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
                            value={props.lastLoginIP}
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
                            value={props.lastLoginDate.split("+")[0]}
                            disabled
                            readOnly
                        />
                    </Col>
                </Row>
                <Row className={styles['account-details-row-2']}>
                    <Col>
                        <Button onClick={(() => {deleteAccountPromptRef.current.openPrompt()})} id={styles['panel-action-btn']} variant='danger'>
                            Delete Account
                        </Button>
                    </Col>
                    <Col/>
                </Row>
            </Container>
        </>
    )
}