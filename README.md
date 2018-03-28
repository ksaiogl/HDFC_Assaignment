# HDFC-Assaignment

As a part of this assaignment i have implemented backend web service to manage and store google places api data on a user and location level and deployed it on cloud.

I have implemented User management (Login,Registration,Logout Api's).Authenticated all the Remaining Api's for session using MiddleWare function.

Developed Apis for retreving location level useful places like banks, ATM's, hospitals, airports etc

Stored the location searches user made to get form analytics out that data

Developed apis for getting anayltics about user searches and the places he viewed

1) Register: http://18.219.109.26:8083/user/api/v1.0/register (POST)
Input: { 
    "userName" : "ksaioglll", 
    "password" : "123456", 
    "gender" : "Male", 
    "firstName" : "Sai", 
    "lastName" : "Rohith",
    "emailId":"ksaiogl55@gmail.com",
    "mobileNumber": "8549998517"
}

2) Login: http://18.219.109.26:8083/user/api/v1.0/login (POST)
 Input: {
    "userName":"ksaiogl5",
    "password":"123456"
  }
3) Logout: http://18.219.109.26:8083/user/api/v1.0/logout (GET)
4) placeSearch:  http://18.219.109.26:8083/user/api/v1.0/placeSearch?quertText=HSR Layout&type=gym
   takes queryText(eg: HSR Layout) and type(eg: gym,hotel) as input and lists gyms around HSR Layout
   type field optional,if not provided lists all places around input location,i.e query text
   storing this api call place search as user searched places for analytics
   
4) getPlaceDetails: http://18.219.109.26:8083/user/api/v1.0/getPlaceDetails?placeId=ChIJEWxy9HgWrjsR0mL-LEDc-7w (GET)
   takes placeId and retreives details of that place
   storing this api call place data as user viewed places for analytics

5) getSearchedPlaces:http://18.219.109.26:8083/analytics/api/v1.0/getSearchedPlaces?fromDate=2018-03-26&toDate=2018-03-30 (GET)
 list the places user searched with date filters(optional input fields) 
6) getViewedPlaces : http://18.219.109.26:8083/analytics/api/v1.0/getViewedPlaces?fromDate=2018-03-26&toDate=2018-03-30 (GET)
 list the places user viewed with date filters(optional input fields)
 
 - Deployed this application on AWS EC2 servers
 - Storing User Session on Redis (Mem-Cache)
 - Used Mongo database For stroing data on backend
 - Currently Deployed app on EC2 as pm2 cluster for better avalibility
 - Used log4js for logging all the input,error,debug and info messages(this npm creates log files and logs messafes to those files)
 - Using Express middleware for authenaticating apis for session
 - followed modular architectue by dividing this app into user and analytics sub modules
 - created indexes on Db for faster and efficient queries
 - used ES6 many features like promises,arrow functions
 - Made code generic in such a wat that all the configs (mongo,hostdetails,port to run on,logger config) will fetched based on environment running
 
 Mongo Url:
 
 Mongo DB USER collection Schema
 
 { 
    "_id" : ObjectId("5aba7e1b51e74f0d136c01db"), 
    "userId" : NumberInt(2), 
    "userName" : "ksaiogl5", 
    "password" : "e10adc3949ba59abbe56e057f20f883e", 
    "firstName" : "Sai", 
    "lastName" : "Rohith", 
    "gender" : "Male", 
    "emailId" : "ksaiogll@gmailll5.com", 
    "mobileNumber" : "8549998515", 
    "searchedPlaces" : [
        {
            "place" : "Banglore", 
            "timeStamp" : ISODate("2018-03-27T17:25:16.708+0000")
        }
    ], 
    "viewedPlaces" : [
        {
            "placeName" : "Abc Consultants Private Limited", 
            "placeId" : "ChIJEWxy9HgWrjsR0mL-LEDc-7w", 
            "timeStamp" : ISODate("2018-03-27T17:25:35.206+0000")
        }
    ]
}

Indexes Created: 

- db.client.createIndex({"userId" : 1},{unique:1}) - to ensure userId is unique and makes queries faster which are finding by UserId

- db.client.createIndex({"userName" : 1,"password":1}) - Compound Index - will be used in login Api to match username and password  

counters - Have another collection called counters - to store the userId counter,everytime  new user is registered the counter is incremented and assaigned as userId.

 Mongo DB Counters collection Schema
{ 
    "_id" : "userId", 
    "seq" : NumberInt(2)
}

 
 installation steps
 1) clone the Repo
 2) move into apps directory and do npm install
 3) start application using command 
      node ./bin/www loc (env is last argument in this command,can be given as loc/dev/stg/prd)
 4) Application will be running on port 8083 (Changes based on env given) 
 5) Make Sure redis is running on port 6379
