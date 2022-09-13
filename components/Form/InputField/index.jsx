import {Form} from 'react-bootstrap';
import styles from './InputField.module.css';

export default function InputField(props){
    return (
        <div className={`container text-center d-flex justify-content-center ${styles['move-bottom']}`}> 
            <Form.Group controlId={props.id}>
                {props.children}
            </Form.Group>
        </div>
    )
}