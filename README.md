# BluePrnt 


## Information

- This is an image host built with NextJS which utilizes Vercel and many other technologies with the aim to be ran completely serverless and for free.  

- Technologies involve using: AWS S3 buckets for storage, AWS RDS for hosting a relational database and AWS SES for sending out emails for I.e. account recovery.

- This project can be ran for free under Vercel and using AWS' free tier for services such as RDS, S3 etc. They obviously come with limitations such as 5GB max storage on S3 buckets for example. 

- You can also test or use the production version of this code: https://blueprnt.net.


## Features

- Lets you drag and drop as many images as you want and automatically uploads them to an S3 bucket that is configured with the project.

- After uploading, it will automatically redirect you to the link containing your images displayed in order. 

- Includes a registration, login system and panel system where you can manage your account.

- You can also view a gallery of your past uploaded images on the account panel.

- Account system lets you generate an API key so you can configure ShareX or a screenshot client to upload images to your account specifically.

- Client side encryption which lets you securely encrypt and decrypt your files. Since all the encryption & decryption functionality and passwords set are all done on the client-side/browser, this means that no one except *you* and whoever you share the password with can view the files. The password should only be known to you or the person intended to view the file.

- Select a number of times an upload can viewed before being deleted

## Encryption-based upload in detail 

- No file read-able data or encryption passwords are sent to the server and all encryption & decryption processes take place on the client/browser only.

-  The encryption method utilizes NodeJS's crypto module and takes a buffer and a password and returns an encrypted version of the buffer, which is then sent as a file to the server. The server administrator receiving this (Vercel, AWS S3 or the site owner) would not be able to view or do anything with this buffer, as it was encrypted already before being sent to the server.

- The decryption process will take the encrypted buffer of the file sent from the server and will take a password given by the user. It is technically impossible to view this file without the correct password. The password is then used in the decryption process, which then returns a buffer that is converted to a base64 string and then the string is used to attempt to render an image, audio or video on the page based on the file-type. If the file fails to load, then the decrypted buffer was not a valid file. It could only mean that the wrong password was given. Upon file loading failure, a function is auto-called to prompt the user to enter the correct password.

- This means that anything you upload with the encryption feature enabled, cannot be viewed by any third party which includes the server Administrator running the project, Vercel, AWS etc.

## Plans

- Creating a custom screenshot client for Windows, MacOS and Linux with electron that auto uploads images and stores the link in your clipboard.

- Creating a custom mobile app that auto uploads and generates a link from screenshot events.
