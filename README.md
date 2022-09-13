# BluePrnt


## Information

- This is an image host built with NextJS which utilizes Vercel and many other technologies with the aim to be ran completely serverless and for free.  

- Technologies involve using: AWS S3 buckets for storage, AWS RDS for hosting a relational database and AWS SES for sending out emails for I.e. account recovery.

- This project can be ran for free under Vercel and using Amazon's free tier for these services. They obviously come with limitations such as 5GB max storage on S3 buckets for example.  

- This project is still a WIP and is in its very early stages. 

## Features

- Lets you drag and drop as many images as you want and automatically uploads them to an S3 bucket that is configured with the project.

- After uploading, it will automatically redirect you to the link containing your images displayed in order. 

- Includes a registration, login system and panel system where you can manage your account.

- You can also view a gallery of your past uploaded images on the account panel.

- Account system lets you generate an API key so you can configure ShareX or a screenshot client to upload images to your account specifically.

## Plans

- Creating an option to completely encrypt & decrypt your uploads so that only you can access it via a password and so that an administrator cannot view your images through AWS at all (currently undergoing, reference to encryption methods can be found here: https://github.com/roandevs/crypto-express-fileupload).

- Creating an option for one time view (snapchat like) type of image uploads.

- Creating a custom screenshot client for Windows, MacOS and Linux with electron that auto uploads images and stores the link in your clipboard.

- Creating a custom mobile app that auto uploads and generates a link from screenshot events.
