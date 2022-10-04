import {
    Container,
    Row,
    Col,
    Card
} from 'react-bootstrap';
import styles from './Prompt.module.css';

export default function AccountPrompt(props){
    return (
        <Container id={styles['account-prompt-container']} fluid>  
            <Row>
                <Col>
                    <div className='container text-center d-flex justify-content-center'> 
                        <Card id={styles['account-prompt-card']} style={{'width': props.width, 'height': props.height}} className='mb-2 lg-card'>
                            
                            <Card.Body>
                                {props.children}
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}