import FormStatus from '@/components/Form/FormStatus';
import UploadOptions from '@/components/UploadOptions';
import PasswordPrompt from '@/components/Modals/PasswordPrompt';
import NotePrompt from '@/components/Modals/NotePrompt';
import Layout from '@/components/Layout';
import {checkToken} from '@/lib/authentication';
import {encryptBuffer, encryptString} from '@/utils/crypto';
import settings from '@/utils/settings.json';
import styles from '@/styles/Home.module.css';
import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import Dropzone from 'react-dropzone-uploader';
import path from 'path';

export async function getServerSideProps({ req, res }){
    const authHeader = req.headers['cookie']
    const token = authHeader && authHeader.split('token=')[1];
    const getUser = async (token) => {
        try{
            const {username} = await checkToken(token)
            return username;
        }
        catch(e){
            return false;
        }
    } 
    return {
        props: {
            user: token ? await getUser(token) : false,
        }
    }
};

export default class LandingPage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            processing: false,
            successMessage: '',
            errorMessage: '',
            uploadingFile: false,
            startedUpload: false,
            enableEncryption: false,
            encryptionPassword: '',
            filesBeingProcessed: [],
            fileObjs: [],
            expiry: 'No Expiry'
        };

        this.passwordPromptComponent = React.createRef();
    }

    switchEncryptionState(){
        if(!this.state.enableEncryption){
            this.passwordPromptComponent.current.setState({
                showPrompt: true
            });
        }
        else{
            this.setState({
                encryptionPassword: '',
                enableEncryption: false
            });
        }
        
    }

    updateEncryptionPassword(password){
        this.setState({
            encryptionPassword: password,
            enableEncryption: !this.state.enableEncryption
        });
    }

    changeViewAmount(){
        if(this.state.viewAmount === '∞ times'){
            this.setState({
                viewAmount: `1 time`,
            });
        }
        else if(Number(this.state.viewAmount.split(' times')[0]) === 10){
            this.setState({
                viewAmount: '∞ times'
            })
        }
        else{
            const newAmount = Number(this.state.viewAmount[0])+1
            this.setState({
                viewAmount: `${newAmount} times`
            })
        }   
    }

    changeExpiry(){
        const expiryTimes = Object.keys(settings.expiryTimes);
        this.setState({
            expiry: expiryTimes.indexOf(this.state.expiry) === expiryTimes.length-1 ? expiryTimes[0] : expiryTimes[expiryTimes.indexOf(this.state.expiry)+1]
        });
    }

    handleErrorPopUp(errorMessage){
        return this.setState({
            errorMessage: errorMessage,
            successMessage: '',
            processing: false,
        });
    }

      
    handleSuccessPopUp(successMessage){
        return this.setState({
            successMessage: successMessage,
            errorMessage: '',
            processing: false,
        });
    }
    
    async handleSubmit(){
        this.setState({
            processing: true
        });
        let uploadSize = 0;
        for(let file of this.state.fileObjs){
            const fileExt = path.extname(file.name);
            const allowedExtensions = settings.allowedExts.map(ext => ext.toLowerCase());
            if(!allowedExtensions.includes(fileExt.toLowerCase())){
                return this.handleErrorPopUp(`Image upload only supports the following image extensions: ${settings.allowedExts.join(', ')}`);
            }
            if(!settings.allowedMimetypes.includes(file.type)){
                return this.handleErrorPopUp(`Image upload only supports the following mimetypes: ${settings.allowedMimetypes.join(', ')}`);
            }
            uploadSize += file.size;
        }
        if(Number(uploadSize) > settings.maxFileSize){
            uploadSize = 0;
            return this.handleErrorPopUp('You have uploaded files more than 4mb in total, please make sure they are under 4mb in total');
        }
        const url = '/api/upload';
        const uploadReqId = Math.random().toString(26).slice(2);
        const formData = new FormData();
        formData.append('token', Cookies.get('token'));
        formData.append('uploadReqId', uploadReqId);
        formData.append('viewAmount', this.state.viewAmount === '∞ times' ? 0 : Number(this.state.viewAmount.split(' times')[0]) || Number(this.state.viewAmount.split(' time')[0]));
        formData.append('expiry', this.state.expiry);
        formData.append('note', this.state.enableEncryption && this.state.note !== '' ? await encryptString(this.state.note, this.state.encryptionPassword) : this.state.note);
        this.state.enableEncryption ? formData.append('encrypted', true) : formData.append('encrypted', false);
        for(let file of this.state.fileObjs){
            if(this.state.enableEncryption){
                const buffer = await this.blobToBuffer(file);
                const encryptedBuffer = encryptBuffer(buffer, this.state.encryptionPassword);
                const encryptedFile = new Blob([encryptedBuffer], { type: file.type });
                formData.append('allFiles', encryptedFile);
            }
            else{
                formData.append('allFiles', file);
            }
        }
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            },
        }
        try{
            const uploadReq = await Axios.post(url, formData,config);
            window.location.href = uploadReq.data;
        }
        catch(err){
            console.log(err);
            let errorMessage = (!err.response.data.message || err.response.data.message == "") ?  "There was an error, please contact an admin for more." : err.response.data.message;
            if(Number(err.response.status) === 429){
                errorMessage = err.response.data
            }
            return this.handleErrorPopUp(errorMessage);
        }
    }

    async blobToBuffer(blob){
        return new Promise((resolve, reject) => {
            if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
                return reject('first argument must be a Blob')
            }
            const reader = new FileReader()
            const onLoadEnd = (e) =>  {
                reader.removeEventListener('loadend', onLoadEnd, false)
                if (e.error) {
                    return reject(e.error)
                }
                else {
                    return resolve(Buffer.from(reader.result))
                }
            }
            reader.addEventListener('loadend', onLoadEnd, false)
            reader.readAsArrayBuffer(blob)
        })
    }

    async handleChangeStatus(data, status) { 
        const { meta, file } = data;
        if(!this.state.startedUpload){
            this.setState({
                startedUpload: true
            })
        }
        if(status === 'done'){
            let currentFiles = this.state.filesBeingProcessed;
            const index = currentFiles.indexOf(data.meta.id);
            currentFiles.splice(index, 1); 
            this.setState({
                filesBeingProcessed: currentFiles
            });

            let currentFileObjs = this.state.fileObjs;
            currentFileObjs.push(file);
            this.setState({
                fileObjs: currentFileObjs
            });
        }
        if(status === 'preparing'){
            let currentFiles = this.state.filesBeingProcessed;
            if(!currentFiles.includes(data.meta.id)){
                currentFiles.push(data.meta.id);
            }
            this.setState({
                filesBeingProcessed: currentFiles
            });
        }
        if(status === 'removed'){
            let currentFileObjs = this.state.fileObjs;
            currentFileObjs.pop();
            
            this.setState({
                fileObjs: currentFileObjs
            });
        }
        if(this.state.filesBeingProcessed.length === 0 && this.state.fileObjs.length !== 0){
            this.handleSubmit();
        }
    }

    render(){
        return (
            <>
                <PasswordPrompt 
                    header='Set an encryption password' 
                    updateEncryptionPassword={this.updateEncryptionPassword.bind(this)} 
                    ref={this.passwordPromptComponent} 
                />
                <Layout user={this.props.user}>
                    <div id={styles['title-style']} className='container text-center d-flex justify-content-center'>
                        Upload Files
                    </div>
                    <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage} errorIconHeight={'23px'}/>
                    <div id={styles['landing-area']} className='container text-center d-flex justify-content-center'>
                        <Dropzone
                            onChangeStatus={this.handleChangeStatus.bind(this)}
                            onSubmit={this.handleSubmit.bind(this)}
                            autoUpload={true}
                            inputContent={'Drop content here'}
                        />
                    </div>
                    <div className='container text-center d-flex justify-content-center'>
                        <UploadOptions 
                            expiry={this.state.expiry}
                            enableEncryption={this.state.enableEncryption} 
                            switchEncryptionState={this.switchEncryptionState.bind(this)}
                            changeExpiry={this.changeExpiry.bind(this)}
                        />
                    </div>
                </Layout>
            </>
        )
    }
}