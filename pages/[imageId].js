import PasswordPrompt from '@/components/Modals/PasswordPrompt';
import NotePrompt from '@/components/Modals/NotePrompt';
import FileShowcaser from '@/components/FileShowcaser';
import Layout from '@/components/Layout';

import {storage, bucketObject} from '@/lib/database';
import {checkToken} from '@/lib/authentication';
import {decryptString} from '@/utils/crypto';
import styles from '@/styles/ImageView.module.css';
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
    const getStorageData = async () => {
        const storageData = await storage.findOne({
            include: [bucketObject],
            where: {
                endpoint_hash: query.imageId
            }
        });
        return storageData ? {
            'bucketObjects': storageData.bucket_objects, 
            'encrypted': storageData.encrypted,
            'viewAmount': storageData.view_amount,
            'viewCount': storageData.view_count,
            'expiry': storageData.expiry,
            'note': storageData.note,
        } : {
            'bucketObjects': [],
            'encrypted': false,
            'viewAmount': 0,
            'viewCount': 0,
            'expiry': 0,
            'note': ''
        };
    }
    const {
        bucketObjects, 
        encrypted, 
        viewAmount, 
        viewCount,
        expiry,
        note
    } = await getStorageData();
    const storageItems = bucketObjects.map((key) => ({
        'bucketKey': key.bucket_key,
        'mimetype': key.mimetype,
        'encrypted': encrypted
    }));
    if(viewAmount !== 0){
        const newCount = viewCount+1;
        if(newCount > viewAmount){
            await storage.destroy({
                where: {
                    endpoint_hash: query.imageId
                }
            }); 
        }
        else{
            await storage.update({ view_count: newCount }, { where: { endpoint_hash: query.imageId }});
        }
        return {
            props: {
                user: token ? await verifyToken(token) : false,
                storageItems: newCount > viewAmount ? [] : storageItems,
                encrypted: encrypted
            }
        }
    }
    return {
        props: {
            user: token ? await verifyToken(token) : false,
            storageItems: storageItems,
            encrypted: encrypted,
            viewAmount: viewAmount,
            expiry: expiry,
            note: note
        }
    }    
};

class ImageViewer extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            note: props.note,
            expired: false,
        }
        this.passwordPromptComponent = React.createRef();
        this.noteComponent = React.createRef();
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
        else{
            this.startTimer();
        }
    }

    startTimer(){
        if(this.props.expiry !== 0){
            setTimeout(this.selfDestruct.bind(this), this.props.expiry*1000);
        }
    }

    selfDestruct(){
        this.setState({
            expired: true
        })
    }

    reopenEncryptionModal(){
        this.setState({
            note: this.props.note
        });
        this.passwordPromptComponent.current.handleErrorPopUp('Your decryption password was incorrect, please enter the right password to view the content.')
        this.passwordPromptComponent.current.setState({
            showPrompt: true,
        });

    }

    updateEncryptionPassword(password){
        for(let storageItem of this.props.storageItems){
            this[`${storageItem.bucketKey}_ref`].current.decrypt(password);
        }
        if(this.props.note !== ''){
            this.setState({
                note: decryptString(this.state.note, password)
            });
        }
    }

    viewNote(){
        this.noteComponent.current.openPrompt();
        this.noteComponent.current.setContent(this.state.note);
    }    

    render(){
        const images = this.props.storageItems.map((storageItem) => {
            return (
                <FileShowcaser 
                    ref={this[`${storageItem.bucketKey}_ref`]}
                    url={`/api/view/${storageItem.bucketKey}`} 
                    reopenEncryptionModal={this.reopenEncryptionModal.bind(this)}
                    encrypted={storageItem.encrypted} 
                    mimetype={storageItem.mimetype}
                />
            );
        });
        if(this.state.expired){
            return (
                <>
                    <Layout user={this.props.user}>
                        <div className='container text-center d-flex justify-content-center' id='image-404-text'>
                            <h2>This image was set on a timer</h2>
                        </div>
                        <div className='container text-center d-flex justify-content-center' id='image-404-hint'>
                            <h6>Gone. Yep, it is gone.</h6>
                        </div>
                    </Layout>
                </>
            )
        }

        

        return (
            <>
                <Head>
                    <meta name="description" content="BluePrnt is a free, clean, easy to use image host" />
                    <meta name="keywords" content={`blueprnt, GIF capture, imagehost, screen capture, screenshot app, visual bookmark tool, screen GIF`} />
                    <title>View Content | BluePrnt</title>
                    <meta property="og:title" content="Untitled Album"/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:url" content="/"/>
                    <meta property="og:image" content={this.props.storageItems[0] && this.props.viewAmount === 0 && this.props.expiry === 0 ? `/api/view/${this.props.storageItems[0].bucketKey}` : `/logo.png`}/>
                    <meta name="twitter:card" content="summary_large_image"/>
                </Head>
                <PasswordPrompt 
                    header='Enter the encryption password' 
                    updateEncryptionPassword={this.updateEncryptionPassword.bind(this)} 
                    ref={this.passwordPromptComponent} 
                />
                <NotePrompt 
                    header={this.props.encrypted ? 'Encrypted Note': 'View Note'} 
                    ref={this.noteComponent} 
                    disabled={true}
                />
                <Layout user={this.props.user}>
                {this.state.note !== '' ? (
                    <div className='container text-center d-flex justify-content-center'>
                        <a href='#' id={styles['view-note']} onClick={this.viewNote.bind(this)}>View Note</a>
                    </div>
                ) : (null)}
                    
                    {this.props.storageItems.length === 0 ? (
                    <>
                        <div className='container text-center d-flex justify-content-center' id={styles['image-404-text']}>
                            <h2>No images here</h2>
                        </div>
                        <div className='container text-center d-flex justify-content-center' id={styles['image-404-hint']}>
                            <h6>You may have visited the wrong link or this link expired and has been removed from our systems.</h6>
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