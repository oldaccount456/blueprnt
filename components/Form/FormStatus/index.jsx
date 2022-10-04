import {
    Alert,
    Spinner
} from 'react-bootstrap';

import styles from './FormStatus.module.css';

export default function FormStatus(props){
    const showError = props.errorMessage.length !== 0 ? (
        <AlertPrompt> 
            <div id={styles['error-icon']}></div> 
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
            
            <AlertPrompt center={true}>  
                <div className='container text-center d-flex justify-content-center'>
                    <Loaders/>
                </div>
            </AlertPrompt>
        ) : popUpMessage
    );
}

const AlertPrompt = (props) => {
    return (
        props.center ? (
            <div id={styles['error-alert']}>   
                <div className='container text-center d-flex justify-content-center'>
                    <Alert id={styles['error-box']} className={styles['loader-div']} >
                        {props.children}
                    </Alert>
                </div>
                
            </div>
        ) : (
            <div id={styles['error-alert']}>   
                <Alert id={styles['error-box']} >
                    {props.children}
                </Alert>
            </div>
        )
        
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