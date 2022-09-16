
import FormStatus from '@/components/Form/FormStatus';
import Layout from '@/components/Layout';

import {checkToken} from '@/lib/authentication';
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
            files: [],
            fileObjs: [],
        };
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
        })
        let uploadSize = 0;

        for(let file of this.state.fileObjs){
            const fileExt = path.extname(file.name);
            const allowedExtensions = settings.allowedExts.map(ext => ext.toLowerCase());
            if(!allowedExtensions.includes(fileExt.toLowerCase())){
                return this.handleErrorPopUp(`Image upload only supports the following image extensions: ${settings.allowedExts.join(', ')}`)
            }
            if(!settings.allowedMimetypes.includes(file.type)){
                return this.handleErrorPopUp(`Image upload only supports the following mimetypes: ${settings.allowedMimetypes.join(', ')}`)
            }
            uploadSize += file.size;
        }
        
        if(Number(uploadSize) > 8000000){
            uploadSize = 0;
            return this.handleErrorPopUp('You have uploaded files more than 8mb in total, please make sure they are under 8mb in total')
        }
        const url = '/api/upload';
        const uploadReqId = Math.random().toString(26).slice(2)
        const formData = new FormData();
        formData.append('token', Cookies.get('token'))
        formData.append('loggedIn', this.props.user)
        formData.append('uploadReqId', uploadReqId)
        
        for(let file of this.state.fileObjs){
            formData.append('allFiles', file)
        }

        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            },
        }
        try{
            
            const uploadReq = await Axios.post(url, formData,config);
            window.location.href = `/${uploadReq.data.endpointHash}`
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

    handleChangeStatus(data, status) { 
        const { meta, file } = data
        if(!this.state.startedUpload){
            this.setState({
                startedUpload: true
            })
        }
        if(status === 'done'){
            let currentFiles = this.state.files;
            const index = currentFiles.indexOf(data.meta.id);
            currentFiles.splice(index, 1); 
            this.setState({
                files: currentFiles
            });

            let currentFileObjs = this.state.fileObjs;
            currentFileObjs.push(file);
            this.setState({
                fileObjs: currentFileObjs
            });
        }
       
        if(status === 'preparing'){
            let currentFiles = this.state.files;
            if(!currentFiles.includes(data.meta.id)){
                currentFiles.push(data.meta.id);
            }
            this.setState({
                files: currentFiles
            });
        }

        if(status === 'removed'){
            let currentFileObjs = this.state.fileObjs;
            currentFileObjs.pop();
            console.log(currentFileObjs)
            this.setState({
                fileObjs: currentFileObjs
            })

        }
        if(this.state.files.length === 0){
            this.handleSubmit();
        }
    }

    render(){
        return (
            <>
                <Layout user={this.props.user}>
                    <div id={styles['title-style']} className='container text-center d-flex justify-content-center'>
                        Upload Files
                    </div>
                    <FormStatus processing={this.state.processing} errorMessage={this.state.errorMessage} successMessage={this.state.successMessage}/>
                    <div id={styles['landing-area']} className='container text-center d-flex justify-content-center'>
                        <Dropzone
                            onChangeStatus={this.handleChangeStatus.bind(this)}
                            onSubmit={this.handleSubmit.bind(this)}
                            autoUpload={true}
                            inputContent={'Drop images here'}
                            
                        />
                    </div>
                </Layout>
            </>
        )
    }
}