const axios = require('axios');

export default async function getIPDetails(ip){
    try{
        const queryReq = await axios.post('https://ip.roanj.com/api/query-ip', {
            ip: ip,
            scraper: 'iphostinfo.com'
        });
        const details = queryReq.data.ipDetails;
        return `${details[0].City}, ${details[0].Country}`;
    }
    catch(e){
        console.log(e);
        return 'N/A';
    }
}