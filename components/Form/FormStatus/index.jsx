import {
    Alert,
    Spinner
} from 'react-bootstrap';

import styles from './FormStatus.module.css';

export default function FormStatus(props){
    const showError = props.errorMessage.length !== 0 ? (
        <AlertPrompt> 
            <div id={styles['error-icon']} style={{height: props.errorIconHeight ? props.errorIconHeight : '21px'}}></div> 
            <div className='container text-center d-flex justify-content-center'>
                <div className={styles['prompt-message']}>{props.errorMessage}</div>
            </div>
        </AlertPrompt>
    ): null;

    const showSuccess = props.successMessage.length !== 0  ? (
        <AlertPrompt> 
             <div className='container text-center d-flex justify-content-center'>
                <div className={styles['prompt-message']}>
                    {props.successMessage}
                </div>
            </div>
        </AlertPrompt>
    ): null;

    const popUpMessage = showSuccess ? showSuccess : showError;
    return (
        props.processing ? (
            <div id={styles['loader-div']} className='container text-center d-flex justify-content-center'>
                <Loaders/>
            </div>
        ) : popUpMessage
    );
}

const AlertPrompt = (props) => {
    return (
        <div id={styles['error-alert']}>   
            <Alert id={styles['error-box']} >
                {props.children}
            </Alert>
        </div>
    )
}

const Loaders = () => {
    return (
        <div id={styles['loaders']}>
            <Spinner animation="grow" size="sm" /> 
            <Spinner animation="grow" size="sm" /> 
            <Spinner animation="grow" size="sm" />
        </div>
    )
}