import {
    Alert,
    Spinner
} from 'react-bootstrap';

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
        props.processing ? <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" /></Alert> : popUpMessage
    );
}