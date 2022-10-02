const fs = require('fs');
const path = require('path');

export default async function getEmailContent(template_name){
    let emailTemplate = await fs.promises.readFile(path.join(process.cwd(), `/utils/templates/${template_name}`), 'utf8')
    return emailTemplate.toString();
}

