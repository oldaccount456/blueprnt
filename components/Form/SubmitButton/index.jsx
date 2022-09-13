import {
    Button
} from 'react-bootstrap';

export default function SubmitButton(props){
    return (
        <div className='container text-center d-flex justify-content-center'> 
            <Button variant="primary" type="submit" onClick={props.action}>
                {props.actionText}
            </Button>
        </div>
    )
}