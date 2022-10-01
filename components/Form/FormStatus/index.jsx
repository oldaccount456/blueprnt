import {
    Alert,
    Spinner
} from 'react-bootstrap';

import styles from './FormStatus.module.css';

export default function FormStatus(props){
    const showError = props.errorMessage.length !== 0 ? (
        <Alert variant='danger' className='text-center'>
            {props.errorMessage}
        </Alert>
    ): null;

    const showSuccess = props.successMessage.length !== 0  ? (
        <Alert variant='success' className='text-center'>
            {props.successMessage}
        </Alert>
    ): null;

    const popUpMessage = showSuccess ? showSuccess : showError;
    return (
        <div className='container text-center d-flex justify-content-center'>
            {props.processing ? <Alert variant='transparent' className='text-center'> <Loaders/></Alert> : popUpMessage}
        </div>
    );
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