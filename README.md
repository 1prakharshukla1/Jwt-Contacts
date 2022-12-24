# Contact App

## Getting started

These instructions will give you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

You should have NodeJS installed in your PC. You can check if NodeJS is installed on your PC by using the command
```
node --version
```

### Installing

1. Clone the repositry on your PC 
2. Once the repositry is cloned, open git bash in it and run
```
npm install
```
This will install all the dependencies required for the project.

3. Now go to MongoDB [MongoDB.com](http://mongodb.com/). Once you are signed in, you'll get an open to make a new cluster. For free tier, you can have only 1 cluster per email ID.
Once you have made a cluster, click on connect *Connect your Application*. It will open a box, copy the connection string.
4. Now paste this string in default.json file present inside the config folder.
```
{
    "mongoURI":"<Application String />"
}
```
Replace <password> present in the Application String with the password for your user. 

5. Once you have done this, you'll be ready to run the project. Presently, the project is running on port 3000. At some point if you decide to change the port, make sure 
to change it in room.js file present in public/js directory

## Authors
- **Prakhar Shukla**

