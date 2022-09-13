import FileShowcaser from '@/components/FileShowcaser';
import Layout from '@/components/Layout';

import {storage, bucketObject} from '@/lib/database';
import authenticateUser from '@/lib/authentication';

import React from "react";
import { withRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps({ req, res, query }){
    const authHeader = req.headers['cookie']
    const token = authHeader && authHeader.split('token=')[1];
    const checkToken = async (token) => {
        try{
            const {username} = await authenticateUser(token)
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
        return bucketKeys ? bucketKeys.bucket_objects : [];
    }
    const keys = await getBucketKeys();
    const buckeyKeys = keys.map((key) => ({
        'bucketKey': key.bucket_key,
        'mimetype': key.mimetype,
    }))
    return {
        props: {
            user: token ? await checkToken(token) : false,
            bucketKeys: buckeyKeys
        }
    }

};

class ImageViewer extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        const images = this.props.bucketKeys.map((key) => {
            return (
                <FileShowcaser url={`/api/view/${key.bucketKey}`} mimetype={key.mimetype}/>
            )
        });

        return (
            <>
                <Head>
                    <meta name="description" content="BluePrnt is a free, clean, easy to use image host" />
                    <meta name="keywords" content={`blueprnt, GIF capture, imagehost, screen capture, screenshot app, visual bookmark tool, screen GIF`} />
                    <title>View Image | BluePrnt</title>
                    <meta property="og:title" content="Untitled Album"/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:url" content="/"/>
                    <meta property="og:image" content={this.props.bucketKeys[0] ? `/api/view/${this.props.bucketKeys[0].bucketKey}` : `/logo.png`}/>
                    <meta name="twitter:card" content="summary_large_image"/>
                </Head>
                <Layout user={this.props.user}>
                    {this.props.bucketKeys.length === 0 ? (
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