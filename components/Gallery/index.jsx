import {
    Table,
} from 'react-bootstrap';

import FileShowcaser from '@/components/FileShowcaser';
import getPaginatedResult from '@/utils/paginateResult';

export default function Gallery(props){
    const paginatedResults = getPaginatedResult(props.galleryItems, 3);
    let formattedSearchedItems = [];
    for(const row in paginatedResults){
        const rowOfItems = paginatedResults[row];
        formattedSearchedItems.push(
            <tr>
                {rowOfItems.map((file) => (
                    <td>
                        <FileShowcaser url={`/api/view/${file.preview.bucketKey}`} mimetype={file.preview.mimetype}/>
                        <div className='container text-center d-flex justify-content-center'>
                            <a href={`/${file.endpointHash}`}>View</a>
                        </div>
                    
                    </td>
                ))}
            </tr>  
        )
    }
    return (
        <Table bordered>
            <tbody>
                {formattedSearchedItems}
            </tbody>
        </Table>
    )
}

