export default function getPaginatedResult(items, counter){
    let paginatedResults = {}
    let currentCounter = 0;
    let paginationLimit = currentCounter + counter;
    let page = 1;
    for(let item of items){
        if(currentCounter === 0){
            paginatedResults[page] = [];
            paginatedResults[page].push(item);
        }
        else if(currentCounter === paginationLimit){
            page+=1
            paginationLimit = currentCounter + counter;
            paginatedResults[page] = [];
            paginatedResults[page].push(item);
        }
        else{
            paginatedResults[page].push(item);
        }
        currentCounter+=1;
    }
    return paginatedResults;
}