# fragments

This is a repo for the cloud computing course (CCP555)

# NPM Scripts

npm run lint - Runs ESlint to ensure code quality.\
npm start - Start application using Node.js and is used to just run server normally.\
npm run dev - Run server through nodemon which will watch the src/\*\* folder for any changes and restarts when server is updated. The log level is set to debug on this.\
npm run debug - This is the same as dev but also starts node inspector on port 9229 so you can attach a debugger. The log level is set to debug on this.

# Environment Variables

LOG_LEVEL: Controls the information of pino logs\
Default is info and debug gives more detailed information

# Testing

-You can use localhost:8080 for local testing\
-Curl commands:\
-curl localhost:8080\
-curl.exe localhost:8080 - Windows Powershell\
-curl -s http://localhost:8080 | jq - Pretty print format with jq piping so info looks nicer.\
-s option silences the usual output to CURL, only sending the response from the server to jq.\
-i includes all http headers in curl response
