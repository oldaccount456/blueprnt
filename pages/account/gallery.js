import Layout from '@/components/Layout';
import Gallery from '@/components/Gallery';

import {checkToken} from '@/lib/authentication';
import {storage, account, bucketObject} from '@/lib/database';

export async function getServerSideProps({ req, res }){
    const authHeader = req.headers['cookie']
    const token = authHeader && authHeader.split('token=')[1];
    if (token == null){
        return {
            redirect: {
                destination: '/account/login',
                permanent: false,
            },
        }
    }
    try{
        const {username} = await checkToken(token);
        const user = await account.findOne({where: {
            username: username
        }});
        if(!user){
            return {
                redirect: {
                    destination: '/account/logout',
                    permanent: false,
                },
            }
        }

        const allStorageLinks = await storage.findAll({
            include: [bucketObject],
            where: {
                account_id: user.id
            }
        });

        const galleryItems = allStorageLinks.map((storage) => ({
            'preview': {
                'bucketKey': storage.bucket_objects.length > 0 ? storage.bucket_objects[0].bucket_key : null, 
                'mimetype': storage.bucket_objects.length > 0 ? storage.bucket_objects[0].mimetype : null,
            },
            'endpointHash': storage.endpoint_hash,
            'encrypted': storage.encrypted,
           
        }));

        return {
            props: {
                user: username,
                galleryItems: galleryItems.reverse(),
            }
        }
    }
    catch(e){
        console.log(e)
        return {
            redirect: {
                destination: '/account/login',
                permanent: false,
            },
        }
    }
};


export default function GalleryPage(props){
    return (
       <>
            <Layout user={props.user}>
                {props.galleryItems.length === 0 ? (
                     <>
                     <div className='container text-center d-flex justify-content-center' id='image-404-text'>
                         <h2>You currently have no images in your gallery</h2>
                     </div>
                     <div className='container text-center d-flex justify-content-center' id='image-404-hint'>
                         <h6>Head <a href='/'>here</a> to start uploading</h6>
                     </div>
                 </>
                ): (<Gallery galleryItems={props.galleryItems}/>)}
            </Layout>
        </>
    )
}
