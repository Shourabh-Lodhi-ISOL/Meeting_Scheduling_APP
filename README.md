In the project index.js is the main file contaning the node.js API, index1.js, index2.js and index2.html are made just for testing puropse. To run the application on your local system first setup a google cloud project then create crdentials for web application. While creating the credentials for web application in the Authorized JavaScript origins put "http://localhost:3000" and in redirect URIs put "http://localhost:3000/oauth2callback" after creating the credentials for web application download the redentials file and name it as credentails.json. Put the credentials .json file in the root of this project. Make sure to create the credentials for web application not any other type.
