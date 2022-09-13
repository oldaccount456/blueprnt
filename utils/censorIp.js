export default function censorIp(ip){
    const ipv4Arr = ip.split('.');
    const ipv6Arr = ip.split(':');

    let censoredIp = '';
    if(ipv4Arr.length > 1){ /* ipv4 address */
        for(let char in ipv4Arr){
            if(Number(char) === 0){
                censoredIp+=`${ipv4Arr[char]}.`
            }

            else if(Number(char) === ipv4Arr.length-1){
                censoredIp+=`${ipv4Arr[char]}`
            }
            else{
                censoredIp+='**.'
            }
        }
    }
    else if(ipv6Arr.length > 1){ /* ipv6 address */
        for(let char in ipv6Arr){
            if(Number(char) === 0){
                censoredIp+=`${ipv6Arr[char]}:`
            }

            else if(Number(char) === ipv6Arr.length-1){
                censoredIp+=ipv6Arr[char]
            }
            else{
                censoredIp+='****:'
            }
        }
    }
    else{
        return 'N/A'
    }
    return censoredIp === '' ? 'N/A' : censoredIp;
}