import {
    Button
} from 'react-bootstrap';

import styles from './SubmitButton.module.css';

export default function SubmitButton(props){
    return (
        <div className='container text-center d-flex justify-content-center'> 
            <Button id={styles['submit-btn']} variant="primary" type="submit" onClick={props.action}>
                {props.actionText}
            </Button>
        </div>
    )
}