import {
    Card
} from 'react-bootstrap';
import styles from './FileShowcaser.module.css';

export default function FileShowcaser(props){
    switch(props.mimetype){
        case "video/mp4":
            return (
                <div className='container text-center d-flex justify-content-center' id={styles['card-div']}> 
                    <Card >
                        <video className='video-stream'  width="300" height="480" controls src={`${props.url}`}></video>
                    </Card>
                </div>
            )
        case "audio/mpeg":{
            <div className='container text-center d-flex justify-content-center' id={styles['card-div']}> 
                <Card>
                    <audio id="music-player" controls autoplay hidden><source src={`${props.url}`} type="audio/mpeg"/></audio>          
                </Card>
            </div>
        }
        default: 
            return (
                <div className='container text-center d-flex justify-content-center' id={styles['card-div']}> 
                    <Card>
                       <Card.Body>
                            <Card.Img variant="bottom" src={props.url} />
                       </Card.Body>
                    </Card>
                </div>
            )
    }
}