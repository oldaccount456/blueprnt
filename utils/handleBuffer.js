const {Duplex} = require('stream');

export default function bufferToStream (myBuffer){
    let tmp = new Duplex();
    tmp.push(myBuffer);
    tmp.push(null);
    return tmp;
}
