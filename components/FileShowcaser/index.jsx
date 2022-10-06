import {
    Card
} from 'react-bootstrap';
import styles from './FileShowcaser.module.css';
import React from 'react';
import Axios from 'axios';

import {decrypt} from '@/utils/crypto';

export default class FileShowcaser extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            imageCode: props.encrypted ? null : true,
            status: 'Loading...'
        }
    }  

    async downloadBuffer(){
        const response = await Axios.get(this.props.url, {
            responseType: 'arraybuffer'
        });
        const buffer = Buffer.from(response.data, 'binary');
        const image = decrypt(buffer, this.props.encryptionPassword).toString('base64');
        this.setState({
            imageCode: image
        });        
    }


    loadFileError(){
        this.setState({
            imageCode: null
        }); 
        this.props.reopenEncryptionModal();
        
    }

    render(){
        if(!this.state.imageCode){
            return (
                <div className='container text-center d-flex justify-content-center' id={styles['card-div']}> 
                    <Card>
                        <Card.Body>
                            <>{this.state.status}</>
                        </Card.Body>
                    </Card>
                </div>
            );
        }
        switch(this.props.mimetype){
            case "video/mp4":
                return (
                    <div className='container text-center d-flex justify-content-center' id={styles['card-div']}> 
                        <Card >
                            {this.props.encrypted ? (
                                <video 
                                    onError={this.loadFileError.bind(this)}  
                                    width="300" height="480" 
                                    controls src={`data:video/mp4;base64,${this.state.imageCode}`}
                                /> 
                            ) : (
                                <video width="300" height="480" controls src={`${this.props.url}`}></video>
                            )}
                        </Card>
                    </div>
                )
            case "audio/mpeg":
                return (
                    <div className='container text-center d-flex justify-content-center' id={styles['card-div']}> 
                        <Card>
                            {this.props.encrypted ? (
                                <audio onError={this.loadFileError.bind(this)} controls autoplay>
                                    <source src={`data:audio/mpeg;base64,${this.state.imageCode}`} type="audio/mpeg"/>
                                </audio>          
                            ) : (
                                <audio id="music-player" controls autoplay>
                                    <source src={`${this.props.url}`} type="audio/mpeg"/>
                                </audio>
                            )}
                        </Card>
                    </div>
                )
            default: 
                return (
                    <div className='container text-center d-flex justify-content-center' id={styles['card-div']}> 
                        <Card>
                            <Card.Body>
                                {this.props.encrypted ? (
                                    <Card.Img onError={this.loadFileError.bind(this)} src={`data:${this.props.mimetype};base64,${this.state.imageCode}`} variant="bottom"/>
                                ) : (
                                    <Card.Img variant="bottom" src={this.props.url} />
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                )
        }
    }
}
