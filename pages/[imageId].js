import PasswordPrompt from '@/components/Modals/PasswordPrompt';
import FileShowcaser from '@/components/FileShowcaser';
import Layout from '@/components/Layout';

import {storage, bucketObject} from '@/lib/database';
import {checkToken} from '@/lib/authentication';

import React from "react";
import { withRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps({ req, res, query }){
    const authHeader = req.headers['cookie']
    const token = authHeader && authHeader.split('token=')[1];
    const verifyToken = async (token) => {
        try{
            const {username} = await checkToken(token)
            return username;
        }
        catch(e){
            return false;
        }
    } 
    const getBucketKeys = async () => {
        const bucketKeys = await storage.findOne({
            include: [bucketObject],
            where: {
                endpoint_hash: query.imageId
            }
        })
        return bucketKeys ? {
            'bucketObjects': bucketKeys.bucket_objects, 
            'encrypted': bucketKeys.encrypted
        } : {
            'bucketObjects': [],
            'encrypted': false
        };
    }
    const {bucketObjects, encrypted} = await getBucketKeys();
    const storageItems = bucketObjects.map((key) => ({
        'bucketKey': key.bucket_key,
        'mimetype': key.mimetype,
        'encrypted': encrypted
    }));
    return {
        props: {
            user: token ? await verifyToken(token) : false,
            storageItems: storageItems,
            encrypted: encrypted
        }
    }

};

class ImageViewer extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            encryptionPassword: '',
        }
        this.passwordPromptComponent = React.createRef();
        for(let storageItem of this.props.storageItems){

            this[`${storageItem.bucketKey}_ref`] = React.createRef()
        }
    }

    async componentDidMount(){
        for(let storageItem of this.props.storageItems){
            await this[`${storageItem.bucketKey}_ref`].current.downloadBuffer();
        }
        if(this.props.encrypted){
            this.passwordPromptComponent.current.setState({
                showPrompt: true
            });
        }
    }

    reopenEncryptionModal(){
        this.passwordPromptComponent.current.handleErrorPopUp('Your decryption password was incorrect, please enter the right password to view the content.')
        this.passwordPromptComponent.current.setState({
            showPrompt: true
        });

    }

    updateEncryptionPassword(password){
        for(let storageItem of this.props.storageItems){
            this[`${storageItem.bucketKey}_ref`].current.decrypt(password);
        }
    }

    render(){
        const images = this.props.storageItems.map((storageItem) => {
            return (
                <FileShowcaser 
                    ref={this[`${storageItem.bucketKey}_ref`]}
                    url={`/api/view/${storageItem.bucketKey}`} 
                    reopenEncryptionModal={this.reopenEncryptionModal.bind(this)}
                    encryptionPassword={this.state.encryptionPassword} 
                    encrypted={storageItem.encrypted} 
                    mimetype={storageItem.mimetype}
                />
            );
        });

        return (
            <>
                <Head>
                    <meta name="description" content="BluePrnt is a free, clean, easy to use image host" />
                    <meta name="keywords" content={`blueprnt, GIF capture, imagehost, screen capture, screenshot app, visual bookmark tool, screen GIF`} />
                    <title>View Content | BluePrnt</title>
                    <meta property="og:title" content="Untitled Album"/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:url" content="/"/>
                    <meta property="og:image" content={this.props.storageItems[0] ? `/api/view/${this.props.storageItems[0].bucketKey}` : `/logo.png`}/>
                    <meta name="twitter:card" content="summary_large_image"/>
                </Head>
                <PasswordPrompt 
                    header='Enter the decryption password' 
                    updateEncryptionPassword={this.updateEncryptionPassword.bind(this)} 
                    ref={this.passwordPromptComponent} 
                />
                <Layout user={this.props.user}>
                    {this.props.storageItems.length === 0 ? (
                    <>
                        <div className='container text-center d-flex justify-content-center' id='image-404-text'>
                            <h2>No images here</h2>
                        </div>
                        <div className='container text-center d-flex justify-content-center' id='image-404-hint'>
                            <h6>You may have visited the wrong link or this link has been removed from our systems.</h6>
                        </div>
                    </>
                    ) : (
                        images)
                    }
                </Layout>
            </>
        )
    }
}

export default withRouter(ImageViewer)