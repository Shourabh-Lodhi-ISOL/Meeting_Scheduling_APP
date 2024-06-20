const {
  default: knex
} = require('knex');
const {
  connection
} = require('./common/db');
const {
  USER,
  MEETING,
  ADMIN,
  PARTICIPANTS,
  MEETING_ACTIVITY_LOG,
  MEETING_CALENDAR,
  MEETING_BLOCK_TIME,
  USER_CATEGORY

} = require("./common/tableName");
const {
  accessEmailTemplate,
  timeSlotEmailTemplate,
  meetingConfirmationEmailTemplate,
  meetingFailedEmailTemplate

} = require("./common/emailTemplate");
require('dotenv').config();

const {
  createToken,
  verifyToken
} = require('./common/jwt');

const md5 = require('md5');
const path =require("path");
const { google } = require('googleapis');
const moment=require("moment");
const momentTZ = require('moment-timezone');
const { request } = require('http');

const fs = require('fs').promises;
const passport = require("passport");
const { Strategy: MicrosoftStrategy } = require("passport-microsoft");
const graph = require("@microsoft/microsoft-graph-client");
const axios = require("axios");
require('isomorphic-fetch');

// const fetch = require("node-fetch").default;
// const axios = require("axios");


// PASSPORT SETUP ---START---
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
// PASSPORT SETUP ---END---

// OUTLOOK CREDENTIALS ---START---
const clientID = "3ec6c363-e8f7-4460-bc3d-5bb3bc3629ac";
const clientSecret = "O2z8Q~AMO7ek8zQTlz-golvNn~NksdhujeW4Yajm";
const tenantID = "f8cdef31-a31e-4b4a-93e4-5f571e91255a";
// OUTLOOK CREDENTIALS ---END---


// CREATE THE PASSPORT OBJECT INSTANCE ---START---

// CREATE THE PASSPORT OBJECT INSTANCE ---START---

module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
        message: 'Go Serverless v3.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};


async function adminLogin(data) {
  const knex = require('knex')(connection);
  console.log("connection established new");

  const result = await knex.select('admin_id','name','email','last_updated','created').from(ADMIN).where('email', data.email).andWhere('password', md5(data.password));

  if (result.length > 0) {
    const payload = {
      userId: result[0]["admin_id"]
    }; 
    const token = createToken(payload);
    const refreshToken = createToken(payload, "refresh", '90d');
    console.log("token is here");
    console.log(token);
    result[0]["token"] = token;
    result[0]["refreshtoken"] = refreshToken;
    let returnData = {
      body: JSON.stringify({
        "message": "Login Successfull.",
        "code": 200,
        "data": result[0]
      }),
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "content-type": "text/plain"
      },
      statusCode: 200
    };
    await knex.destroy();
    return returnData;

  } else {
    let returnData = {
      body: JSON.stringify({
        "message": "Login Failed.",
        "code": 404,
        "data": []
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "content-type": "text/plain",
        message: "Email Not found."
      },
      statusCode: 200
    };
    await knex.destroy();
    return returnData;
  }
}
async function adminLoginTest(data) {
  console.log(data);

  let blockData=await getBlockDataForMeeting(12);
  let deleteResponse=await deleteBlockTimeSlot(blockData)
  
  console.log(blockData);
  console.log("block data called");
  console.log(deleteResponse)
  return false;


  await authorize(data.email);
  return false;
  await outh2CallBackTest("4/0AeaYSHCPuEdtY120ZmE2ew9SS3VpEJfnFqQcIAErDPrqSegeFbc5-YatQV2YEv2c7gwB9w")
  return false;
  return false;
let bodydata={"startTime":"08:00","endTime":"08:30","date":"09/04/2024","meetingId":20,"status":"2"}
let failed={"meetingId":20,"status":"4"}
let partial={
  startTime: '11:00',
  endTime: '12:00',
  date: '15/04/2024',
  sendEmail: [ { email: 'llita6005@gmail.com', user_id: 5 } ],
  meetingId: 58,
  status: '1'
}
let bodydata1={"startTime":"08:00","endTime":"08:30","date":"09/04/2024","meetingId":20,"status":"1",sendEmail:[{email:"nickj7602@gmail.com",user_id:4},{email:"llita6005@gmail.com",user_id:5}]}
  let meetingAfterAddHandling=await handleMeetingStatus(partial);
return false;
  let mmeetingObjectNew1=await sendTimeSlotEmail(1,1,1);
  console.log(mmeetingObjectNew1)
  return false;
  let meetingObjectNew=await getSingleMeetingData(data.email);
  console.log("meetingObjectNew");
  console.log(meetingObjectNew);
  // return false;

  let meetingObject={
    "meeting_id":6,
    "meeting_title":"Navi 04",
    "meeting_description":"Weekly team meeting to discuss project progress",
    "meeting_location":"Conference Room A",
    "meeting_duration":15,
    "meeting_timing":1,
    "start_date":"2024-04-01",
    "end_date":"2024-04-01",
    "start_time":"",
    "end_time":"",
    "is_reminder":"",
    "meeting_status":1,
    "scheduled_date":"2024-02-29T18:30:00.000Z",
    "scheduled_start_time":"15:30:00",
    "scheduled_end_time":"16:30:00",
    "last_updated":"2024-03-26T02:25:52.000Z",
    "created":"2024-03-26T02:25:52.000Z",
    "participants":[
       {
          "meeting_participant_id":"11",
          "meeting_id":"6",
          "user_id":"1",
          "is_optional":0,
          "invite_status":"1",
          "name":"John Doe",
          "email":"smithtear21@gmail.com"
       },
        {
          "meeting_participant_id":"11",
          "meeting_id":"6",
          "user_id":"1",
          "is_optional":0,
          "invite_status":"1",
          "name":"John Doe",
          "email":"shourabh.lodhi@isol.co.in"
       }
    ]
 }


  await getTimeSlots(meetingObjectNew[0]);

  return false;
   

  await sendEmail();
  // await updateMeetingDetails(1,{"meeting_status":25,"scheduled_date":"2024-03-30"}) 
  const knex = require('knex')(connection);
  const https = require('https');
  console.log("connection established new");

  const result = await knex.select('admin_id','name','email','last_updated','created').from(ADMIN).where('email', data.email).andWhere('password', md5(data.password));
  console.log("result output");
  console.log(result)
  const options = {
    hostname: 'reqres.in',
    path: '/api/unknown/2',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received
      res.on('end', () => {
        console.log(data); // Print the response data
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    });

    // Handle errors
    req.on('error', (error) => {
      console.error('Error fetching data:', error);
      reject({
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' })
      });
    });

    // End the request
    req.end();
  });
  if (result.length > 0) {
    const payload = {
      userId: result[0]["admin_id"]
    }; 
    const token = createToken(payload);
    const refreshToken = createToken(payload, "refresh", '90d');
    console.log("token is here");
    console.log(token);
    result[0]["token"] = token;
    result[0]["refreshtoken"] = refreshToken;
    let returnData = {
      body: JSON.stringify({
        "message": "Login Successfull.",
        "code": 200,
        "data": result[0]
      }),
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "content-type": "text/plain"
      },
      statusCode: 200
    };
    await knex.destroy();
    return returnData;

  } else {
    let returnData = {
      body: JSON.stringify({
        "message": "Login Failed.",
        "code": 404,
        "data": []
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "content-type": "text/plain",
        message: "Email Not found."
      },
      statusCode: 200
    };
    await knex.destroy();
    return returnData;
  }
}
async function getUsers(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
  const query = knex.select(
    USER + '.user_id',
    USER + '.name',
    USER + '.email',
    USER + '.is_verified',
    USER + '.access_status',
    USER + '.user_category_id',
    USER_CATEGORY+".category_name",

  )
  .from(USER)
  .leftJoin(USER_CATEGORY, USER+'.user_category_id', USER_CATEGORY+'.user_category_id')

  .orderBy(USER + '.user_id', 'desc');

// Check if the refresh_token flag is present in the request
if (requestBody.refresh_token) {
  // query.where(USER + '.refresh_token', 1);
  query.where(USER + '.access_status', 3);
}

const result = await query;
if (result.length > 0) {
    returnData= {
        body: JSON.stringify({
          "message": "Success .",
          "code": 200,
          "data": result
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };

    } else {
      returnData = {
        body: JSON.stringify({
          "message": "You seem to be no longer registered in the system, please contact system administrator and try again.",
          "code": 401,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      }
    }
   
    await knex.destroy();
    return returnData;
}
async function getCategories(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
  const query = knex.select(USER_CATEGORY + '.*')
  .from(USER_CATEGORY)
  .orderBy(USER_CATEGORY + '.user_category_id', 'desc');



const result = await query;
if (result.length > 0) {
    returnData= {
        body: JSON.stringify({
          "message": "Success .",
          "code": 200,
          "data": result
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };

    } else {
      returnData = {
        body: JSON.stringify({
          "message": "No data found",
          "code": 200,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      }
    }
   
    await knex.destroy();
    return returnData;
}
async function addUser(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
  const result = await knex.select(USER + '.*')
    .from(USER)
    .where("email",requestBody.email);
  if (result.length > 0) {
    returnData= {
        body: JSON.stringify({
          "message": "Email is already registered in system .",
          "code": 401,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };
      await knex.destroy();
      return returnData;

    } else {
     
        let userObject={
          name:requestBody.name,
          email:requestBody.email,
          user_category_id:requestBody.user_category_id,
          is_verified:1,
          last_updated:await getDate(),
          created:await getDate()
      }
      try {
  
        let userInsert=await knex(USER).insert(userObject);
        console.log("userInsert")
        console.log(userInsert)
        if(userInsert){
          let returnData= {
          
            body: JSON.stringify({ "message": "User added successfully.", "code": 200, "data": [] }),
          headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "content-type":"text/plain"
          }, statusCode: 200
        };
        await knex.destroy();
            return returnData;
          }
          else{
            let returnData= {
              body: JSON.stringify({ "message": "Something went wrong.", "code": 404, "data": [] }),
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "content-type":"text/plain",
                message: "Something went wrong."
              }, statusCode: 200
            };
            await knex.destroy();
            return returnData;
          }
      } catch (error) {
        console.log(error)
      }
    }
}
async function updateUser(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
  const result = await knex.select(USER + '.*')
    .from(USER)
    .where("email",requestBody.email);
  if (result.length > 0) {
    returnData= {
        body: JSON.stringify({
          "message": "Email is already registered in system .",
          "code": 401,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };
      await knex.destroy();
      return returnData;

    } else {
     
        let userObject={
          name:requestBody.name,
          email:requestBody.email,
          is_verified:1,
          last_updated:await getDate(),
          created:await getDate()
      }
      try {
  
        let userInsert=await knex(USER).insert(userObject);
        console.log("userInsert")
        console.log(userInsert)
        if(userInsert){
          let returnData= {
          
            body: JSON.stringify({ "message": "User added successfully.", "code": 200, "data": [] }),
          headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "content-type":"text/plain"
          }, statusCode: 200
        };
        await knex.destroy();
            return returnData;
          }
          else{
            let returnData= {
              body: JSON.stringify({ "message": "Something went wrong.", "code": 404, "data": [] }),
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "content-type":"text/plain",
                message: "Something went wrong."
              }, statusCode: 200
            };
            await knex.destroy();
            return returnData;
          }
      } catch (error) {
        console.log(error)
      }
    }
}


async function addMeeting(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
  if (requestBody.participants) {
    let participantsData=[];
let currentDate =await getDate();
    let meetingObject={
      meeting_title:requestBody.meeting_title,
      meeting_description:requestBody.meeting_description,
      meeting_location:requestBody.meeting_location,
      meeting_duration:requestBody.meeting_duration,
      meeting_min_duration:requestBody.meeting_min_duration,
      meeting_max_duration:requestBody.meeting_max_duration,
      meeting_timing:requestBody.meeting_timing,
      start_date:requestBody.start_date,
      end_date:requestBody.end_date,
      start_time:requestBody.start_time,
      end_time:requestBody.end_time,
      last_updated:currentDate,
      created:currentDate
  }
  try {

    let meetingInsert=await knex(MEETING).insert(meetingObject);
    console.log("userInsert")
    console.log(meetingInsert)
    if(meetingInsert){
      requestBody.participants.forEach(element => {
        participantsData.push({
          meeting_id:meetingInsert[0],
          user_id:element.user_id,
          is_optional:element.is_optional,
          is_host:element.is_host,
          invite_status:1,
          last_updated:currentDate,
          created:currentDate
      });
      });
      console.log("participants data is here");
      console.log(participantsData)
      }
      if(participantsData.length>0){
         participantStatus=await knex(PARTICIPANTS).insert(participantsData);
      }

      //I will call the algo method here
      let meetingObjectNew=await getSingleMeetingData(meetingInsert[0]);
      console.log("single meeting data for algo");
      console.log(meetingObjectNew);
      let meetingScheduleResponse=await getTimeSlots(meetingObjectNew[0]);
      let meetingAfterAddHandling=await handleMeetingStatus(meetingScheduleResponse,1);
      //
      let returnData= {
      
        body: JSON.stringify({ "message": "Meeting added successfully.", "code": 200, "data": meetingScheduleResponse }),
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "content-type":"text/plain"
      }, statusCode: 200
    };
    await knex.destroy();
        return returnData;
      }
      catch(error){
        console.log(error)
      }
    }
      else{
        let returnData= {
          body: JSON.stringify({ "message": "Something went wrong.", "code": 404, "data": [] }),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "content-type":"text/plain",
            message: "Something went wrong."
          }, statusCode: 200
        };
        await knex.destroy();
        return returnData;
      }
  
  

    
}
async function  insertBlockTimeDataInDB(data){
  console.log("insertBlockTimeData called");
  console.log(data);
  const knex = require('knex')(connection);
  console.log(data);
  if (data.length>0) {
    let blockData=[];
let currentDate =await getDate();
try {

  data.forEach(element => {
        blockData.push({
          meeting_id:element.meeting_id,
          user_id:element.user_id,
          calendar_meeting_id:element.calendar_meeting_id,
          last_updated:currentDate,
          created:currentDate
      });
      });
      console.log("participants data is here");
      console.log(blockData)

      if(blockData.length>0){
         blockStatus=await knex(MEETING_CALENDAR).insert(blockData);
         await knex.destroy();
         return blockStatus;
      }

      
    await knex.destroy();
        return returnData;
      }
      catch(error){
        console.log(error)
      }
    }
      else{
        return [];
      }
  
  

    
}

async function saveCurrentSelectionForMeeting(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
  const result = await knex.select('*').from(MEETING_ACTIVITY_LOG).where('meeting_activity_log_id', requestBody.activityLogId).andWhere('user_id', requestBody.userId).andWhere('is_updated', 0);
  console.log("result output");
  console.log(result)
  if (result.length > 0) {
    console.log("coming in log yes");
    let meetingAccessLogData = await getAccessLogData(result[0]["meeting_id"], requestBody.activityLogId);
    console.log(meetingAccessLogData)
    const allAccepted = meetingAccessLogData.every(record => record.accept_status === 1);

    // Check if any record has accept_status set to 4 (rejected)
    const anyRejected = meetingAccessLogData.some(record => record.accept_status === 4);

    if (allAccepted) {
      // Execute set meeting code
      console.log("All users have accepted the meeting. Setting the meeting...");
      // Call your set meeting function here
    } else if (anyRejected) {
      // Mark the meeting as rejected
      console.log("At least one user has rejected the meeting. Marking the meeting as rejected...");
      // Call your reject meeting function here
    } else {
      // Some users have not responded or their status is different than 1 or 4
      console.log("Some users have not responded or their status is different than accepted or rejected.");
    }


    // console.log("meetingAccessLogData");
    // console.log(meetingAccessLogData);
    // return false;
    let meetingObjectNew = await getSingleMeetingData(result[0]["meeting_id"]);
    let iterationCount = meetingObjectNew[0]["iteration"];
    console.log("iterationCount" == iterationCount);
    if (iterationCount <= 4) {
      console.log(result);
      if (requestBody.status == 4 || requestBody.status == "4") {
        //Calling the reitration here
        console.log("calling the reiteration here");
        console.log(result[0]["meeting_id"]);
        let updateMeetingLogStatus = await updateMeetingLog(requestBody.activityLogId, {
          status: requestBody.status,
          is_updated: 1
        });
        await updatePreviousIterationMeetingLog(result[0]["meeting_id"]);
        let meetingObjectNew = await getSingleMeetingData(result[0]["meeting_id"]);
        console.log("single meeting data for algo");
        console.log(meetingObjectNew);
        let meetingScheduleResponse;
        console.log("deleting the existing blocks");
        let blockData = await getBlockDataForMeeting(result[0]["meeting_id"])
        let deleteResponse = await deleteBlockTimeSlot(blockData)
        if (iterationCount < 4) {

          meetingScheduleResponse = await getTimeSlots(meetingObjectNew[0]);
          let meetingAfterAddHandling = await handleMeetingStatus(meetingScheduleResponse, iterationCount + 1);
        } else {
          let scheduleJSON = {
            "meetingId": result[0]["meeting_id"],
            "status": 4,
            "message": "Reached maximum iteration count, but couldn't find a common time-slot(s) among meeting's participants."
          }
          let meetingAfterAddHandling = await handleMeetingStatus(scheduleJSON);

        }
        let returnData = {
          body: JSON.stringify({
            "message": "Thank you for your response.",
            "code": 200,
            "data": meetingScheduleResponse || []
          }),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "content-type": "text/plain",
            message: "Something went wrong."
          },
          statusCode: 200
        };
        await knex.destroy();
        return returnData;


      } else if ((requestBody.status == 1 || requestBody.status == "1")) {
        console.log("coming in accept status")
        let updateMeetingLogStatus = await updateMeetingLog(requestBody.activityLogId, {
          status: requestBody.status,
          is_updated: 1
        });
        // let meetingAfterAddHandling=await handleMeetingStatus(meetingScheduleResponse);
        async function getUTCDateTime(scheduled_date, scheduled_start_time, scheduled_end_time) {
          const scheduledDate = moment.utc(scheduled_date);

          // Parse scheduled start and end times
          const startTime = moment(scheduled_start_time, 'HH:mm:ss');
          const endTime = moment(scheduled_end_time, 'HH:mm:ss');

          // Adjust start and end times from EU to UTC (+2 hours)
          const adjustedStartTime = startTime.clone().subtract(2, 'hours');
          const adjustedEndTime = endTime.clone().subtract(2, 'hours');

          // Combine date and adjusted times
          const startDateTime = moment.utc(scheduledDate.format('YYYY-MM-DD') + 'T' + adjustedStartTime.format('HH:mm:ss') + 'Z');
          const endDateTime = moment.utc(scheduledDate.format('YYYY-MM-DD') + 'T' + adjustedEndTime.format('HH:mm:ss') + 'Z');

          // Return start and end date-times
          return {
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString()
          };
        }
        if (allAccepted) {

          let updateData = {
            meeting_status: 2
          }
          let blockData = await getBlockDataForMeeting(result[0]["meeting_id"])
          let deleteResponse = await deleteBlockTimeSlot(blockData)

          await updateMeetingDetails(result[0]["meeting_id"], updateData);
          // await notifyAdmin(result[0]["meeting_id"], 1);


          // let meetingObjectNew=await getSingleMeetingData(result[0]["meeting_id"]);

          //setting the meeting in calander
          const participantEmails = meetingObjectNew[0].participants.map(participant => participant.email);
          const calendarIds = participantEmails.flat();

          const authClients = await loadSavedCredentialsIfExist(calendarIds);

          if (!authClients || authClients.length !== calendarIds.length) {
            return res
              .status(400)
              .json({
                error: "Credentials not found for all provided calendarIds"
              });
          }
          const authArray = [];
          const userEmailArray = [];

          for (let i = 0; i < authClients.length; i++) {
            const auth = authClients[i];
            const userEmail = calendarIds[i];

            authArray.push(auth);
            userEmailArray.push(userEmail);
          }



          const startTimeString = `${getProperDate(meetingObjectNew[0]["scheduled_date"])}T${meetingObjectNew[0]["scheduled_start_time"]}.000Z`;
          const endTimeString = `${getProperDate(meetingObjectNew[0]["scheduled_date"])}T${meetingObjectNew[0]["scheduled_end_time"]}.000Z`;
          let START = moment(getProperDate(meetingObjectNew[0]["scheduled_date"])).clone()
            .hours(moment(meetingObjectNew[0]["scheduled_start_time"], "HH:mm:ss").hours())
            .minutes(moment(meetingObjectNew[0]["scheduled_start_time"], "HH:mm:ss").minutes())
            .seconds(moment(meetingObjectNew[0]["scheduled_start_time"], "HH:mm:ss").seconds())
          // .utc();
          // .tz(meetingObjectNew[0]["meeting_timeZone"]);

          let END = moment(getProperDate(meetingObjectNew[0]["scheduled_date"])).clone()
            .hours(moment(meetingObjectNew[0]["scheduled_end_time"], "HH:mm:ss").hours())
            .minutes(moment(meetingObjectNew[0]["scheduled_end_time"], "HH:mm:ss").minutes())
            .seconds(moment(meetingObjectNew[0]["scheduled_end_time"], "HH:mm:ss").seconds())
          // .utc();
          // .tz(meetingObjectNew[0]["meeting_timeZone"]);

          const STARTTIME = moment.utc(START)
          const ENDTIME = moment.utc(END)





          let newStartEnd = await getUTCDateTime(meetingObjectNew[0]["scheduled_date"], meetingObjectNew[0]["scheduled_start_time"], meetingObjectNew[0]["scheduled_end_time"])
          console.log("date after method");
          console.log(newStartEnd)
          console.log(newStartEnd.startDateTime)
          console.log(newStartEnd.endDateTime)



          console.log("START:----------")
          console.log(START)
          console.log(typeof START)
          console.log("END:----------")
          console.log("STARTTIME:----------")
          console.log(STARTTIME)
          console.log("END:----------")
          console.log(ENDTIME)
          console.log(typeof END)

          // return false;


          // return false;
          // await setMeeting(meetingObjectNew[0]["meeting_title"], meetingObjectNew[0]["meeting_location"], meetingObjectNew[0]["meeting_description"], newStartEnd.startDateTime, meetingObjectNew[0]["meeting_timeZone"], newStartEnd.endDateTime, userEmailArray, calendars, authArray)

          await setMeeting(
            meetingObjectNew[0]["meeting_title"],
            meetingObjectNew[0]["meeting_location"],
            meetingObjectNew[0]["meeting_description"],
            meetingObjectNew[0]["meeting_timeZone"],
            userEmailArray,
            authArray,
            newStartEnd.startDateTime,
            newStartEnd.endDateTime,
            meetingObjectNew[0]["participants"]
          );
        } else {
          console.log("coming in single accept thing.");
          let meetingObjectNew = await getSingleMeetingData(result[0]["meeting_id"]);
          console.log("userid==" + requestBody.userId)
          console.log(meetingObjectNew[0]["participants"]); // Check the participants array

          const participant = meetingObjectNew[0]["participants"].find(participant => participant.user_id == requestBody.userId);
          const participantEmail = participant ? participant.email : null;
          console.log("participat" + participant)
          console.log("participateEmail" + participantEmail)
          const calendarIds = [participantEmail];
          console.log("inside blocktimeuserdelete");
          console.log(calendarIds)
          const authClients = await loadSavedCredentialsIfExist(calendarIds);
          const authArray = [];

          for (let i = 0; i < authClients.length; i++) {
            const auth = authClients[i];
            authArray.push(auth);
          }
          let newStartEnd = await getUTCDateTime(meetingObjectNew[0]["scheduled_date"], meetingObjectNew[0]["scheduled_start_time"], meetingObjectNew[0]["scheduled_end_time"])

          let blockTimeDataToInsert = await blockTimeSlot(
            meetingObjectNew[0]["meeting_timeZone"],
            calendarIds,
            authArray,
            newStartEnd.startDateTime,
            newStartEnd.endDateTime,
            meetingObjectNew[0]["participants"],
            meetingObjectNew[0]
          );
          await insertBlockTimeDataInDB(blockTimeDataToInsert);


        }
        //calander setting ends
        let returnData = {
          body: JSON.stringify({
            "message": "Thank you for your response.",
            "code": 200,
            "data": []
          }),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "content-type": "text/plain",
            message: "Something went wrong."
          },
          statusCode: 200
        };
        await knex.destroy();
        return returnData;

      }

    } else {
      let updateData = {
        meeting_status: 4
      }

      await updateMeetingDetails(result[0]["meeting_id"], updateData);
      await notifyAdmin(result[0]["meeting_id"], 1);
      let returnData = {
        body: JSON.stringify({
          "message": "The meeting has reached its maximum iteration limit, making scheduling unfeasible at this time. We advise contacting the administrator for further support and guidance.",
          "code": 401,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "content-type": "text/plain",
          message: "Something went wrong."
        },
        statusCode: 200
      };
      await knex.destroy();
      return returnData;
    }



    // let updateMeetingLogStatus=updateMeetingLog(requestBody.activityLogId,{status:requestBody.status,is_updated:1});



  } else {
    let returnData = {
      body: JSON.stringify({
        "message": "Meeting status already updated by user, if you wish to make changes, please contact Admin.",
        "code": 401,
        "data": []
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "content-type": "text/plain",
        message: "Something went wrong."
      },
      statusCode: 200
    };
    await knex.destroy();
    return returnData;
  }
}

async function getMeetings(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
  const result = await knex.select(MEETING + '.*',
  PARTICIPANTS+".meeting_participant_id",
  PARTICIPANTS+".user_id",
  PARTICIPANTS+".is_optional",
  PARTICIPANTS+".invite_status",
  MEETING_BLOCK_TIME+".block_data",
  USER+".name",
  USER+".email",
  USER+".is_verified",
  MEETING_ACTIVITY_LOG+".meeting_activity_log_id",
  MEETING_ACTIVITY_LOG+".user_id AS meeting_user_id",
  MEETING_ACTIVITY_LOG+".iteration AS log_iteration",
  MEETING_ACTIVITY_LOG+".proposed_meeting_date",
  MEETING_ACTIVITY_LOG+".proposed_start_time",
  MEETING_ACTIVITY_LOG+".proposed_end_time",
  MEETING_ACTIVITY_LOG+".accept_status",
  MEETING_ACTIVITY_LOG+".is_updated",
  'meetingUser.name AS participant_name',
  'meetingUser.email AS participant_email',
  
  )
    .from(MEETING)
    .leftJoin(PARTICIPANTS, PARTICIPANTS+'.meeting_id', MEETING+'.meeting_id')
    .leftJoin(MEETING_ACTIVITY_LOG, MEETING_ACTIVITY_LOG+'.meeting_id', MEETING+'.meeting_id')
    .leftJoin(USER + ' AS meetingUser', MEETING_ACTIVITY_LOG+'.user_id', 'meetingUser.user_id')
    .leftJoin(USER, PARTICIPANTS+'.user_id', USER+'.user_id')
    .leftJoin(MEETING_BLOCK_TIME, MEETING_BLOCK_TIME+'.meeting_id', MEETING+'.meeting_id')
    .orderBy(MEETING + '.meeting_id', 'desc')
    .orderBy(MEETING_ACTIVITY_LOG + '.meeting_activity_log_id', 'desc')

    
    if(result.length>0){
      let meetingDataFinal=[];
      result.forEach((ele) => {
        console.log("below is the complete db object")
        console.log(ele)
        var obj = {
          meeting_id: ele.meeting_id ? ele.meeting_id : "",
          meeting_title: ele.meeting_title ? ele.meeting_title : "",
          meeting_description: ele.meeting_description ? ele.meeting_description : "",
          meeting_location: ele.meeting_location ? ele.meeting_location : "",
          meeting_duration: ele.meeting_duration ? ele.meeting_duration : "",
          meeting_iteration: ele.iteration ? ele.iteration : "",
          meeting_timing: ele.meeting_timing ? ele.meeting_timing : "",
          start_date: ele.start_date ? ele.start_date : "",
          end_date: ele.end_date ? ele.end_date : "",
          start_time: ele.start_time ? ele.start_time : "",
          end_time: ele.end_time ? ele.end_time : "",
          is_reminder: ele.is_reminder ? ele.is_reminder : "",
          failed_reason: ele.failed_reason ? ele.failed_reason : "",
          meeting_status: ele.meeting_status ? ele.meeting_status : "",
          scheduled_date: ele.scheduled_date ? ele.scheduled_date : "",
          scheduled_start_time: ele.scheduled_start_time ? ele.scheduled_start_time : "",
          scheduled_end_time: ele.scheduled_end_time ? ele.scheduled_end_time : "",
          block_data: ele.block_data ? ele.block_data : "",
          last_updated: ele.last_updated ? ele.last_updated : "",
          created: ele.created ? ele.created : "",
          participants: [] ,
          activity: [] 
          
        };
        var index = meetingDataFinal.findIndex((x) => x.meeting_id == ele.meeting_id);
    
        if (index == -1) {
          meetingDataFinal.push(obj);
        }
  
        index = meetingDataFinal.findIndex((x) => x.meeting_id == ele.meeting_id);
        console.log("meeting Index"+index)
       
        var participateObj = {
          meeting_participant_id: ele.meeting_participant_id ? ele.meeting_participant_id : "",
          meeting_id: ele.meeting_id ? ele.meeting_id : "",
          user_id: ele.user_id ? ele.user_id : "",
          is_optional: ele.is_optional ? ele.is_optional  : "",
          invite_status: ele.invite_status ? ele.invite_status  : "",
          name: ele.name ? ele.name : "",
          email: ele.email ? ele.email : "",
          is_verified: ele.is_verified ? ele.is_verified : "",
        };
        console.log(participateObj);
        var participateIndex = meetingDataFinal[index].participants.findIndex(
          (x) => x.meeting_participant_id == ele.meeting_participant_id
        );
        console.log("participateIndex")
        console.log(participateIndex)
    
        if (participateIndex == -1) {
          console.log("ele.participantid")
          console.log(ele.meeting_participant_id)
          if (ele.meeting_participant_id != null) {
            console.log("coming in participate push"+ele.meeting_participant_id)
            meetingDataFinal[index].participants.push(participateObj);
          }
        }

        //activity data starts
        var activityObj = {
          meeting_activity_log_id: ele.meeting_activity_log_id ? ele.meeting_activity_log_id : "",
          meeting_id: ele.meeting_id ? ele.meeting_id : "",
          user_id: ele.user_id ? ele.user_id : "",
          proposed_meeting_date: ele.proposed_meeting_date ? ele.proposed_meeting_date  : "",
          proposed_start_time: ele.proposed_start_time ? ele.proposed_start_time  : "",
          proposed_end_time: ele.proposed_end_time ? ele.proposed_end_time  : "",
          accept_status: ele.accept_status ? ele.accept_status  : "",
          name: ele.participant_name ? ele.participant_name : "",
          email: ele.participant_email ? ele.participant_email : "",
          iteration: ele.log_iteration ? ele.log_iteration : "",
          is_updated: ele.is_updated ? ele.is_updated : "",
        };
        console.log(activityObj);
        var activityIndex = meetingDataFinal[index].activity.findIndex(
          (x) => x.meeting_activity_log_id == ele.meeting_activity_log_id
        );
        console.log("participateIndex")
        console.log(activityIndex)
    
        if (activityIndex == -1) {
        
          if (ele.meeting_activity_log_id != null) {
            console.log("coming in participate push"+ele.meeting_activity_log_id)
            meetingDataFinal[index].activity.push(activityObj);
          }
        }
  
      });
  
      let returnData;
      if(meetingDataFinal){
        returnData= {
          body: JSON.stringify({ "message": "Success .", "code": 200, "data": meetingDataFinal}),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type":"text/plain"
        }, statusCode: 200
      };
  
      }
      else{
        returnData= {
          body: JSON.stringify({ "message": "You seem to be no longer registered in the system, please contact system administrator and try again.", "code": 401, "data": [] }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type":"text/plain"
        }, statusCode: 200
      }
    }
      console.log("coming data in yest")
      await knex.destroy();
      return returnData;
     
    }else{
      let returnData= {
        body: JSON.stringify({ "message": "No meetings available.", "code": 200, "data": [] }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "content-type":"text/plain",
          message: "Something went wrong."
        }, statusCode: 200
      };
      await knex.destroy();
      return returnData;
      }
   
    await knex.destroy();
    return returnData;
}

async function getSingleMeetingData(meetingId) {
  const knex = require('knex')(connection);
  console.log(meetingId);
  const result = await knex.select(MEETING + '.*',
  PARTICIPANTS+".meeting_participant_id",
  PARTICIPANTS+".user_id",
  PARTICIPANTS+".is_optional",
  PARTICIPANTS+".is_host",
  PARTICIPANTS+".invite_status",
  USER+".name",
  USER+".email",
  USER+".is_verified",
  MEETING_ACTIVITY_LOG+".meeting_activity_log_id",
  MEETING_ACTIVITY_LOG+".user_id AS meeting_user_id",
  MEETING_ACTIVITY_LOG+".iteration AS log_iteration",
  MEETING_ACTIVITY_LOG+".proposed_meeting_date",
  MEETING_ACTIVITY_LOG+".proposed_start_time",
  MEETING_ACTIVITY_LOG+".proposed_end_time",
  MEETING_ACTIVITY_LOG+".accept_status",
  MEETING_ACTIVITY_LOG+".is_updated",
  )
    .from(MEETING)
    .leftJoin(PARTICIPANTS, PARTICIPANTS+'.meeting_id', MEETING+'.meeting_id')
    .leftJoin(MEETING_ACTIVITY_LOG, MEETING_ACTIVITY_LOG+'.meeting_id', MEETING+'.meeting_id')
    .leftJoin(USER, PARTICIPANTS+'.user_id', USER+'.user_id')
    .where(MEETING+".meeting_id", meetingId)
    .orderBy(MEETING + '.meeting_id', 'desc')
    .orderBy(MEETING_ACTIVITY_LOG + '.meeting_activity_log_id', 'desc')

    // console.log(result);
    if(result.length>0){
      let meetingDataFinal=[];
      result.forEach((ele) => {
        // console.log("below is the complete db object")
        // console.log(ele)
        var obj = {
          meeting_id: ele.meeting_id ? ele.meeting_id : "",
          meeting_title: ele.meeting_title ? ele.meeting_title : "",
          meeting_description: ele.meeting_description ? ele.meeting_description : "",
          meeting_location: ele.meeting_location ? ele.meeting_location : "",
          meeting_duration: ele.meeting_duration ? ele.meeting_duration : "",
          meeting_min_duration: ele.meeting_min_duration ? ele.meeting_min_duration : "",
          meeting_max_duration: ele.meeting_max_duration ? ele.meeting_max_duration : "",
          iteration: ele.iteration ? ele.iteration : "",
          meeting_timing: ele.meeting_timing ? ele.meeting_timing : "",
          start_date: ele.start_date ? getProperDate(ele.start_date) : "",
          end_date: ele.end_date ? getProperDate(ele.end_date) : "",
          start_time: ele.start_time ? ele.start_time : "",
          end_time: ele.end_time ? ele.end_time : "",
          is_reminder: ele.is_reminder ? ele.is_reminder : "",
          meeting_status: ele.meeting_status ? ele.meeting_status : "",
          scheduled_date: ele.scheduled_date ? ele.scheduled_date : "",
          scheduled_start_time: ele.scheduled_start_time ? ele.scheduled_start_time : "",
          scheduled_end_time: ele.scheduled_end_time ? ele.scheduled_end_time : "",
          last_updated: ele.last_updated ? ele.last_updated : "",
          created: ele.created ? ele.created : "",
          meeting_timeZone:"Europe/Amsterdam",
          participants: [] ,
          activity: [] 

          
        };
        var index = meetingDataFinal.findIndex((x) => x.meeting_id == ele.meeting_id);
    
        if (index == -1) {
          meetingDataFinal.push(obj);
        }
  
        index = meetingDataFinal.findIndex((x) => x.meeting_id == ele.meeting_id);
        // console.log("meeting Index"+index)
       
        var participateObj = {
          meeting_participant_id: ele.meeting_participant_id ? ele.meeting_participant_id : "",
          meeting_id: ele.meeting_id ? ele.meeting_id : "",
          user_id: ele.user_id ? ele.user_id : "",
          is_optional: ele.is_optional ? ele.is_optional  : "",
          is_host: ele.is_host ? ele.is_host  : "",
          invite_status: ele.invite_status ? ele.invite_status  : "",
          name: ele.name ? ele.name : "",
          email: ele.email ? ele.email : "",
          is_verified: ele.is_verified ? ele.is_verified : "",
        };
        // console.log(participateObj);
        var participateIndex = meetingDataFinal[index].participants.findIndex(
          (x) => x.meeting_participant_id == ele.meeting_participant_id
        );
        // console.log("participateIndex")
        // console.log(participateIndex)
    
        if (participateIndex == -1) {
          // console.log("ele.participantid")
          // console.log(ele.meeting_participant_id)
          if (ele.meeting_participant_id != null) {
            // console.log("coming in participate push"+ele.meeting_participant_id)
            meetingDataFinal[index].participants.push(participateObj);
          }
        }


         //activity data starts
         var activityObj = {
          meeting_activity_log_id: ele.meeting_activity_log_id ? ele.meeting_activity_log_id : "",
          meeting_id: ele.meeting_id ? ele.meeting_id : "",
          user_id: ele.user_id ? ele.user_id : "",
          proposed_meeting_date: ele.proposed_meeting_date ? ele.proposed_meeting_date  : "",
          proposed_start_time: ele.proposed_start_time ? ele.proposed_start_time  : "",
          proposed_end_time: ele.proposed_end_time ? ele.proposed_end_time  : "",
          accept_status: ele.accept_status ? ele.accept_status  : "",
          name: ele.participant_name ? ele.participant_name : "",
          email: ele.participant_email ? ele.participant_email : "",
          iteration: ele.log_iteration ? ele.log_iteration : "",
          is_updated: ele.is_updated ? ele.is_updated : "",
        };
        console.log(activityObj);
        var activityIndex = meetingDataFinal[index].activity.findIndex(
          (x) => x.meeting_activity_log_id == ele.meeting_activity_log_id
        );
        console.log("participateIndex")
        console.log(activityIndex)
    
        if (activityIndex == -1) {
        
          if (ele.meeting_activity_log_id != null) {
            console.log("coming in participate push"+ele.meeting_activity_log_id)
            meetingDataFinal[index].activity.push(activityObj);
          }
        }
  
      });
  
      
      console.log("single meeting data response");
      console.log(meetingDataFinal);
      await knex.destroy();
      return meetingDataFinal;
     
    }else{
      return []
      }
   
    await knex.destroy();
    return returnData;
}

async function getAccessLogData(meetingId,activityLogId="") {
  const knex = require('knex')(connection);
  console.log(meetingId);
  const result = await knex.select(MEETING_ACTIVITY_LOG + '.*',
  )
    .from(MEETING_ACTIVITY_LOG)
    .where(MEETING_ACTIVITY_LOG+".meeting_id", meetingId)
    .andWhere(MEETING_ACTIVITY_LOG+".meeting_activity_log_id","!=", activityLogId)
    .andWhere(MEETING_ACTIVITY_LOG+".is_discarded", 0)
    
    .orderBy(MEETING_ACTIVITY_LOG + '.meeting_activity_log_id', 'asc')
    console.log(result);
    await knex.destroy();
    if(result.length>0){
      return result;
    }else{
      return []
      }
    return returnData;
}
async function getUsersAccessDataGoodle(calendarIds){
  const knex = require('knex')(connection);
  // console.log(meetingrpId);
  const result = await knex.select(USER + '.*',

  )
    .from(USER)
    .whereIn(USER + ".email", calendarIds);
    console.log(result);
    if(result.length>0){
      let userDataFinal=[];
      result.forEach((ele) => {
        console.log("below is the complete db object")
        console.log(ele)
        var obj = {
          "type": "authorized_user",
          "client_id": "923376702287-vk1qrn95vda3s6k9053n3licg2pdcl7d.apps.googleusercontent.com",
          "client_secret": "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",
          "refresh_token": ele.refresh_token,
          "user_email": ele.email
      }
      userDataFinal.push(obj);
     
  
      });
  
      
      console.log("coming data in yest")
      await knex.destroy();
      return userDataFinal;
     
    }else{
      return []
      }
   
    await knex.destroy();
    return returnData;
}
async function getUsersAccessData(calendarIds){
  const knex = require('knex')(connection);
  // console.log(meetingrpId);
  const result = await knex.select(USER + '.*',

  )
    .from(USER)
    .whereIn(USER + ".email", calendarIds);
    console.log(result);
    if(result.length>0){
      let userDataFinal=[];
      result.forEach((ele) => {
        console.log("below is the complete db object")
        console.log(ele)
        var obj = {
          "type": "authorized_user",
          "client_id": "3ec6c363-e8f7-4460-bc3d-5bb3bc3629ac",
          "client_secret": "O2z8Q~AMO7ek8zQTlz-golvNn~NksdhujeW4Yajm",
          "user_id": ele.user_id,
          "refresh_token": ele.refresh_token,
          "access_token": ele.access_token,
          "token_expires_at": ele.token_expires_at,
          "user_email": ele.email
      }
      userDataFinal.push(obj);
     
  
      });
  
      
      console.log("coming data in yest")
      await knex.destroy();
      return userDataFinal;
     
    }else{
      return []
      }
   
    await knex.destroy();
    return returnData;
}
async function getBlockDataForMeeting(meetingId){
  const knex = require('knex')(connection);
  // console.log(meetingrpId);
  const result = await knex.select(MEETING_CALENDAR + '.*',
  USER+".name",
  USER+".email"
  )
    .from(MEETING_CALENDAR)
    .leftJoin(USER, MEETING_CALENDAR+'.user_id', USER+'.user_id')
    .where(MEETING_CALENDAR + ".meeting_id", meetingId);
    console.log(result);
    if(result.length>0){
      console.log("coming data in yest")
      await knex.destroy();
      return result;
     
    }else{
      return []
      }
   
    await knex.destroy();
    return returnData;
}

async function addUser(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
  const result = await knex.select(USER + '.*')
    .from(USER)
    .where("email",requestBody.email);
  if (result.length > 0) {
    returnData= {
        body: JSON.stringify({
          "message": "Email is already registered in system .",
          "code": 401,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };
      await knex.destroy();
      return returnData;

    } else {
     
        let userObject={
          name:requestBody.name,
          email:requestBody.email,
          user_category_id:requestBody.user_category_id,
          is_verified:1,
          last_updated:await getDate(),
          created:await getDate()
      }
      try {
  
        let userInsert=await knex(USER).insert(userObject);
        console.log("userInsert")
        console.log(userInsert)
        if(userInsert){
          let userAccess=await authorize(requestBody.email);
          console.log("user Access output");
          console.log(userAccess)
          let returnData= {
          
            body: JSON.stringify({ "message": "User added successfully.", "code": 200, "data": [] }),
          headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "content-type":"text/plain"
          }, statusCode: 200
        };
        await knex.destroy();
            return returnData;
          }
          else{
            let returnData= {
              body: JSON.stringify({ "message": "Something went wrong.", "code": 404, "data": [] }),
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "content-type":"text/plain",
                message: "Something went wrong."
              }, statusCode: 200
            };
            await knex.destroy();
            return returnData;
          }
      } catch (error) {
        console.log(error)
      }
    }
}


async function sendAccessRequestEmail(requestBody) {
  const knex = require('knex')(connection);
  console.log(requestBody);
    const result = await knex.select('*').from(USER).where('user_id', requestBody.user_id);
    console.log("sendaccessEmail result");
    console.log(result)

    if (result.length > 0) {
      let emailStatus=await authorize(result[0].email);

        // let emailStatus=await sendAccessEmail(result[0]);
        if(emailStatus){
          await knex(USER).update({
            access_status: 1,
            last_updated: await getDate(),
          }).where("user_id", requestBody.user_id);
          let returnData= {
            body: JSON.stringify({ "message": "Access request sent successfully.", "code": 200, "data": [] }),
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true,
              "content-type":"text/plain",
              message: "Something went wrong."
            }, statusCode: 200
          };
          await knex.destroy();
          return returnData;
        }
       else{
          let returnData= {
            body: JSON.stringify({ "message": "Unable to send the access request at this moment, please contact Admin.", "code": 400, "data": [] }),
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true,
              "content-type":"text/plain",
              message: "Something went wrong."
            }, statusCode: 200
          };
          await knex.destroy();
          return returnData;
        }
     
       
       
    }
    else{
      let returnData= {
        body: JSON.stringify({ "message": "Unable to send the access request at this moment, please contact Admin.", "code": 400, "data": [] }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "content-type":"text/plain",
          message: "Something went wrong."
        }, statusCode: 200
      };
      await knex.destroy();
      return returnData;
      }
  
     
    
}


async function sendAccessEmail(email,accesslink){
  let username=email;
  // let accessLink="www.google.com";

  const compiledTemplate = accessEmailTemplate.replace('<%= username %>', username).replace('<%= accessLink %>', accesslink);

  const nodemailer = require('nodemailer');
  let mailTransporter =
    nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                // user: 'eldon.carty@gmail.com',
                // pass: "dxxz rgot djnh rrjm"
                user: 'ethanwick7336@gmail.com',
                pass: "mvaw dnpz tlbf xvqq"
            }
        }
    );
 
let mailDetails = {
    from: 'ethanwick7336@gmail.com',
    to: email,
    subject: 'Scheduling App: Access Request Email',
    // text: 'Node.js testing mail for GeeksforGeeks'
    html:compiledTemplate
};
 

    // Wait for nodemailer to send the email before proceeding
    await mailTransporter.sendMail(mailDetails);
  return true;
}
async function sendEmail(){
  let username="navi";
  let accessLink="www.google.com";

  const compiledTemplate = accessEmailTemplate.replace('<%= username %>', username).replace('<%= accessLink %>', accessLink);

  const nodemailer = require('nodemailer');
  let mailTransporter =
    nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                // user: 'eldon.carty@gmail.com',
                // pass: "dxxz rgot djnh rrjm"
                user: 'ethanwick7336@gmail.com',
                pass: "mvaw dnpz tlbf xvqq"
            }
        }
    );
 
let mailDetails = {
    from: 'eldon.carty@gmail.com',
    to: 'navratan.jangid@isol.co.in',
    subject: 'Test mail',
    // text: 'Node.js testing mail for GeeksforGeeks'
    html:compiledTemplate
};
 
mailTransporter
    .sendMail(mailDetails,
        function (err, data) {
            if (err) {
                console.log('Error Occurs');
                console.log(err)
            } else {
                console.log('Email sent successfully');
            }
        });


}

async function handleMeetingStatus(meetingScheduleResponse,iteration=0){
  console.log("meetingScheduleResponse")
  console.log(meetingScheduleResponse)
  console.log("iteration==",iteration)
  if(meetingScheduleResponse.status==2 || meetingScheduleResponse.status=="2"){
    //Meeting is scheduled
    let updateData={
      meeting_status:meetingScheduleResponse.status,
      scheduled_date:moment(meetingScheduleResponse.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
      scheduled_start_time:meetingScheduleResponse.startTime,
      scheduled_end_time:meetingScheduleResponse.endTime,
    }
    if(iteration>0){
      updateData["iteration"]=iteration;
    }
   await updateMeetingDetails(meetingScheduleResponse.meetingId,updateData);
   if(meetingScheduleResponse.logData){
    console.log("inserting the block data of users in db")
    await saveBlockTimeDataOfUser(meetingScheduleResponse.meetingId,meetingScheduleResponse) 
   }
   await notifyAdmin(meetingScheduleResponse.meetingId,1);


  }
  
  else if(meetingScheduleResponse.status==1 || meetingScheduleResponse.status=="1"){
    //email is sent to users for confirmation
    console.log("coming in email send part");
    let updateData={
      meeting_status:meetingScheduleResponse.status,
      scheduled_date:moment(meetingScheduleResponse.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
      scheduled_start_time:meetingScheduleResponse.startTime,
      scheduled_end_time:meetingScheduleResponse.endTime,
    }
    if(iteration>0){
      updateData["iteration"]=iteration;
    }
    const meetingString = `Meeting Date: ${meetingScheduleResponse.date} \n` +
                      `Start Time: ${meetingScheduleResponse.startTime} \n` +
                      `End Time: ${meetingScheduleResponse.endTime}`;

   await updateMeetingDetails(meetingScheduleResponse.meetingId,updateData);
   if(meetingScheduleResponse.logData){
    console.log("inserting the block data of users in db")
    await saveBlockTimeDataOfUser(meetingScheduleResponse.meetingId,meetingScheduleResponse) 
   }

   if(iteration<=4){
     for (const item of meetingScheduleResponse.sendEmail) {
      try {
        // Perform database insertion for each item
        meetingScheduleResponse.iteration=iteration;
        let activityId=await insertActivityLog(meetingScheduleResponse,item.user_id);
  
        let emailSend=await sendTimeSlotEmail(item.email,item.user_id,activityId,meetingString);
  
        console.log(`Inserted email ${activityId} for meeting ${meetingScheduleResponse.meetingId}`);
        console.log(`Email send response ${emailSend} `);
      } catch (error) {
        console.error(`Error inserting email ${item.email}:`, error);
      }
    }
   }


   

  }

  else if(meetingScheduleResponse.status==4){
    //meeting is failed
    let updateData={
      meeting_status:meetingScheduleResponse.status,
      failed_reason:meetingScheduleResponse.message,
    }
    console.log("meeting is failed in handlemeetingstatus");
    console.log(updateData)
    console.log(iteration)
    if(iteration>0){
      updateData["iteration"]=iteration;
    }
   await updateMeetingDetails(meetingScheduleResponse.meetingId,updateData);
   if(meetingScheduleResponse.logData){
    console.log("inserting the block data of users in db")
    await saveBlockTimeDataOfUser(meetingScheduleResponse.meetingId,meetingScheduleResponse) 
   }
   await notifyAdmin(meetingScheduleResponse.meetingId,2);


  }


}
async function insertActivityLog(requestBody,userId){
  const knex = require('knex')(connection);

  let currentDate =await getDate();
   let meetingObject={
     meeting_id:requestBody.meetingId,
     user_id:userId,
     proposed_meeting_date:moment(requestBody.date, "DD/MM/YYYY").format("YYYY-MM-DD"),
     proposed_start_time:requestBody.startTime,
     proposed_end_time:requestBody.endTime,
     notes:"",
     accept_status:0,
     iteration:requestBody.iteration||1,
     created:currentDate
 }
 try {

   let [insertId] =await knex(MEETING_ACTIVITY_LOG).insert(meetingObject).returning('meeting_activity_log_id');
   console.log("userInsert")
   console.log(insertId)



   await knex.destroy();
       return insertId;
     }
     catch(error){
       console.log(error)
     }
}

async function sendTimeSlotEmail(email,userId,meetingActivityId,meetingString){
  console.log("sendtimeslotEmail method called");
  console.log(email)
  console.log(userId)
  console.log(meetingActivityId)
  console.log(meetingActivityId)
  let username="";
  let accessLinkApprove=process.env.API_URL+"/saveCurrentSelectionForMeeting?activityLogId="+meetingActivityId+"&userId="+userId+"&status=1";
  let accessLinkReject=process.env.API_URL+"/saveCurrentSelectionForMeeting?activityLogId="+meetingActivityId+"&userId="+userId+"&status=4";
  // let accessLinkApprove="https://ebmrnxlpk9.execute-api.eu-central-1.amazonaws.com/dev/saveCurrentSelectionForMeeting?activityLogId="+meetingActivityId+"&userId="+userId+"&status=1";
  // let accessLinkReject="https://ebmrnxlpk9.execute-api.eu-central-1.amazonaws.com/dev/saveCurrentSelectionForMeeting?activityLogId="+meetingActivityId+"&userId="+userId+"&status=4";
try {
  const compiledTemplate = timeSlotEmailTemplate.replace('<%= username %>', username)
  .replace('<%= accessLinkApprove %>', accessLinkApprove)
  .replace('<%= meetingTime %>', meetingString)
  .replace('<%= accessLinkReject %>', accessLinkReject);

  const nodemailer = require('nodemailer');
  let mailTransporter =
    nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                // user: 'eldon.carty@gmail.com',
                // pass: "dxxz rgot djnh rrjm"
                user: 'ethanwick7336@gmail.com',
                pass: "mvaw dnpz tlbf xvqq"
            }
        }
    );
 
let mailDetails = {
    from: 'ethanwick7336@gmail.com',
    to: email,
    subject: 'Scheduling App meeting scheduled',
    // text: 'Node.js testing mail for GeeksforGeeks'
    html:compiledTemplate
};
 
// mailTransporter
//     .sendMail(mailDetails,
//         function (err, data) {
//             if (err) {
//                 console.log('Error Occurs');
//                 console.log(err)
//             } else {
//                 console.log('Email sent successfully');
//             }
//         });
     

      // Wait for nodemailer to send the email before proceeding
      await mailTransporter.sendMail(mailDetails);

  
} catch (error) {
  console.log("error in email");
  console.log(error)
}
}
async function updateMeetingDetails(meetingId,data) {
  const knex = require('knex')(connection);
  console.log(data);

  try {

    let updateObject = {
      last_updated: await getDate() // Assuming this function returns the current date
    };
    
    // Add properties to the update object only if they are present in the data object
    if (data.name) updateObject.name = data.name;
    if (data.meeting_status) updateObject.meeting_status = data.meeting_status;
    if (data.scheduled_date) updateObject.scheduled_date = data.scheduled_date;
    if (data.scheduled_start_time) updateObject.scheduled_start_time = data.scheduled_start_time;
    if (data.scheduled_end_time) updateObject.scheduled_end_time = data.scheduled_end_time;
    if (data.iteration) updateObject.iteration = data.iteration;
    if (data.failed_reason) updateObject.failed_reason = data.failed_reason;
    
    let meetingUpdate = await knex(MEETING).update(updateObject).where("meeting_id", meetingId);
        console.log("userInsert")
    console.log(meetingUpdate)
    if (meetingUpdate) {
      await knex.destroy();
      return true;
    } else {
      await knex.destroy();
      return false;
    }
  } catch (error) {
    console.log(error)
  }
}


async function updateMeetingLog(meetingActivityId,data) {
  const knex = require('knex')(connection);
  console.log(data);

  try {

    let updateObject = {
    };
    
    // Add properties to the update object only if they are present in the data object
    if (data.status) updateObject.accept_status = data.status;
    if (data.is_updated) updateObject.is_updated=1;
    
    let meetingUpdate = await knex(MEETING_ACTIVITY_LOG).update(updateObject).where("meeting_activity_log_id", meetingActivityId);
        console.log("userInsert")
    console.log(meetingUpdate)
    if (meetingUpdate) {
      await knex.destroy();
      return true;
    } else {
      await knex.destroy();
      return false;
    }
  } catch (error) {
    console.log(error)
  }
}
async function updatePreviousIterationMeetingLog(meetingId) {
  console.log("calling the update previous iteration log data");
  console.log("meetingId=="+meetingId)
  const knex = require('knex')(connection);
  // console.log(data);

  try {

    let updateObject = {
      "is_discarded":1,
      "is_updated":1
    };
    
    // Add properties to the update object only if they are present in the data object
    // if (data.status) updateObject.accept_status = data.status;
    // if (data.is_updated) updateObject.is_updated=1;
    
    let meetingUpdate = await knex(MEETING_ACTIVITY_LOG).update(updateObject).where("meeting_id", meetingId);
        console.log("userInsert")
    console.log(meetingUpdate)
    if (meetingUpdate) {
      await knex.destroy();
      return true;
    } else {
      await knex.destroy();
      return false;
    }
  } catch (error) {
    console.log(error)
  }
}
async function deleteMeetingCalendarRecordsFromDB(meetingId) {
  console.log("calling the deleteMeetingCalendarRecordsFromDB data");
  console.log("meetingId=="+meetingId)
  const knex = require('knex')(connection);
  // console.log(data);

  try {

   
    let meetingUpdate = await knex(MEETING_CALENDAR).delete().where("meeting_id", meetingId);
        console.log("userInsert")
    console.log(meetingUpdate)
    if (meetingUpdate) {
      await knex.destroy();
      return true;
    } else {
      await knex.destroy();
      return false;
    }
  } catch (error) {
    console.log(error)
  }
}
async function saveBlockTimeDataOfUser(meetingId,data) {
  console.log("calling the saveBlockTimeDataOfUser data");
  console.log("meetingId=="+meetingId)
  const knex = require('knex')(connection);
  console.log(data);

  try {
    let meetingUpdate = await knex(MEETING_BLOCK_TIME).delete().where("meeting_id", meetingId);
let blockJson={logData:data.logData,
  commonTimeSlots:data.commonTimeSlots}
    let blockDataObject={
      meeting_id:meetingId,
      block_data:blockJson,
      last_fetched_at:data.logData.generated_at,
      last_updated:await getDate(),
      created:await getDate()
  }
    let blockDataInsert=await knex(MEETING_BLOCK_TIME).insert(blockDataObject);
    console.log("userInsert")
    console.log(blockDataInsert)
        console.log("userInsert")
    console.log(blockDataInsert)
    if (blockDataInsert) {
      await knex.destroy();
      return true;
    } else {
      await knex.destroy();
      return false;
    }
  } catch (error) {
    console.log(error)
  }
}

// FUNCTION TO DELETE THE BLOCK TIME ---START---
async function deleteBlockTimeSlot(blockTimeID) {
  console.log(
    "Meeting has been successfully created so, deleteBlockTimeSlotHIT:--------------"
  );

  try {
    const participantEmails = blockTimeID.map(participant => participant.email);
    const calendarIds = participantEmails.flat();
  console.log("participantEmails");
  console.log(participantEmails);
  console.log("inside blocktimeuserdelete");
  console.log(calendarIds)
    const authClients = await loadSavedCredentialsIfExist(calendarIds);
    const authArray = [];

    for (let i = 0; i < authClients.length; i++) {
      const auth = authClients[i];
      authArray.push(auth);
    }
  
  let meetingDBId;
  let meetingID;
  let allDeletionsSuccessful = true;
  for (let i = 0; i < blockTimeID.length; i++) {
    const userEvent = blockTimeID[i];
    const organizerEmail = userEvent.email;
    meetingID = userEvent.calendar_meeting_id;
    meetingDBId = userEvent.meeting_id;
    console.log("organizerEmail: " + organizerEmail);
    console.log("meetingID: " + meetingID);

    // Find the corresponding client object in availableUsersArray
    const userClient = authArray.find(
        (user) => user.calendarId === organizerEmail
    );
    console.log("userClient:");
    console.log(userClient);

    if (userClient) {
        console.log("coming in userClient found case");

        try {
            // Delete the event from the user's calendar
            await userClient.api(`/me/events/${meetingID}`).delete();

            console.log(`Event deleted successfully for user ${organizerEmail}`);
        } catch (error) {
            console.error(`Error deleting event for user ${organizerEmail}:`, error);
            allDeletionsSuccessful = false;
        }
    } else {
        console.log(`Client not found for user ${organizerEmail}`);
        allDeletionsSuccessful = false;
    }
}

if (allDeletionsSuccessful && meetingDBId) {
    await deleteMeetingCalendarRecordsFromDB(meetingDBId);
    return true;
} else {
    return false; // Return false if any deletion operation fails or if meetingDBId is not set
}

  } catch (error) {
    console.error("Error deleting events:", error);
  }
}
// FUNCTION TO DELETE THE BLOCK TIME ---END---
var getDate = async () => {
  let timezone = 'Europe/Amsterdam';
  let date = new Date();
  date = date.toLocaleString('sv-SE', {
    timeZone: timezone,
  });
  console.log(date);
  return date;
}

function getProperDateOld(date) {
  try {
    var date = new Date(date);
    var day = date.getDate(); //Date of the month: 2 in our example
    var month = date.getMonth() + 1; //Month of the Year: 0-based index, so 1 in our example
    var year = date.getFullYear() //Year: 2013
    return (year + '-' + month + '-' + day)

  } catch (error) {
    return date
  }
}
function getProperDate(date) {
  try {
    var parsedDate = new Date(date);

    // If parsing is successful and the result is not NaN
    if (!isNaN(parsedDate)) {
      var day = parsedDate.getUTCDate();
      var month = parsedDate.getUTCMonth() + 1;
      var year = parsedDate.getUTCFullYear();
      return (year + '-' + month + '-' + day);
    }

    // If parsing fails or the result is NaN, return the original date string
    return date;
  } catch (error) {
    // Return the original date string in case of any error
    return date;
  }
}

async function getTimeSlots(meetingData){
  try {
    const jsonData = meetingData;
    const { meeting_title,
      meeting_description,
      start_date,
      end_date,
      participants,
      meeting_location,
      meeting_timeZone,
      meeting_min_duration,
      meeting_max_duration,
      meeting_duration,
      iteration
    } = meetingData;

      const meetingTimezone = meeting_timeZone

      let office_Start=moment.tz('2024-03-27T08:30:00', meetingTimezone)
      let office_End=moment.tz('2024-03-27T17:00:00', meetingTimezone)

      let start_Date_time_zone = office_Start.clone().set({
        year: moment(start_date).year(),
        month: moment(start_date).month(),
        date: moment(start_date).date()
      });

      // var start_Date_time = moment.utc(start_Date_time_zone);
      var start_Date_time = moment(start_Date_time_zone);

      // var start_Date_time = moment.tz(start_Date_time_zone, "Europe/Amsterdam");
      

      console.log("start_Date_Time")
      console.log(start_Date_time)


      let end_Date_time_zone = office_End.clone().set({
        year: moment(end_date).year(),
        month: moment(end_date).month(),
        date: moment(end_date).date()
      });
      // var end_Date_time = moment.utc(end_Date_time_zone);
      var end_Date_time = moment(end_Date_time_zone);
      // var end_Date_time = moment.tz(end_Date_time_zone,"Europe/Amsterdam");

     

      const participantEmails = participants.map(participant => participant.email);
      const calendarIds = participantEmails.flat();

    if (!calendarIds || !meeting_title ||  !start_date || !end_date) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Load saved credentials for provided calendarIds
    const authClients = await loadSavedCredentialsIfExist(calendarIds);

    if (!authClients || authClients.length !== calendarIds.length) {
      return res
        .status(400)
        .json({ error: "Credentials not found for all provided calendarIds" });
    }

    // Collect auth and userEmail values in arrays
    const authArray = [];
    const userEmailArray = [];

    for (let i = 0; i < authClients.length; i++) {
      const auth = authClients[i];
      const userEmail = calendarIds[i];

      authArray.push(auth);
      userEmailArray.push(userEmail);
    }

    const meetingLocation = meeting_location
    // const meetingDuration = meeting_duration
    let meetingDuration;
    if (meeting_duration) meetingDuration = meeting_duration;
    if (meeting_max_duration) meetingDuration = meeting_max_duration;




    const success = await scheduleMeeting(
      authArray,
      userEmailArray,
      meeting_title,
      meeting_description,
      new Date(start_Date_time),
      new Date(end_Date_time),
      meetingLocation,
      meetingDuration,
      jsonData,
      meeting_timeZone,
      meeting_min_duration,
      iteration
    );

    return success;
    // if (!success) {
    //   return { error: "Failed to schedule meetings",status:400 };
    // }

    // return { message: "Meetings scheduled successfully",status:200 };
  } catch (error) {
    console.log("this is the error in algo")
    console.error(error);
    return { message: "Something went wrong",status:400 }
  }
}

// SCOPES TO DEFINE THE ACCESS OF USERS GOOGLE CALENDAR ---START---
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];
// SCOPES TO DEFINE THE ACCESS OF USERS GOOGLE CALENDAR ---END---


// DEFINE PATH TO STORE AND LOAD AUTH USERS CREDENTIALS ---START---
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
// DEFINE PATH TO STORE AND LOAD AUTH USERS CREDENTIALS ---END---


// FUNCTION TO LOAD SAVED AUTH USERS CREDENTIALS ---START---
async function loadSavedCredentialsIfExist(calendarIds) {
  try {
    // const content = await fs.readFile(TOKEN_PATH);
    // const savedCredentials = JSON.parse(content);
    let savedCredentials=await getUsersAccessData(calendarIds)

    // Filter credentials based on provided calendarIds
    const filteredCredentials = savedCredentials.filter((cred) =>
      calendarIds.includes(cred.user_email)
    );

    if (filteredCredentials.length > 0) {
      const clients = [];
      for (const calendarId of calendarIds) {
        // Find the credentials for the current calendarId
        const credentials = filteredCredentials.find(
          (cred) => cred.user_email === calendarId
        );

        if (credentials) {
          // Log the retrieved credentials for debugging
          console.log(`Credentials found for calendar ID ${calendarId}:`);

          // const accessToken = credentials.access_token;
          const refreshToken = credentials.refresh_token;
          const accessTokenExisting = credentials.access_token;
          const expiresIn = credentials.token_expires_at;

          // Create a client using the found credentials
          console.log("calendarId loadSavedCredentialsIfExist:---------------");
          console.log(calendarId);

          // const client = graph.Client.init({
          //   authProvider: async (done) => {
          //     try {
          //       const accessToken = await refreshTokenIfNeeded(calendarId,refreshToken);
          //       // console.log("accessToken:------------")
          //       // console.log(accessToken)
          //       done(null, accessToken);
          //     } catch (error) {
          //       done(error, null);
          //     }
          //   },
          // });
          const accessToken = await refreshTokenIfNeeded(calendarId,refreshToken,accessTokenExisting,expiresIn);
          let client = graph.Client.init({
            authProvider: async (done) => {
              try {
                done(null, accessToken);
              } catch (error) {
                done(error, null);
              }
            },
          });

          client.accessToken = accessToken;
          client.calendarId = calendarId;
          
          console.log("client:----------");
          console.log(client);

          clients.push(client);

          // return clients;
        } else {
          console.log(`No credentials found for calendar ID: ${calendarId}`);
          clients.push(null); // Push null for calendar IDs with no credentials
          // return clients;
        }
      }
      return clients;
    }  else {
      console.log("No credentials found for the provided calendarIds.");
      return null;
    }
  } catch (err) {
    console.error("Error loading saved credentials:", err.message);
    throw err;
  }
}
// FUNCTION TO LOAD SAVED AUTH USERS CREDENTIALS ---END---
// FUNCTION TO LOAD SAVED AUTH USERS CREDENTIALS ---START---
async function loadSavedCredentialsIfExistGoogle(calendarIds) {
  try {
    // const content = await fs.readFile(TOKEN_PATH);
    // const savedCredentials = JSON.parse(content);
    let savedCredentials=await getUsersAccessData(calendarIds)

    // Filter credentials based on provided calendarIds
    const filteredCredentials = savedCredentials.filter((cred) =>
      calendarIds.includes(cred.user_email)
    );

    if (filteredCredentials.length > 0) {
      const clients = [];
      for (const calendarId of calendarIds) {
        // Find the credentials for the current calendarId
        const credentials = filteredCredentials.find(
          (cred) => cred.user_email === calendarId
        );

        if (credentials) {
          console.log(credentials)
          // Log the retrieved credentials for debugging
          console.log(`Credentials found for calendar ID ${calendarId}:`);

          // Create a client using the found credentials
          const client = google.auth.fromJSON(credentials);
          clients.push(client);
          // return clients;
        } else {
          console.log(`No credentials found for calendar ID: ${calendarId}`);
          clients.push(null); // Push null for calendar IDs with no credentials
          // return clients;
        }
      }

      return clients;
    } else {
      console.log("No credentials found for the provided calendarIds.");
      return null;
    }
  } catch (err) {
    console.error("Error loading saved credentials:", err.message);
    throw err;
  }
}
// FUNCTION TO LOAD SAVED AUTH USERS CREDENTIALS ---END---
// FUNCTION TO REFRESH THE ACCESS TOKEN ---START---
async function refreshTokenIfNeeded(userEmail,refreshToken,accessToken,expiresIn) {
  console.log("refreshTokenIfNeededHIT:--------------");

  // const savedCredentials = JSON.parse(await fs.readFile(TOKEN_PATH));
  // const userCreds = savedCredentials.find(
  //   (cred) => cred.user_email === userEmail
  // );

  // console.log('Refreshing access token...');
  // let rtoken="M.C540_BAY.0.U.-Cv*CDW8VHruWJQLF62iqjTWvh6YFBqTp6Q*BXZ0eCYQBoaCO1!QdtNOgL2kEJCTUnKHN7AOa5Cg5cQ8Q03euE!Eh1nEB1Zy93pjxG!5iJgq7RfRXEEe!UDmc3mv0qeDnSOqBAtaVKJIEVrzEPDLRaeqfS8*6Yj3UIWpxhGS!679b9tmAgVNR7yRxHgILeZVqIuseI5knaLQB48kszv!SqI2m92XcqYNs2Th!CspOSjKsM6TyjfNtmJEJBISRE2*nLXS4Th*HpOsY8zR*MZamQ9onFl7GvS33p*bmRHZGQIo!XL8R!NdWS5cxq3blu3nHBoHyYlK5zBlBilSQsLvWf23CCsmOHmKEco0UbKYMNUWE";
  const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds

  const expireTimestamp = Math.floor(new Date(expiresIn).getTime() / 1000);
  
  if (expireTimestamp < currentTimestamp) {
    console.log(`Access Token Expired for ${userEmail}, Refreshing the Access Token:------------`)
    console.log("currentTimestamp")
    console.log(currentTimestamp)
    console.log("expireTimestamp")
    console.log(expireTimestamp)
    console.log("expiresIn")
    console.log(expiresIn)
    const refreshResponse = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
        // redirect_uri: "http://localhost:3000/auth/microsoft",
        redirect_uri: process.env.API_URL+"/outh2CallBackPassport",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  
    // console.log("refreshResponse:---------")
    // console.log(refreshResponse)
  
    const { access_token, refresh_token ,expires_in} = refreshResponse.data;
    let expireDate = new Date(new Date().getTime() + expires_in * 1000)
    expireDate.toISOString()
    let userUpdate=await updateUser(userEmail,{"access_token":access_token,"token_expires_at":expireDate})

  
    console.log("newAccessToken:---------");
    console.log(access_token);

    // await saveCredentials(access_token, refresh_token, userEmail);
    return access_token;
  }
  else {
    // If the access token is not expired, return the existing one
    console.log(`Access Token is not Expired for ${userEmail}, using the existing one:------------`)

    // console.log("existing access token:---------")
    // console.log(userCredentials.access_token)
    return accessToken;
  }

}
// FUNCTION TO REFRESH THE ACCESS TOKEN ---END---


// FUNCTION TO SCHEDULE MEETING BETWEEN AUTH USERS ---START---
async function scheduleMeeting(
  authArray,
  calendarIds,
  meeting_title,
  meeting_description,
  startTime,
  endTime,
  meeting_location,
  meetingDuration,
  jsonData,
  meeting_timeZone,
  meeting_min,
  iteration
) {
  // Check if the selected day is between Monday to Friday
  const startDay = startTime.getDay();
  const endDay = endTime.getDay();
  const timeZone = meeting_timeZone
/*
  const isWeekday =
    startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

  if (!isWeekday) {
    console.log("Meeting can only be scheduled from Monday to Friday.");
    return {status:400,message:`Meeting can only be scheduled from Monday to Friday`};

    return false; // Indicate failure
  }
*/
  // Check if the selected time is between 9:30 am to 6:30 pm
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const startMinutes = startTime.getMinutes();
  const endMinutes = endTime.getMinutes();


  const scheduleJsonData = jsonData
  let oofResult = null



  const { participants, meeting_id } = scheduleJsonData
  const participantUserID = participants.map(participant => participant.user_id);
  const amsterdamTimeZone = meeting_timeZone;
  function convertToAmsterdamTime(utcTimeString) {
    return moment.utc(utcTimeString).tz(amsterdamTimeZone).format();
  }

  // Convert each meeting time to Amsterdam time zone
  const startTimeAmsterdam = convertToAmsterdamTime(startTime);
  const endTimeAmsterdam = convertToAmsterdamTime(endTime);

  // console.log("startTimeAmsterdam");
  // console.log(startTimeAmsterdam);
  // console.log("endTimeAmsterdam");
  // console.log(endTimeAmsterdam);

  // console.log("authArray:-----------");
  // console.log(authArray);
  const freeBusyResults = await Promise.all(
    authArray.map(async (client, index) => {
      try {
        // Make the API call to get free/busy information for the user
        const freeBusy = await client
          .api("/me/calendar/getSchedule")
          .version("v1.0")
          .post({
            schedules: [calendarIds[index]],
            startTime: {
              dateTime: startTimeAmsterdam,
              timeZone: amsterdamTimeZone,
            },
            endTime: {
              dateTime: endTimeAmsterdam,
              timeZone: amsterdamTimeZone,
            },
          });

        // console.log("freeBusy:--------")
        // console.log(freeBusy)

        return freeBusy;
      } catch (error) {
        console.error("Error fetching free/busy data:", error);
        return null; // or handle error as needed
      }
    })
  );

  let currentTime = new Date().toISOString();

  const busySlotsArray = freeBusyResults.map((element) => {
    return element.value;
  });

  const outOfOfficeEvents = busySlotsArray.flatMap((schedule) => {
    const scheduleId = schedule[0].scheduleId;
    const oofEvents = schedule[0].scheduleItems.filter(
      (item) => item.status === "oof"
    );
    return oofEvents.map((event) => ({
      scheduleId,
      status: event.status,
      start: convertToAmsterdamTime(event.start.dateTime),
      end: convertToAmsterdamTime(event.end.dateTime),
    }));
  });


  // console.log("freeBusyResults:------------");
  // console.log(freeBusyResults);
  // console.log("busySlotsArray:-----------");
  // console.log(busySlotsArray);


  let commonFreeSlots;

  const optionalParticipants = participants.filter(
    (participant) => participant.is_optional === 1
  );

  console.log("optionalParticipants::-------------");
  console.log(optionalParticipants);

  const optionalUsersEmails = optionalParticipants.map(
    (participant) => participant.email
  );

  console.log("optionalUsersEmails:------------");
  console.log(optionalUsersEmails);


async function getCommonFreeSlots(startTime, endTime, busySlotsArray, scheduleJsonData, calendarIds, optionalUsersEmails, meeting_timeZone, outOfOfficeEvents, oofResult) {
  // Ensure that all responses were valid
  if (busySlotsArray.every((slots) => slots !== null)) {
    // Calculate common free slots
    const commonFreeSlots = await calculateCommonFreeSlots(
      startTime,
      endTime,
      busySlotsArray,
      scheduleJsonData,
      calendarIds,
      optionalUsersEmails,
      meeting_timeZone,
      outOfOfficeEvents,
      oofResult
    );
    return commonFreeSlots;
  } else {
    console.log("Error processing freeBusy responses. Aborting scheduling.");
    return false;
  }
}


async function findSuitableSlot(startTime, endTime, busySlotsArray, scheduleJsonData, calendarIds, optionalUsersEmails, meeting_timeZone, outOfOfficeEvents, meetingDuration, meeting_min) {
 oofResult = []; // Initialize oofResult as an empty array to store all discarded times

let commonFreeSlots = await getCommonFreeSlots(
    startTime,
    endTime,
    busySlotsArray,
    scheduleJsonData,
    calendarIds,
    optionalUsersEmails,
    meeting_timeZone,
    outOfOfficeEvents,
    oofResult // Pass oofResult initially
);

let iterationCount = 0;
const maxIterations = 10; // Limit to avoid infinite loop

while (commonFreeSlots !== null && iterationCount < maxIterations) {
    iterationCount++;

    let minimumMeetingDuration = meetingDuration * 60 * 1000;
    let suitableFreeSlot = commonFreeSlots ? commonFreeSlots.map((element) => element.commonSlot) : null;

    if (
        meeting_min &&
        Array.isArray(suitableFreeSlot) &&
        suitableFreeSlot.length > 0 &&
        suitableFreeSlot[0]
    ) {
        if (
            moment
                .duration(
                    moment(suitableFreeSlot[0].end).diff(suitableFreeSlot[0].start)
                )
                .asMilliseconds() <= minimumMeetingDuration
        ) {
            minimumMeetingDuration =
                moment
                    .duration(
                        moment(suitableFreeSlot[0].end).diff(suitableFreeSlot[0].start)
                    )
                    .asMinutes() *
                60 *
                1000;
        }
    }

    let suitableSlots = suitableFreeSlot ? suitableFreeSlot.filter((slot) => {
        const slotDuration =
            new Date(slot.end).getTime() - new Date(slot.start).getTime();
        return slotDuration >= minimumMeetingDuration;
    }) : null;

    if (!suitableSlots || suitableSlots.length === 0) {
        console.log("No suitable free slots found for the meeting, Users full day busy.");
        return false;
    }

    let sendListArr = commonFreeSlots.map((element) => element.sendList);
    let sendListArray = sendListArr.flat();

    const firstSlot = suitableSlots[0];
    const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
    const firstSlotStart = new Date(firstSlot.start);

    function convertToAmsterdamTime(utcTimeString) {
        return moment.utc(utcTimeString).tz(meeting_timeZone).format();
    }

    const suitableStartTime = convertToAmsterdamTime(firstSlotStart);
    const suitableEndTime = convertToAmsterdamTime(meetingEndTime);

    const meetingSuitableTime = {
        suitableStartTime: suitableStartTime,
        suitableEndTime: suitableEndTime,
        suitableSendListArray: sendListArray,
    };

    const { suitableSendListArray } = meetingSuitableTime;
    const suitableStart = new Date(suitableStartTime);
    const suitableEnd = new Date(suitableEndTime);

    // Check for OOF events for all users in suitableSendListArray
    let isOOF = false;
    for (const userToCheck of suitableSendListArray) {
        const userOOFEvent = outOfOfficeEvents.find(event => event.scheduleId === userToCheck && event.status === 'oof');
        if (userOOFEvent) {
            const oofStart = new Date(userOOFEvent.start);
            const oofEnd = new Date(userOOFEvent.end);
            if ((suitableStart >= oofStart && suitableStart < oofEnd) || (suitableEnd > oofStart && suitableEnd <= oofEnd)) {
                console.log(`User ${userToCheck} is OOF, finding new slot.`);
                oofResult.push({ suitableStartTime, suitableEndTime }); // Add discarded time to oofResult
                isOOF = true;
                break; // No need to check further users if one is found OOF
            }
        }
    }

    if (isOOF) {
        console.log("oofResult:------------");
        console.log(oofResult);

        commonFreeSlots = await getCommonFreeSlots(
            startTime,
            endTime,
            busySlotsArray,
            scheduleJsonData,
            calendarIds,
            optionalUsersEmails,
            meeting_timeZone,
            outOfOfficeEvents,
            oofResult // Pass updated oofResult to getCommonFreeSlots
        );
    } else {
        console.log("User(s) are available");

        commonFreeSlots[0].commonSlot.start = suitableStartTime;
        commonFreeSlots[0].commonSlot.end = suitableEndTime;

        console.log("commonFreeSlots:------------");
        console.log(commonFreeSlots);

        return commonFreeSlots;
    }
}

console.log("Failed to find a suitable meeting time after multiple attempts.");
return null; // Return null if no suitable slots found after maxIterations
}



commonFreeSlots = await findSuitableSlot(
  startTime,
  endTime,
  busySlotsArray,
  scheduleJsonData,
  calendarIds,
  optionalUsersEmails,
  meeting_timeZone,
  outOfOfficeEvents,
  meetingDuration,
  meeting_min
);

console.log("Suitable meeting time found:------------");
console.log(commonFreeSlots)




  // Minimum duration required for the meeting
  let minimumMeetingDuration = meetingDuration * 60 * 1000;

  console.log("commonFreeSlot");
  console.log(commonFreeSlots)

  let suitableSlots;

  let suitableFreeSlot = commonFreeSlots?commonFreeSlots.map(element => element.commonSlot):null

  if (meeting_min && Array.isArray(suitableFreeSlot) && suitableFreeSlot.length > 0 && suitableFreeSlot[0]) {
    // if (meeting_min) {

    if (moment.duration(moment(suitableFreeSlot[0].end).diff(suitableFreeSlot[0].start)).asMilliseconds() <= minimumMeetingDuration) {

      minimumMeetingDuration = moment.duration(moment(suitableFreeSlot[0].end).diff(suitableFreeSlot[0].start)).asMinutes() * 60*  1000;

      console.log("suitableFreeSlots:---------")
      console.log(suitableFreeSlot)
      console.log("minimumMeetingDuration2:----------");
      console.log(minimumMeetingDuration);
    }
    console.log("meeting_min2:------");
    console.log(meeting_min);
  }

if(suitableFreeSlot){
  // Filter common free slots that are long enough for the meeting
  suitableSlots = suitableFreeSlot.filter((slot) => {
    const slotDuration =
      new Date(slot.end).getTime() - new Date(slot.start).getTime();
    return slotDuration >= minimumMeetingDuration;
  });
}else {

  let logData;

  if (busySlotsArray.every((slots) => slots !== null)) {
    // Calculate common free slots
    logData = await dataForLogs(
      startTime,
      endTime,
      busySlotsArray,
      scheduleJsonData,
      calendarIds,
      optionalUsersEmails,
      meeting_timeZone,
      currentTime
    );
  } else {
    console.log("Error processing freeBusy responses. Aborting scheduling.");
    return false;
  }

  // console.log("FreeTimeSlots:------------");
  // console.log(logData);
  // let a = JSON.stringify(logData);
  // console.log(a);
  if (!logData || logData.length === 0) {
    logData = "No free slot(s) available for participants";
  }
  const logDataForCommonSlots = logData.freeSlotsByDate

  const commonTimeSlots = await findCommonFreeTimeSlots(logDataForCommonSlots, meeting_timeZone, jsonData, currentTime);
  // const commonTimeSlots = await findCommonFreeTimeSlots(logData);
  // console.log("commonTimeSlots:-----------");
  // console.log(commonTimeSlots);
  // // let b = JSON.stringify(commonTimeSlots);
  // // console.log(b);


  console.log(
    "No suitable free slots found for the meeting, showing log data"
  );

  const freeSlotsAndCommonFreeSlots = {
    logData: logData,
    commonFreeSlots: commonTimeSlots, // common free slots
  };

  console.log("freeSlotsAndCommonFreeSlots:-----------");
  console.log(freeSlotsAndCommonFreeSlots);
  const F = JSON.stringify(freeSlotsAndCommonFreeSlots);
  console.log(F);
  // return freeSlotsAndCommonFreeSlots; // Indicate failure

  console.log(
    "No suitable free slots found for the meeting, Users full day busy."
  );
  // return false; // Indicate failure

  return {status:4, meetingId: meeting_id,
    logData:logData.enrichedSlotsByDateWithTime,
    commonTimeSlots:commonTimeSlots,
    message:`It seems there are no available time slot(s) for the meeting as the user's schedule is fully booked between the suggested time frame.`};

    console.log("No suitable free slots found for the meeting.");
    return false; // Indicate failure
  }

  const sendListArr = commonFreeSlots.map(element => element.sendList)
  const sendListArray = sendListArr.flat()
  

  if(sendListArray.length == 0){
    if (suitableSlots.length > 0) {
      const firstSlot = suitableSlots[0];
      const meetingEndTime = new Date(
        new Date(firstSlot.start).getTime() + minimumMeetingDuration
      );
  
      console.log("meetingEndTime:------------")
      console.log(meetingEndTime)
  
      const firstSlotStart = new Date(firstSlot.start)

      // const event = {
      //   summary,
      //   location: meetingLocation,
      //   description,
      //   start: {
      //     // dateTime: firstSlot.start,
      //     dateTime: firstSlotStart,
      //     // timeZone: "Asia/Kolkata",
      //     timeZone: timeZone,
      //   },
      //   end: {
      //     // dateTime: meetingEndTime.toISOString(),
      //     dateTime: meetingEndTime,
      //     // timeZone: "Asia/Kolkata",
      //     timeZone: timeZone,
      //   },
      // };
  
      // for (const calendarId of calendarIds) {
      //   const calendarIndex = calendarIds.indexOf(calendarId);
      //   await calendars[calendarIndex].events.insert({
      //     auth: authArray[calendarIndex],
      //     calendarId: 'primary',
      //     resource: event,
      //   });
      // }
      // await setMeeting(summary, meetingLocation, description, firstSlotStart, timeZone, meetingEndTime, calendarIds, calendars, authArray)
      let logData;

      if (busySlotsArray.every((slots) => slots !== null)) {
        // Calculate common free slots
        logData = await dataForLogs(
          startTime,
          endTime,
          busySlotsArray,
          scheduleJsonData,
          calendarIds,
          optionalUsersEmails,
          meeting_timeZone,
          currentTime
        );
      } else {
        console.log(
          "Error processing freeBusy responses. Aborting scheduling."
        );
        return false;
      }

      // console.log("FreeTimeSlots:------------");
      // console.log(logData);
      // let a = JSON.stringify(logData);
      // console.log(a);

      if (!logData || logData.length === 0) {
        logData = "No free slot(s) available for participants";
      }
      const logDataForCommonSlots = logData.freeSlotsByDate

      const commonTimeSlots = await findCommonFreeTimeSlots(logDataForCommonSlots, meeting_timeZone, jsonData, currentTime);
      // const commonTimeSlots = await findCommonFreeTimeSlots(logData);

     await setMeeting(
        meeting_title,
        meeting_location,
        meeting_description,
        meeting_timeZone,
        calendarIds,
        authArray,
        firstSlotStart,
        meetingEndTime,
        participants
      );
      // const scheduleTimeStart = moment.tz(firstSlotStart, timeZone).format('DD/MM/YYYY HH:mm');
      // const scheduleTimeEnd = moment.tz(meetingEndTime, timeZone).format('DD/MM/YYYY HH:mm');

      // console.log(`Meeting scheduled for ${scheduleTimeStart} to ${scheduleTimeEnd}`);
      const scheduleTimeStart = moment.tz(firstSlotStart, timeZone).format('HH:mm');
      const scheduleTimeEnd = moment.tz(meetingEndTime, timeZone).format('HH:mm');
      const scheduleDate = moment.tz(firstSlotStart, timeZone).format('DD/MM/YYYY');

      const meetingScheduled = {
        startTime: scheduleTimeStart,
        endTime: scheduleTimeEnd,
        date: scheduleDate,
        meetingId: meeting_id,
        logData:logData.enrichedSlotsByDateWithTime,
        commonTimeSlots:commonTimeSlots,

        status: '2'
    };

    console.log("meetingScheduled:----------")
    console.log(meetingScheduled)
      return meetingScheduled; // return the meetingSchedule JSON

      return {status:200,message:`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`};
      return true; // Indicate success
    } else {
      let logData;

      if (busySlotsArray.every((slots) => slots !== null)) {
        // Calculate common free slots
        logData = await dataForLogs(
          startTime,
          endTime,
          busySlotsArray,
          scheduleJsonData,
          calendarIds,
          optionalUsersEmails,
          meeting_timeZone,
          currentTime
        );
      } else {
        console.log(
          "Error processing freeBusy responses. Aborting scheduling."
        );
        return false;
      }

      // console.log("FreeTimeSlots:------------");
      // console.log(logData);
      // let a = JSON.stringify(logData);
      // console.log(a);

      if (!logData || logData.length === 0) {
        logData = "No free slot(s) available for participants";
      }
      const logDataForCommonSlots = logData.freeSlotsByDate

      const commonTimeSlots = await findCommonFreeTimeSlots(logDataForCommonSlots, meeting_timeZone, jsonData, currentTime);
      
  
  
        return {status:4, 
        logData:logData.enrichedSlotsByDateWithTime,
        commonTimeSlots:commonTimeSlots,
    meetingId: meeting_id,message:`It seems there are no available time slot(s) for the meeting as the user's schedule is fully booked between the suggested time frame.`};
      console.log("No suitable free slots found for the meeting.");
      return false; // Indicate failure
    }
  }else{
    if (
      meeting_min &&
      Array.isArray(suitableFreeSlot) &&
      suitableFreeSlot.length > 0 &&
      suitableFreeSlot[0]
    ) {
      // if (moment.duration(moment(suitableFreeSlot[0].end).diff(suitableFreeSlot[0].start)).asMinutes() <= minimumMeetingDuration) {
      if (
        moment
          .duration(
            moment(suitableFreeSlot[0].end).diff(suitableFreeSlot[0].start)
          )
          .asMilliseconds() <= minimumMeetingDuration
      ) {
        minimumMeetingDuration =
          moment
            .duration(
              moment(suitableFreeSlot[0].end).diff(suitableFreeSlot[0].start)
            )
            .asMinutes() *
          60 *
          1000;

        // console.log("suitableFreeSlotsStatus1:---------");
        // console.log(suitableFreeSlot);
        // console.log("minimumMeetingDuration2Status1:----------");
        // console.log(minimumMeetingDuration);
      }
      // console.log("meeting_min2Status1:------");
      // console.log(meeting_min);
    }

    const meetingUserIds = [];

    let bestSuitableSlot = suitableFreeSlot.filter((slot) => {
      const slotDuration =
        new Date(slot.end).getTime() - new Date(slot.start).getTime();
      // console.log("slotDurationStatus1:---------");
      // console.log(slotDuration);
      return slotDuration >= minimumMeetingDuration;
    });

    const firstSlot = bestSuitableSlot[0];
    const bestEndTime = new Date(
      new Date(firstSlot.start).getTime() + minimumMeetingDuration
    );

    const firstSlotUTC = new Date(firstSlot.start);

    for (const email of sendListArray) {
      const participant = participants.find(
        (participant) => participant.email === email
      );
      if (participant) {
        meetingUserIds.push({
          email: email,
          user_id: participant.user_id,
          // meetingId: meeting_id
        });
      }
    }

        // BLOCK TIME SLOT FOR THE USERS WHO ARE AVAILABLE DURING THE SUITABLE TIME SLOT ---START---
        console.log("calendarIds in scheduleMeeting function else:--------------");
        console.log(calendarIds);
    
        console.log(
          "sendListArray in scheduleMeeting function else:--------------"
        );
        console.log(sendListArray);
    
        console.log("firstSlotUTC:-----------");
        console.log(firstSlotUTC);
    
        console.log("bestEndTime:---------");
        console.log(bestEndTime);
    
        const amsterdamTimeZone = meeting_timeZone;
    
        function convertToAmsterdamTime(utcTimeString) {
          return moment.utc(utcTimeString).tz(amsterdamTimeZone).format();
        }
    
        // Convert each meeting time to Amsterdam time zone
        const firstSlotStartAmsterdam = convertToAmsterdamTime(firstSlotUTC);
        const meetingEndTimeAmsterdam = convertToAmsterdamTime(bestEndTime);
    
        calendarIds = calendarIds.filter((id) => !sendListArray.includes(id));
    
        // console.log("calendarIds in scheduleMeeting function else after excluding sendListArray:--------------")
        // console.log(calendarIds)
    
        // console.log("firstSlotStartAmsterdam:-----------")
        // console.log(firstSlotStartAmsterdam)
    
        // console.log("meetingEndTimeAmsterdam:---------")
        // console.log(meetingEndTimeAmsterdam)
    
       let blockTimeDataToInsert= await blockTimeSlot(
          meeting_timeZone,
          calendarIds,
          authArray,
          firstSlotStartAmsterdam,
          meetingEndTimeAmsterdam,
          participants,
          jsonData
        );

        await insertBlockTimeDataInDB(blockTimeDataToInsert);
        // SCHEDULE EVENT FOR THE USERS WHO ARE AVAILABLE IN THE SLOT ---END---
        let logData;

        if (busySlotsArray.every((slots) => slots !== null)) {
          // Calculate common free slots
          logData = await dataForLogs(
            startTime,
            endTime,
            busySlotsArray,
            scheduleJsonData,
            calendarIds,
            optionalUsersEmails,
            meeting_timeZone,
            currentTime
          );
        } else {
          console.log("Error processing freeBusy responses. Aborting scheduling.");
          return false;
        }
    
        // console.log("FreeTimeSlots:------------");
        // console.log(logData);
        // let a = JSON.stringify(logData);
        // console.log(a);

        if (!logData || logData.length === 0) {
          logData = "No free slot(s) available for participants";
        }
    
        const logDataForCommonSlots = logData.freeSlotsByDate

        const commonTimeSlots = await findCommonFreeTimeSlots(logDataForCommonSlots, meeting_timeZone, jsonData, currentTime);
    
    
    
      
                const start_time = moment.tz(firstSlotUTC, timeZone).format("HH:mm");
    const end_time = moment.tz(bestEndTime, timeZone).format("HH:mm");
    const date = moment.tz(firstSlotUTC, timeZone).format("DD/MM/YYYY");

    const extractedEmailSend = {
      startTime: start_time,
      endTime: end_time,
      date: date,
      sendEmail: meetingUserIds,
      status: "1",
      meetingId: meeting_id,
      iteration:iteration,
      logData: logData.enrichedSlotsByDateWithTime,
      commonTimeSlots: commonTimeSlots,

    };

    // console.log("extractedEmailSend:-------");
    // console.log(extractedEmailSend);

    return extractedEmailSend
  }
}
// FUNCTION TO SCHEDULE MEETING BETWEEN AUTH USERS ---END---
// async function setMeeting(summary, meetingLocation, description, firstSlotStart, timeZone, meetingEndTime, calendarIds, calendars, authArray,noTimezone=false){

async function setMeeting(
  meeting_title,
  meeting_location,
  meeting_description,
  meeting_timeZone,
  calendarIds,
  authArray,
  firstSlotStart,
  meetingEndTime,
  participants
){
  const amsterdamTimeZone = meeting_timeZone;

  function convertToAmsterdamTime(utcTimeString) {
    return moment.utc(utcTimeString).tz(amsterdamTimeZone).format();
  }

  // Convert each meeting time to Amsterdam time zone
  const firstSlotStartAmsterdam = convertToAmsterdamTime(firstSlotStart);
  const meetingEndTimeAmsterdam = convertToAmsterdamTime(meetingEndTime);

  const hostParticipant = participants.find(
    (participant) => participant.is_host === 1
  );
  console.log(participants)
console.log("host is this");
console.log(hostParticipant);
  // let host = hostParticipant.email;

  let host;

  if (hostParticipant) {
    host = hostParticipant.email;
    console.log(`Host is provided form CMS, HOST: ${host}`)
  } else if (calendarIds.length > 0) {
    // If no host participant is found, set the first email in calendarIds as the host
    host = calendarIds[0];
    console.log(`Host is not provided form CMS, Making HOST: ${host}` )
  } else {
    // Handle case where there are no calendarIds
    console.error("No calendarIds provided");
    return; // Exit function early
  }

  // console.log("firstSlotStartAmsterdam:------------");
  // console.log(firstSlotStartAmsterdam);
  // console.log("meetingEndTimeAmsterdam:------------");
  // console.log(meetingEndTimeAmsterdam);

  const event = {
    subject: meeting_title,
    start: {
      dateTime: firstSlotStartAmsterdam,
      timeZone: amsterdamTimeZone,
    },
    end: {
      dateTime: meetingEndTimeAmsterdam,
      timeZone: amsterdamTimeZone,
    },
    location: {
      displayName: meeting_location,
    },
    body: {
      content: meeting_description,
      contentType: "text",
    },
    attendees: calendarIds.map((email) => ({
      emailAddress: { address: email },
      type: "required",
    })),
    responseRequested: false,
  };

  let organizer = [];
  organizer.push(host);
console.log("auth Array");
console.log(authArray)
  // Find the client object with matching calendarId
  const organizerEmail = organizer[0]; // Assuming only one organizer email
  const clientObject = authArray.find(
    (client) => client.calendarId === organizerEmail
  );
console.log("clientObject")
console.log(clientObject)
  async function createMeeting(event, accessToken) {
    try {
      const response = await axios.post(
        "https://graph.microsoft.com/v1.0/me/calendar/events",
        event,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("Meeting created:", response.data);

      const organizerUser = response.data.organizer.emailAddress;
      console.log("Organizer:", organizerUser.name, "-", organizerUser.address);

      // Getting attendees
      const attendees = response.data.attendees;
      console.log("Attendees:");
      attendees.forEach((attendee, index) => {
        console.log(
          `${index + 1}. ${attendee.emailAddress.name} - ${
            attendee.emailAddress.address
          }`
        );
      });
    } catch (error) {
      console.error("Error creating meeting:", error.response.data);
      throw error;
    }
  }

  await createMeeting(event, clientObject.accessToken);

  

  
/*
  axios
    .post("https://graph.microsoft.com/v1.0/me/calendar/events", event, {
      headers: {
        Authorization: `Bearer ${authArray[0].accessToken}`, // Use User A's access token
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("Meeting created by User A (host):", response.data);
    })
    .catch((error) => {
      console.error("Error creating meeting:", error.response.data);
    });
  
  */

}

// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
async function calculateCommonFreeSlotsGoogle(startTime, endTime, busySlots, jsonData) {
  const busyPeriods = busySlots.map((obj) => {
    const email = Object.keys(obj)[0];
    const busy = Object.values(obj)[0].busy;
    return { [email]: busy };
  });

  console.log("busyPeriods")
  console.log(JSON.stringify(busyPeriods))

  const commonFreeSlots = await findCommonFreeSlots(startTime, endTime, busyPeriods, jsonData);

  return commonFreeSlots;
}
function calculateCommonFreeSlots(
  startTime,
  endTime,
  busySlots,
  jsonData,
  calendarIds,
  optionalUsersEmails,
  oofResult
) {
  console.log("calculateCommonFreeSlotsHit:--------------");

  const busySlotsFlat = busySlots.flat();

  console.log("busySlotsFlat:----------")
  console.log(busySlotsFlat)

  const meetings = busySlotsFlat.map((slot) => {
    const formattedSlots = slot.scheduleItems.map((item) => ({
      start: item.start.dateTime,
      end: item.end.dateTime,
    }));
    return {
      [slot.scheduleId]: formattedSlots,
    };
  });

  const amsterdamTimeZone = "Europe/Amsterdam";

  function convertToAmsterdamTime(utcDateTime) {
    return moment.utc(utcDateTime).tz(amsterdamTimeZone).format();
  }

  // Map through meetings array and convert start and end times to Amsterdam timezone
  const busyPeriods = meetings.map((meeting) => {
    const updatedMeeting = {};
    for (const key in meeting) {
      updatedMeeting[key] = meeting[key].map((slot) => ({
        start: convertToAmsterdamTime(slot.start),
        end: convertToAmsterdamTime(slot.end),
      }));
    }
    return updatedMeeting;
  });

  // console.log("busyPeriods:------------");
  // console.log(busyPeriods);
  // const a = JSON.stringify(busyPeriods);
  // console.log(a);
  const optionalUsersArray = busyPeriods.filter((period) => {
    const email = Object.keys(period)[0];
    return optionalUsersEmails.includes(email)
;
  });

  console.log("optionalUsersArray:-------------");
  // console.log(optionalUsersArray);
  // Extract optional users and their corresponding values ---END---

  // Remove optional users their corresponding values ---START---
  const requiredUsersArray = busyPeriods.filter((period) => {
    const email = Object.keys(period)[0];
    return !optionalUsersEmails.includes(email)
;
  });

  console.log("requiredUsersArray:------------");
  console.log(requiredUsersArray);
  // Remove optional users their corresponding values ---END---
  

  const commonFreeSlots = findCommonFreeSlots(
    startTime,
    endTime,
    requiredUsersArray,
    jsonData,
    oofResult
  );

  let { participants } = jsonData;

  if (commonFreeSlots) {
    const sendListsArr = commonFreeSlots.map((item) => item.sendList);
    const emailSendListArray = sendListsArr.flat();
    if (participants.length == emailSendListArray.length) {
      commonFreeSlots = null;
    }
  }
  return commonFreeSlots;
}
// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---END---


// FUNCTION TO FIND COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
// FUNCTION TO FIND COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
async function findCommonFreeSlotsBackup19April(start, end, busyPeriods, jsonDataFormate){

  let data = jsonDataFormate;
  let users = busyPeriods;
moment.tz.setDefault(data.meeting_timeZone);
let freeSlotsResult = [],slotsResults = [],multiResult=[]
  
var startDate = moment(data.start_date).tz(data.meeting_timeZone);
var endDate = moment(data.end_date).tz(data.meeting_timeZone);

// Array to store the dates in between
var datesInBetween = [];
// Current date to start iteration
var currentDate = startDate.clone();

// Iterate through dates
while (currentDate.isSameOrBefore(endDate)) {
    datesInBetween.push(currentDate.format('YYYY-MM-DD'));
    currentDate = moment.tz(currentDate.add(1, 'days'), data.meeting_timeZone);
}
let resArr,maxLen=-Infinity,maxLenMulti=-Infinity
// Group events by date
users.forEach(x=>{
  let userEmail=Object.keys(x)[0]
  let eventsList=x[userEmail]
  var groupedEvents= eventsList.reduce((acc, event) => {
  let eventStart=moment.tz(event.start, data.meeting_timeZone)
  var date = moment(eventStart).format('YYYY-MM-DD');
  if (!acc[date]) {
      acc[date] = [];
  }
  acc[date].push(event);
  return acc;
}, {});
x[userEmail]=groupedEvents
})
console.log(datesInBetween)

let arr=[]
let officeStart=moment('2024-03-27T08:00:00').tz(data.meeting_timeZone)
let officeEnd=moment('2024-03-27T18:30:00').tz(data.meeting_timeZone)
let morningEveningTime=moment("2024-01-06T12:00:00").tz(data.meeting_timeZone)

for(let element of datesInBetween){

        element=moment(element).tz(data.meeting_timeZone)
        arr=[]
        users.forEach(x=>{
          let userEmail=Object.keys(x)[0]
          let eventsList=x[userEmail]
          var final=moment(element).format("YYYY-MM-DD")
          arr.push({
            [userEmail]:eventsList[final]?eventsList[final]:[]
          })
      
        })
      let startDatetime = officeStart.clone().set({
        year: moment(element).year(),
        month: moment(element).month(),
        date: moment(element).date()
      });
      let endDatetime = officeEnd.clone().set({
        year: moment(element).year(),
        month: moment(element).month(),
        date: moment(element).date()
      });
      let newMorningEveningTime = morningEveningTime.clone().set({
        year: moment(element).year(),
        month: moment(element).month(),
        date: moment(element).date()
      });
      // console.log(arr,data.meeting_duration,startDatetime,endDatetime)
      let morning=null,evening=null,fullDay=null,fixedStart=null,fixedEnd=null
      if(data.meeting_timing==1){
        fullDay=true
      }
      if(data.meeting_timing==2){
        morning=true
      }
      if(data.meeting_timing==3){
        evening=true
      }
      if(data.meeting_timing==4){
        // Parse date and time separately
      const date = moment(element, 'YYYY-MM-DD').tz(data.meeting_timeZone);
      const time = moment(data.start_time, 'HH:mm:ss').tz(data.meeting_timeZone);
      
      // Merge date and time
      const mergedDateTime = date.clone().add({
        hours: time.hours(),
        minutes: time.minutes(),
        seconds: time.seconds()
      });
      const time2 = moment(data.end_time, 'HH:mm:ss').tz(data.meeting_timeZone);
      const mergedDateTime2 = date.clone().add({
        hours: time2.hours(),
        minutes: time2.minutes(),
        seconds: time2.seconds()
      });
      // console.log(mergedDateTime.format('YYYY-MM-DDTHH:mm:ss.SSSSSSS'));
        fixedStart=moment(mergedDateTime.format('YYYY-MM-DDTHH:mm:ss')).tz(data.meeting_timeZone)
        fixedEnd=moment(mergedDateTime2.format('YYYY-MM-DDTHH:mm:ss')).tz(data.meeting_timeZone)
      }
      let durationTime
      if(data.meeting_duration){
        durationTime=data.meeting_duration
      }
      if(data.meeting_min_duration){
        durationTime=data.meeting_min_duration
      }
      let result=await getTime(arr,durationTime,startDatetime,endDatetime,morning,evening,fullDay,fixedStart,fixedEnd,newMorningEveningTime)
      
      // console.log("result:-----------")
      console.log(result)
      if(result){
        if(maxLenMulti<=result.group.length){
          if(maxLenMulti<result.group.length)multiResult=[]
          maxLenMulti=result.group.length
          multiResult.push(result)
        }
        if(result.sendList.length){
            // return this result
            if(maxLen<result.group.length){
              maxLen=result.group.length
                resArr=result
            }
        }else{
          resArr=result
          freeSlotsResult.push(resArr)
          // return freeSlotsResult
          break;
        }
      }
      slotsResults.push(result)
      if(datesInBetween.length==slotsResults.length){
        if(resArr)freeSlotsResult.push(resArr)
        else{
          freeSlotsResult=null
      }
      // return freeSlotsResult
      if(multiResult.length>1)freeSlotsResult=await findCommonTimeForMulti(multiResult)
      break;
      }
}
function findCommonTimeForMulti(arr){
  let uniqueSlots = arr;

  let min=-Infinity,minArr=[]
  for (let index = 0; index < uniqueSlots.length; index++) {
    const ele = uniqueSlots[index].group;
    for (let j = 0; j < ele.length; j++) {
      if(min<=ele[j].totalFreeTime){
          if(min<ele[j].totalFreeTime&&minArr.length)minArr=[]
          min=ele[j].totalFreeTime
          minArr.push(uniqueSlots[index])
      };
      
    }
  }
  let newMinArr
  if(minArr. length>1){
    min=-Infinity
    newMinArr=[]
    for (let j = 0; j < minArr.length; j++) {
     
        if(min<=minArr[j].totalFree){
            if(min<minArr[j].totalFree&&newMinArr.length)newMinArr=[]
            min=minArr[j].totalFree
            newMinArr.push(minArr[j])
        }; 
    }
    return newMinArr?newMinArr[0]:newMinArr
  }
  
  return minArr.length?minArr[0]:minArr
  }
function getTime(users,duration,officeStart,officeEnd,morning,evening,fullDay,fixedStart,fixedEnd,newMorningEveningTime){
   /********************************************* filter users according to durations in three array  *************************/
  const filterUsers = (users, duration) => {
    const fullDayBusyUsers = [];
    const freeTimeUsers = [];
    const lessThanDurationUsers = [];
  
    users.forEach(user => {
      const userName = Object.keys(user)[0];
      const userSlots = user[userName];

      let totalFreeTime = 0
      user['name']=userName
      user['freeslots']=[]
      user['freeslotsinmin']=[]
      
        for(let i=0;i<userSlots.length;i++){
            if(i==0) { totalFreeTime=moment(moment(userSlots[i].start).tz(data.meeting_timeZone)).diff(officeStart, 'minutes')
            if(totalFreeTime>0)
            {user['freeslots'].push({
                'start':moment(officeStart).tz(data.meeting_timeZone),
                'end':moment(userSlots[i].start).tz(data.meeting_timeZone)
            })
            user['freeslotsinmin'].push(totalFreeTime)
        }
        }
        if(i==userSlots.length-1) {
                totalFreeTime=moment(officeEnd).diff(moment(userSlots[i].end).tz(data.meeting_timeZone), 'minutes')
                if(totalFreeTime>0)
                {user['freeslots'].push({
                    'start':moment(userSlots[i].end).tz(data.meeting_timeZone),
                    'end':moment(officeEnd).tz(data.meeting_timeZone)
                })
                user['freeslotsinmin'].push(totalFreeTime)
            }
        }
        else{
                totalFreeTime= moment(moment(userSlots[i+1]?.start)).diff(userSlots[i].end, 'minutes')
                if(totalFreeTime>0)
                {user['freeslots'].push({
                    'start':moment(userSlots[i].end).tz(data.meeting_timeZone),
                    'end':moment(userSlots[i+1]?.start).tz(data.meeting_timeZone)
                })
                user['freeslotsinmin'].push(totalFreeTime)
            }
        }
        }
        if(userSlots.length==0){
          user['freeslots'].push({
            'start':moment(officeStart).tz(data.meeting_timeZone),
            'end':moment(officeEnd).tz(data.meeting_timeZone)
        })
        user['freeslotsinmin'].push(moment.duration(moment(officeEnd).diff(moment(officeStart))).asMinutes())
        }
      if (!user.freeslotsinmin.find(x=>x>0)) {
        fullDayBusyUsers.push({ name: userName, freeMinutes: user.freeslots , freeTimeInMinutes:user.freeslotsinmin});
      } else if (user.freeslotsinmin.find(x=>x>= duration) ) {
        freeTimeUsers.push({ name: userName, freeMinutes: user.freeslots, freeTimeInMinutes:user.freeslotsinmin , totalFreeTime:user.freeslotsinmin.reduce((acc, currentValue) => acc + currentValue, 0)});
      } else {
        lessThanDurationUsers.push({ name: userName, freeMinutes: user.freeslots , freeTimeInMinutes:user.freeslotsinmin ,totalFreeTime:user.freeslotsinmin.reduce((acc, currentValue) => acc + currentValue, 0)});
      }
    });
    return { fullDayBusyUsers, freeTimeUsers, lessThanDurationUsers };
  };

/*********************************************  make groups according common free time slot ******************/
const findCommonFreeTimeSlotsGroup = (users) => {
  let userGroups = [],maxlength=[],max=-Infinity,group=[],commonTimeForMax={'commonSlot':[]}
  
  for (let index = 0; index < users.length; index++) {
      const element = users[index];
      // group.push(element)
      
      for (let j = 0; j < element.freeMinutes.length; j++) {
        let obj={}
        group=[]
        group.push(element)
          let endElement =moment(element.freeMinutes[j].end).tz(data.meeting_timeZone);
          let startElement = moment(element.freeMinutes[j].start).tz(data.meeting_timeZone);
          let checkDuration=moment.duration(endElement.diff(startElement)).asMinutes()
          let flag=false
          if(morning){
            if (startElement.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(startElement)).asMinutes() >=duration && checkDuration>=duration) {
              flag=true
            }
          } 
          if(evening){
            if (moment.duration(endElement.diff(newMorningEveningTime)).asMinutes() >=duration && endElement.isSameOrAfter(moment(newMorningEveningTime)) && checkDuration>=duration) {
              flag=true
            }
          }
          if(fullDay && checkDuration>=duration){
              flag=true
          }
          if(fixedStart && fixedEnd){
            let customStart=moment.max(moment(startElement),moment(fixedStart))
            let customEnd=moment.min(moment(endElement),moment(fixedEnd))
            let customSlotTime=moment.duration(customEnd.diff(customStart)).asMinutes()
            if (customSlotTime>=duration) {
              flag=true
            }
          }
          if(flag){
          for (let k = 0; k < users.length; k++) {
            if(k!=index){
              users[k].freeMinutes.forEach(element => {
              
               
                let commonStart,commonEnd,commonSlotTime
                let flagForCommon=false
                if(obj?.commonSlot){
                   commonStart=moment.max(moment(obj.commonSlot.start),moment(element.start))
                   commonEnd=moment.min(moment(obj.commonSlot.end),moment(element.end))
                   commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()
                  
                }else{
                  commonStart=moment.max(moment(startElement),moment(element.start))
                  commonEnd=moment.min(moment(endElement),moment(element.end))
                  if(morning){
                    commonEnd=moment.max(moment(commonStart),moment(newMorningEveningTime))
                  }
                  if(evening){
                    commonStart=moment.min(moment(commonEnd),moment(newMorningEveningTime))
                  }
                  if(fixedStart&&fixedEnd){
                    commonStart=moment.max(moment(commonStart),moment(fixedStart))
                    commonEnd=moment.min(moment(commonEnd),moment(fixedEnd))
                    
                  }
                  //  commonStart=moment.max(moment(startElement),moment(element.start))
                  //  commonEnd=moment.min(moment(endElement),moment(element.end))
                   commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()

                }
                if(morning){
                  if (commonStart.isBefore(moment(newMorningEveningTime)) && commonEnd.isSameOrBefore(moment(newMorningEveningTime))) {
                    flagForCommon=true
                  }
                } 
                if(evening){
                  if (commonStart.isSameOrAfter(moment(newMorningEveningTime)) && commonEnd.isAfter(moment(newMorningEveningTime))) {
                    flagForCommon=true
                  }
                }
                if(fullDay){
                  flagForCommon=true
                }
                if(fixedStart&&fixedEnd){
                  if (commonStart.isSameOrAfter(fixedStart) && commonEnd.isSameOrBefore(fixedEnd)) {
                    flagForCommon=true
                  }
                }
                if(commonSlotTime>=duration &&!group.find(x=>x.name==users[k].name)&&flagForCommon){
                  group.push(users[k])
                  // if(min>=commonSlotTime){
                  //   min=commonSlotTime
                  obj.commonSlot={'start':moment(commonStart),"end":moment(commonEnd)}
                
                // }
                }
            
              });
              }
          }
        /********************************************************** second iteration handling start ***********************************************/
          if(data.scheduled_date&&data.scheduled_end_time&&data.scheduled_start_time&&obj.commonSlot){
            let datePart = moment(data.scheduled_date,'YYYY-MM-DD').tz(data.meeting_timeZone);
            let flagForMulti
            flagForMulti=datePart.isSame(obj.commonSlot.start, 'day')
            flagForMulti=datePart.isSame(obj.commonSlot.end, 'day')
            let timePart = moment(data.scheduled_end_time, "HH:mm:ss").tz(data.meeting_timeZone);
            let timePart2 = moment(data.scheduled_start_time, "HH:mm:ss").tz(data.meeting_timeZone);
            let mergedDateTime1 = datePart.clone()
              .hours(timePart.hours())
              .minutes(timePart.minutes())
              .seconds(timePart.seconds())
              .tz(data.meeting_timeZone);
              let mergedDateTime2 = datePart.clone()
              .hours(timePart2.hours())
              .minutes(timePart2.minutes())
              .seconds(timePart2.seconds())
              .tz(data.meeting_timeZone);
            let diffFor2it=moment.duration(obj.commonSlot.end.diff(mergedDateTime1)).asMinutes()
            let diffFor2it1=moment.duration(mergedDateTime2.diff(obj.commonSlot.start)).asMinutes()
            const isOverlap =
              (obj.commonSlot.start.isSameOrBefore(mergedDateTime2) && obj.commonSlot.end.isSameOrAfter(mergedDateTime2)) ||
              (obj.commonSlot.start.isSameOrBefore(mergedDateTime1) && obj.commonSlot.end.isSameOrAfter(mergedDateTime1)) ||
              (mergedDateTime2.isSameOrBefore(obj.commonSlot.start) && mergedDateTime1.isSameOrAfter(obj.commonSlot.end));
          if(isOverlap&&flagForMulti){
            let flagForIt=false
            let flagCheck=false
            if(diffFor2it1>=duration){
              obj.commonSlot.end=mergedDateTime2
              flagForIt=true
              flagCheck=true
            }
            if(diffFor2it>=duration&&!flagCheck){
              obj.commonSlot.start=mergedDateTime1
              flagForIt=true
            }
            // else{
            //   obj.commonSlot=undefined
            // }
            if(diffFor2it1>=duration&&!flagCheck){
              obj.commonSlot.end=mergedDateTime2
              flagForIt=true
            }
            if(!flagForIt){
              obj.commonSlot=undefined
            }
          }
        }

        if(data.scheduled_date&&data.scheduled_end_time&&data.scheduled_start_time&&!obj.commonSlot){
          let datePart = moment(data.scheduled_date,'YYYY-MM-DD').tz(data.meeting_timeZone);
          let flagForMulti
            flagForMulti=datePart.isSame(endElement, 'day')
            flagForMulti=datePart.isSame(startElement, 'day')
          let timePart = moment(data.scheduled_end_time, "HH:mm:ss").tz(data.meeting_timeZone);
          let timePart2 = moment(data.scheduled_start_time, "HH:mm:ss").tz(data.meeting_timeZone);
          let mergedDateTime1 = datePart.clone()
            .hours(timePart.hours())
            .minutes(timePart.minutes())
            .seconds(timePart.seconds())
            .tz(data.meeting_timeZone);
            let mergedDateTime2 = datePart.clone()
            .hours(timePart2.hours())
            .minutes(timePart2.minutes())
            .seconds(timePart2.seconds())
            .tz(data.meeting_timeZone);
          let diffFor2it=moment.duration(endElement.diff(mergedDateTime1)).asMinutes()
          let diffFor2it1=moment.duration(mergedDateTime2.diff(startElement)).asMinutes()
          const isOverlap1 =
            (startElement.isSameOrBefore(mergedDateTime2) && endElement.isSameOrAfter(mergedDateTime2)) ||
            (startElement.isSameOrBefore(mergedDateTime1) && endElement.isSameOrAfter(mergedDateTime1)) ||
            (mergedDateTime2.isSameOrBefore(startElement) && mergedDateTime1.isSameOrAfter(endElement));
        if(isOverlap1&&flagForMulti){
          let flagForIt=false
          let flagCheck=false
          if(diffFor2it1>=duration){
            endElement=mergedDateTime2
            flagForIt=true
            flagCheck=true
          }
          if(diffFor2it>=duration&&!flagCheck){
            startElement=mergedDateTime1
            flagForIt=true
          }
          // else{
          //   obj.commonSlot=undefined
          // }
          if(diffFor2it1>=duration&&!flagCheck){
            endElement=mergedDateTime2
            flagForIt=true
          }
          if(!flagForIt){
            endElement=undefined
            startElement=undefined
          }
        }
      }
      /********************************************************** second iteration handling end ***********************************************/
          obj.usersGroup=group
          userGroups.push(obj)
          if(max<=group.length){
            if(max<group.length&&maxlength.length)maxlength=[]
            max=group.length
            if(obj.commonSlot){
            maxlength.push({
              'group':group,
              'commonSlot':obj.commonSlot
            })
          }
          else{
            if(endElement&&startElement)
           { maxlength.push({
              'group':group,
              'commonSlot':{'start':startElement,"end":endElement}
            })
          }
          // else{
          //   maxlength=[]
          // }
            
          }
            
            commonTimeForMax.maxUserGroup=maxlength
            
            commonTimeForMax.commonSlot.push(obj.commonSlot)
          }
          obj={}
          group=[];}
      }
      
  }

  // when all user dont have common slot but available slots are greater then duration some slots already handled in previous loop but in some cases we have to handle specificaly
  if(!commonTimeForMax.commonSlot.find(x=>x)&&commonTimeForMax.maxUserGroup){
     let groupIn=[],obj={},userGroup=[],slot=[]
        commonTimeForMax.maxUserGroup.forEach(x=>{
        if(x.group.length==1){
            x.group[0].freeMinutes.forEach(ele => {
                let commonStart,commonEnd,commonSlotTime
                      commonEnd=moment(ele.end).tz(data.meeting_timeZone)
                      commonStart=moment(ele.start).tz(data.meeting_timeZone)
                      commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()
                      let flagForIt=false
                      if(data.scheduled_date&&data.scheduled_end_time&&data.scheduled_start_time&&commonSlotTime>=duration){
                        
                        let datePart = moment(data.scheduled_date);
                        let timePart = moment(data.scheduled_end_time, "HH:mm:ss");
                        let timePart2 = moment(data.scheduled_start_time, "HH:mm:ss");
                        let mergedDateTime1 = datePart.clone()
                          .hours(timePart.hours())
                          .minutes(timePart.minutes())
                          .seconds(timePart.seconds())
                          .tz(data.meeting_timeZone);
                          let mergedDateTime2 = datePart.clone()
                          .hours(timePart2.hours())
                          .minutes(timePart2.minutes())
                          .seconds(timePart2.seconds())
                          .tz(data.meeting_timeZone);
                        let diffFor2it=moment.duration(commonEnd.diff(mergedDateTime1)).asMinutes()
                        let diffFor2it1=moment.duration(mergedDateTime2.diff(commonStart)).asMinutes()
                        const isOverlap =
                          (commonStart.isSameOrBefore(mergedDateTime2) && commonEnd.isSameOrAfter(mergedDateTime2)) ||
                          (commonStart.isSameOrBefore(mergedDateTime1) && commonEnd.isSameOrAfter(mergedDateTime1)) ||
                          (mergedDateTime2.isSameOrBefore(commonStart) && mergedDateTime1.isSameOrAfter(commonEnd));
                      if(isOverlap){
                        flagForIt=true
                        let flagCheck=false
                        if(diffFor2it1>=duration){
                          commonEnd=mergedDateTime2
                          flagForIt=false
                          flagCheck=true
                        }
                        if(diffFor2it>=duration&&!flagCheck){
                          commonStart=mergedDateTime1
                          flagForIt=false
                        }
                        // else{
                        //   obj.commonSlot=undefined
                        // }
                        
                        // if(!flagForIt){
                        //   obj.commonSlot=undefined
                        // }
                      }
                    }
                      let flagForCommonTime=false
                      if(morning){
                        //startElement.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(startElement)).asMinutes() >=duration
                        if (commonStart.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(commonStart)).asMinutes() >=duration) {
                          flagForCommonTime=true
                        }
                      } 
                      if(evening){
                        if (commonStart.isSameOrAfter(moment(newMorningEveningTime)) && commonEnd.isAfter(moment(newMorningEveningTime))) {
                          flagForCommonTime=true
                        }
                      }
                      if(fullDay){
                        flagForCommonTime=true
                      }
                      if(fixedStart&&fixedEnd){
                        if (commonStart.isSameOrAfter(fixedStart) && commonEnd.isSameOrBefore(fixedEnd)) {
                          flagForCommonTime=true
                        }
                      }
                    if(commonSlotTime>=duration &&!groupIn.find(y=>y.name==x.group[0].name)&&flagForCommonTime&&!flagForIt){
                          groupIn.push(x.group[0])
                      // if(min>=commonSlotTime){
                      //   min=commonSlotTime
                      obj.commonSlot={'start':moment(commonStart),"end":moment(commonEnd)}
                      obj.group=groupIn
                      userGroup.push(obj);
                      slot.push(obj.commonSlot)
                      groupIn=[]
                      obj={}
                    // }
                    }
            });
            
        }
      })
      commonTimeForMax.maxUserGroup=userGroup;
      commonTimeForMax.commonSlot=slot;
}
let newFlagFor2
if(commonTimeForMax.maxUserGroup){
  newFlagFor2=commonTimeForMax.maxUserGroup.length>0
}
    return userGroups.length>0&&newFlagFor2?[userGroups,commonTimeForMax]:undefined;
  };
  
 /********************************************* handling for getting best time slot from multiple groups have time slots  *************************/
const findCommonTimeAndUsers=(arr)=>{
const uniqueSlots = [];
const seenSlots = {};

arr[1].maxUserGroup.forEach(item => {
    const { start, end } = item.commonSlot;
    const slotKey = `${start}-${end}`;

    if (!seenSlots[slotKey]) {
        seenSlots[slotKey] = true;
        uniqueSlots.push(item);
    }
});

// console.log(uniqueSlots);
let min=Infinity,minArr=[]
for (let index = 0; index < uniqueSlots.length; index++) {
  const ele = uniqueSlots[index].group;
  for (let j = 0; j < ele.length; j++) {
    uniqueSlots[index].totalFree=uniqueSlots[index].totalFree?uniqueSlots[index].totalFree+ele[j].totalFreeTime:ele[j].totalFreeTime
    if(min>=ele[j].totalFreeTime){
        if(min>ele[j].totalFreeTime&&minArr.length)minArr=[]
        min=ele[j].totalFreeTime
        minArr.push(uniqueSlots[index])
    };
    
  }
}
let newMinArr
if(minArr. length>1){
  min=Infinity
  newMinArr=[]
  for (let j = 0; j < minArr.length; j++) {
   
      if(min>=minArr[j].totalFree){
          if(min>minArr[j].totalFree&&newMinArr.length)newMinArr=[]
          min=minArr[j].totalFree
          newMinArr.push(minArr[j])
      }; 
  }
  return newMinArr
}

return minArr
}


// if we have users in lessduration then we check previously selected time slot in this  
let findSlotLessDuration=(lessDur,resPre)=>{
let finalGroup,max=-Infinity,res
        for (let i = 0; i < resPre.length; i++) {
          const ele = resPre[i].commonSlot;
          finalGroup=[]
          for (let j = 0; j < lessDur.length; j++) {
              lessDur[j].freeMinutes.forEach(x=>{
                  let commonStart=moment.max(moment(ele.start),moment(x.start))
                  let commonEnd=moment.min(moment(ele.end),moment(x.end))
                  let commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()
                  if(commonSlotTime>0 &&!finalGroup.find(x=>x.name==lessDur[j].name)){
                        finalGroup.push(lessDur[j])
                  }
              })
              
          }
          if(max<finalGroup.length){
            max=finalGroup.length
            res=resPre[i]
          }
        }
        return res
}


let findClosestTime=(arr)=>{
    const targetDuration = duration
    let closestTimeSlot = null;
    let minDifference = Infinity;

    arr.forEach(userSchedule => {
       userSchedule.freeMinutes.forEach(slot => {
                const start = moment(slot.start);
                const end = moment(slot.end);
                const duration = moment.duration(end.diff(start)).asMinutes();

                const difference = Math.abs(duration - targetDuration);
                if (difference < minDifference) {
                    minDifference = difference;
                    closestTimeSlot = {start, end};
                }
           
        });
    });

function adjustTimeSlot(timeSlot) {
  const start = timeSlot.start.clone();
  const adjustedend = start.clone().add(duration, 'minutes');
  return { start, end: adjustedend };
}
if(morning){
  //startElement.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(startElement)).asMinutes() >=duration
  if (closestTimeSlot.start.isBefore(moment(newMorningEveningTime)) && closestTimeSlot.end.isSameOrBefore(fixedStart)) {
    
  }else{
    closestTimeSlot=null
  }
} 
if(evening){
  if (closestTimeSlot.start.isSameOrAfter(moment(newMorningEveningTime)) && closestTimeSlot.end.isAfter(moment(newMorningEveningTime))) {
    
  }else{
    closestTimeSlot=null
  }
}
if(fixedStart&&fixedEnd){
  if (closestTimeSlot.start.isSameOrAfter(fixedStart) && closestTimeSlot.end.isSameOrBefore(fixedEnd)) {
    
  }else{
    closestTimeSlot=null
  }
}
if (closestTimeSlot) {
  let sendMail= []
  users.forEach(x=>{sendMail.push(x.name)})
  return {
    group:[],
    commonSlot:adjustTimeSlot(closestTimeSlot),
    sendList:sendMail
  }
}
}

let res
const { fullDayBusyUsers, freeTimeUsers, lessThanDurationUsers } = filterUsers(users, duration);

if(fullDayBusyUsers.length==users.length){
return null
}

let commonFreeTimeSlotsGroups
     if(freeTimeUsers.length>0){
      commonFreeTimeSlotsGroups= findCommonFreeTimeSlotsGroup(freeTimeUsers);
     }

let slotAndUsers
     if(commonFreeTimeSlotsGroups){
       slotAndUsers=findCommonTimeAndUsers(commonFreeTimeSlotsGroups)
       res=slotAndUsers
     }
let final
     if (lessThanDurationUsers.length>0&&slotAndUsers) {
       final=findSlotLessDuration(lessThanDurationUsers,slotAndUsers)
       res=final
     }
let  closestFreeSlot
if(lessThanDurationUsers.length==users.length){
   closestFreeSlot=findClosestTime(lessThanDurationUsers)
   console.log(closestFreeSlot)
}
let finalUserList=new Set()
if(res){
  users.forEach(x=>{
    if(!Array.isArray(res))
      {
        if(!res.group.find(y=>y.name==x.name))finalUserList.add(x.name)
      }
    else{
      if(res.length>0){
      res=res[0]
      if(!res.group.find(y=>y.name==x.name))finalUserList.add(x.name)
    }else return null
    }
  })
  if(!Array.isArray(res)){
    res.sendList=[...finalUserList]
  }
  else{
    res=undefined
  }
}


 return res?res:(closestFreeSlot?closestFreeSlot:null)
}
console.log(freeSlotsResult)
return freeSlotsResult
}
async function findCommonFreeSlots(start, end, busyPeriods, jsonDataFormate,oofResult){
  let data = jsonDataFormate;
let users = busyPeriods;
moment.tz.setDefault(data.meeting_timeZone);
let freeSlotsResult = [],slotsResults = [],multiResult=[],resCheck
  
var startDate = moment(data.start_date).tz(data.meeting_timeZone);
var endDate = moment(data.end_date).tz(data.meeting_timeZone);

// Array to store the dates in between
var datesInBetween = [];
// Current date to start iteration
var currentDate = startDate.clone();

// Iterate through dates
while (currentDate.isSameOrBefore(endDate)) {
    datesInBetween.push(currentDate.format('YYYY-MM-DD'));
    currentDate = moment.tz(currentDate.add(1, 'days'), data.meeting_timeZone);
}
let resArr,maxLen=-Infinity,maxLenMulti=-Infinity

// Group events by date
users.forEach(x=>{
  let userEmail=Object.keys(x)[0]
  let eventsList=x[userEmail]
  var groupedEvents= eventsList.reduce((acc, event) => {
  let eventStart=moment.tz(event.start, data.meeting_timeZone)
  var date = moment(eventStart).format('YYYY-MM-DD');
  if (!acc[date]) {
      acc[date] = [];
  }
  acc[date].push(event);
  return acc;
}, {});
x[userEmail]=groupedEvents
})
console.log(datesInBetween)

let arr=[]
let officeStart=moment('2024-03-27T08:30:00').tz(data.meeting_timeZone)
let officeEnd=moment('2024-03-27T17:00:00').tz(data.meeting_timeZone)
let morningEveningTime=moment("2024-01-06T12:00:00").tz(data.meeting_timeZone)
for(let element of datesInBetween){

          element=moment(element).tz(data.meeting_timeZone)
          arr=[]
          users.forEach(x=>{
            let userEmail=Object.keys(x)[0]
            let eventsList=x[userEmail]
            var final=moment(element).format("YYYY-MM-DD")
            arr.push({
              [userEmail]:eventsList[final]?eventsList[final]:[]
            })
        
          })
        let startDatetime = officeStart.clone().set({
          year: moment(element).year(),
          month: moment(element).month(),
          date: moment(element).date()
        });
        let endDatetime = officeEnd.clone().set({
          year: moment(element).year(),
          month: moment(element).month(),
          date: moment(element).date()
        });
        let newMorningEveningTime = morningEveningTime.clone().set({
          year: moment(element).year(),
          month: moment(element).month(),
          date: moment(element).date()
        });
        // console.log(arr,data.meeting_duration,startDatetime,endDatetime)
        let morning=null,evening=null,fullDay=null,fixedStart=null,fixedEnd=null
        if(data.meeting_timing==1){
          fullDay=true
        }
        if(data.meeting_timing==2){
          morning=true
        }
        if(data.meeting_timing==3){
          evening=true
        }
        if(data.meeting_timing==4){
          // Parse date and time separately
        const date = moment(element, 'YYYY-MM-DD').tz(data.meeting_timeZone);
        const time = moment(data.start_time, 'HH:mm:ss').tz(data.meeting_timeZone);
        
        // Merge date and time
        const mergedDateTime = date.clone().add({
          hours: time.hours(),
          minutes: time.minutes(),
          seconds: time.seconds()
        });
        const time2 = moment(data.end_time, 'HH:mm:ss').tz(data.meeting_timeZone);
        const mergedDateTime2 = date.clone().add({
          hours: time2.hours(),
          minutes: time2.minutes(),
          seconds: time2.seconds()
        });
        // console.log(mergedDateTime.format('YYYY-MM-DDTHH:mm:ss.SSSSSSS'));
          fixedStart=moment(mergedDateTime.format('YYYY-MM-DDTHH:mm:ss')).tz(data.meeting_timeZone)
          fixedEnd=moment(mergedDateTime2.format('YYYY-MM-DDTHH:mm:ss')).tz(data.meeting_timeZone)
        }
        let durationTime
        if(data.meeting_duration){
          durationTime=data.meeting_duration
        }
        if(data.meeting_min_duration){
          durationTime=data.meeting_min_duration
        }
        let result=await getTime(arr,durationTime,startDatetime,endDatetime,morning,evening,fullDay,fixedStart,fixedEnd,newMorningEveningTime)
        
        // console.log("result:-----------")
        console.log(result)
        if(result){
          if(maxLenMulti<=result.group.length){
            if(maxLenMulti<result.group.length)multiResult=[]
            maxLenMulti=result.group.length
            multiResult.push(result)
          }
          if(result.sendList.length){
              // return this result
              if(maxLen<result.group.length){
                maxLen=result.group.length
                  resArr=result
              }
          }else{
            resArr=result
            freeSlotsResult.push(resArr)
            // return freeSlotsResult
            break;
          }
        }
        slotsResults.push(result)
        if(datesInBetween.length==slotsResults.length){
          if(resArr)freeSlotsResult.push(resArr)
          else{
            freeSlotsResult=null
        }
        // return freeSlotsResult
        if(multiResult.length>1){
          resCheck=await findCommonTimeForMulti(multiResult)
          if(resCheck){
            freeSlotsResult=[];
            freeSlotsResult.push(resCheck);
          }
          else
          freeSlotsResult=null;
        break;
        }
        }
  }



function findCommonTimeForMulti(arr){
  let uniqueSlots = arr;

  let min=-Infinity,minArr=[]
  for (let index = 0; index < uniqueSlots.length; index++) {
    const ele = uniqueSlots[index].group;
    for (let j = 0; j < ele.length; j++) {
      if(min<=ele[j].totalFreeTime){
          if(min<ele[j].totalFreeTime&&minArr.length)minArr=[]
          min=ele[j].totalFreeTime
          minArr.push(uniqueSlots[index])
      };
      
    }
  }
  let newMinArr
  if(minArr. length>1){
    min=-Infinity
    newMinArr=[]
    for (let j = 0; j < minArr.length; j++) {
    
        if(min<=minArr[j].totalFree){
            if(min<minArr[j].totalFree&&newMinArr.length)newMinArr=[]
            min=minArr[j].totalFree
            newMinArr.push(minArr[j])
        }; 
    }
    return newMinArr?newMinArr[0]:newMinArr
  }
  
  return minArr.length?minArr[0]:minArr
  }

  function secondIterationHandling(meeting_log, meeting_timeZone, duration, commonStart, commonEnd) {
    console.log("secondIterationHandling HIT:-------------------");
  
    // Parse the common start and end times into moment objects
    commonStart = moment(commonStart).tz(meeting_timeZone);
    commonEnd = moment(commonEnd).tz(meeting_timeZone);
  
    for (let log of meeting_log) {
        let datePart = moment(log.proposed_meeting_date, 'YYYY-MM-DD').tz(meeting_timeZone);
        let flagForMulti = datePart.isSame(commonStart, 'day') || datePart.isSame(commonEnd, 'day');
  
        let startTime = moment(log.proposed_start_time, "HH:mm:ss").tz(meeting_timeZone);
        let endTime = moment(log.proposed_end_time, "HH:mm:ss").tz(meeting_timeZone);
  
        let mergedStartTime = datePart.clone()
            .hours(startTime.hours())
            .minutes(startTime.minutes())
            .seconds(startTime.seconds())
            .tz(meeting_timeZone);
  
        let mergedEndTime = datePart.clone()
            .hours(endTime.hours())
            .minutes(endTime.minutes())
            .seconds(endTime.seconds())
            .tz(meeting_timeZone);
  
        console.log("mergedStartTime in secondIterationHandling Function:---------");
        console.log(mergedStartTime);
  
        console.log("mergedEndTime in secondIterationHandling Function:---------");
        console.log(mergedEndTime);
  
        let diffFor2it = moment.duration(commonEnd.diff(mergedEndTime)).asMinutes();
        let diffFor2it1 = moment.duration(mergedStartTime.diff(commonStart)).asMinutes();
  
        const isOverlap =
            (commonStart.isSameOrBefore(mergedStartTime) && commonEnd.isSameOrAfter(mergedStartTime)) ||
            (commonStart.isSameOrBefore(mergedEndTime) && commonEnd.isSameOrAfter(mergedEndTime)) ||
            (mergedStartTime.isSameOrBefore(commonStart) && mergedEndTime.isSameOrAfter(commonEnd));
  
        if (isOverlap && flagForMulti) {
            let flagForIt = false;
            let flagCheck = false;
  
            if (diffFor2it1 >= duration) {
                commonEnd = mergedStartTime;
                flagForIt = true;
                flagCheck = true;
            }
            if (diffFor2it >= duration && !flagCheck) {
                commonStart = mergedEndTime;
                flagForIt = true;
            }
            if (diffFor2it1 >= duration && !flagCheck) {
                commonEnd = mergedStartTime;
                flagForIt = true;
            }
            if (!flagForIt) {
                commonStart = undefined;
                commonEnd = undefined;
                break;
            }
        }
    }
  
    let iterationTwo = [commonStart, commonEnd];
    console.log("common free slots from iterationTwo:--------");
    console.log(iterationTwo);
    return [commonStart, commonEnd];
  }


 function outOfOfficeHandling(oofResult, meeting_timeZone, duration, commonStart, commonEnd) {
  console.log("outOfOfficeHandling HIT:-------------------");

  console.log("oofResult in outOFOfficeHandling function:-----------")
  console.log(oofResult)



const proposedMeeting = oofResult.map(slot => {
const startTime = moment(slot.suitableStartTime).tz(meeting_timeZone);
const endTime = moment(slot.suitableEndTime).tz(meeting_timeZone);

return {
    proposed_meeting_date: startTime.format('YYYY-MM-DD'),
    proposed_start_time: startTime.format('HH:mm:ss'),
    proposed_end_time: endTime.format('HH:mm:ss')
};
});

console.log("proposedMeeting in outOFOfficeHandling function")
console.log(proposedMeeting)


  // Parse the common start and end times into moment objects
  commonStart = moment(commonStart).tz(meeting_timeZone);
  commonEnd = moment(commonEnd).tz(meeting_timeZone);

  for (let log of proposedMeeting) {
      let datePart = moment(log.proposed_meeting_date, 'YYYY-MM-DD').tz(meeting_timeZone);
      let flagForMulti = datePart.isSame(commonStart, 'day') || datePart.isSame(commonEnd, 'day');

      let startTime = moment(log.proposed_start_time, "HH:mm:ss").tz(meeting_timeZone);
      let endTime = moment(log.proposed_end_time, "HH:mm:ss").tz(meeting_timeZone);

      let mergedStartTime = datePart.clone()
          .hours(startTime.hours())
          .minutes(startTime.minutes())
          .seconds(startTime.seconds())
          .tz(meeting_timeZone);

      let mergedEndTime = datePart.clone()
          .hours(endTime.hours())
          .minutes(endTime.minutes())
          .seconds(endTime.seconds())
          .tz(meeting_timeZone);

      console.log("mergedStartTime in outOfOfficeHandling Function:---------");
      console.log(mergedStartTime);

      console.log("mergedEndTime in outOfOfficeHandling Function:---------");
      console.log(mergedEndTime);

      let diffFor2it = moment.duration(commonEnd.diff(mergedEndTime)).asMinutes();
      let diffFor2it1 = moment.duration(mergedStartTime.diff(commonStart)).asMinutes();

      const isOverlap =
          (commonStart.isSameOrBefore(mergedStartTime) && commonEnd.isSameOrAfter(mergedStartTime)) ||
          (commonStart.isSameOrBefore(mergedEndTime) && commonEnd.isSameOrAfter(mergedEndTime)) ||
          (mergedStartTime.isSameOrBefore(commonStart) && mergedEndTime.isSameOrAfter(commonEnd));

      if (isOverlap && flagForMulti) {
          let flagForIt = false;
          let flagCheck = false;

          if (diffFor2it1 >= duration) {
              commonEnd = mergedStartTime;
              flagForIt = true;
              flagCheck = true;
          }
          if (diffFor2it >= duration && !flagCheck) {
              commonStart = mergedEndTime;
              flagForIt = true;
          }
          if (diffFor2it1 >= duration && !flagCheck) {
              commonEnd = mergedStartTime;
              flagForIt = true;
          }
          if (!flagForIt) {
              commonStart = undefined;
              commonEnd = undefined;
              break;
          }
      }
  }

  let iterationTwo = [commonStart, commonEnd];
  console.log("common free slots from outOfOfficeHandling:--------");
  console.log(iterationTwo);
  return [commonStart, commonEnd];
}


function getTime(users,duration,officeStart,officeEnd,morning,evening,fullDay,fixedStart,fixedEnd,newMorningEveningTime){
  /********************************************* filter users according to durations in three array  *************************/
  const filterUsers = (users, duration) => {
    const fullDayBusyUsers = [];
    const freeTimeUsers = [];
    const lessThanDurationUsers = [];
  
    users.forEach(user => {
      const userName = Object.keys(user)[0];
      const userSlots = user[userName];

      let totalFreeTime = 0
      user['name']=userName
      user['freeslots']=[]
      user['freeslotsinmin']=[]
      
        for(let i=0;i<userSlots.length;i++){
            if(i==0) { totalFreeTime=moment(moment(userSlots[i].start).tz(data.meeting_timeZone)).diff(officeStart, 'minutes')
            if(totalFreeTime>0)
            {user['freeslots'].push({
                'start':moment(officeStart).tz(data.meeting_timeZone),
                'end':moment(userSlots[i].start).tz(data.meeting_timeZone)
            })
            user['freeslotsinmin'].push(totalFreeTime)
        }
        }
        if(i==userSlots.length-1) {
                totalFreeTime=moment(officeEnd).diff(moment(userSlots[i].end).tz(data.meeting_timeZone), 'minutes')
                if(totalFreeTime>0)
                {user['freeslots'].push({
                    'start':moment(userSlots[i].end).tz(data.meeting_timeZone),
                    'end':moment(officeEnd).tz(data.meeting_timeZone)
                })
                user['freeslotsinmin'].push(totalFreeTime)
            }
        }
        else{
                totalFreeTime= moment(moment(userSlots[i+1]?.start)).diff(userSlots[i].end, 'minutes')
                if(totalFreeTime>0)
                {user['freeslots'].push({
                    'start':moment(userSlots[i].end).tz(data.meeting_timeZone),
                    'end':moment(userSlots[i+1]?.start).tz(data.meeting_timeZone)
                })
                user['freeslotsinmin'].push(totalFreeTime)
            }
        }
        }
        if(userSlots.length==0){
          user['freeslots'].push({
            'start':moment(officeStart).tz(data.meeting_timeZone),
            'end':moment(officeEnd).tz(data.meeting_timeZone)
        })
        user['freeslotsinmin'].push(moment.duration(moment(officeEnd).diff(moment(officeStart))).asMinutes())
        }
      if (!user.freeslotsinmin.find(x=>x>0)) {
        fullDayBusyUsers.push({ name: userName, freeMinutes: user.freeslots , freeTimeInMinutes:user.freeslotsinmin});
      } else if (user.freeslotsinmin.find(x=>x>= duration) ) {
        freeTimeUsers.push({ name: userName, freeMinutes: user.freeslots, freeTimeInMinutes:user.freeslotsinmin , totalFreeTime:user.freeslotsinmin.reduce((acc, currentValue) => acc + currentValue, 0)});
      } else {
        lessThanDurationUsers.push({ name: userName, freeMinutes: user.freeslots , freeTimeInMinutes:user.freeslotsinmin ,totalFreeTime:user.freeslotsinmin.reduce((acc, currentValue) => acc + currentValue, 0)});
      }
    });
    return { fullDayBusyUsers, freeTimeUsers, lessThanDurationUsers };
  };

/*********************************************  make groups according common free time slot ******************/


const findCommonFreeTimeSlotsGroup = (users) => {
  let userGroups = [],maxlength=[],max=-Infinity,group=[],commonTimeForMax={'commonSlot':[]}
  let val
  for (let index = 0; index < users.length; index++) {
      const element = users[index];
      
      for (let j = 0; j < element.freeMinutes.length; j++) {
        let obj={}
        group=[]
        group.push(element)
          let endTimeElement =moment(element.freeMinutes[j].end).tz(data.meeting_timeZone);
          let startTimeElement = moment(element.freeMinutes[j].start).tz(data.meeting_timeZone);
          let checkDuration=moment.duration(endTimeElement.diff(startTimeElement)).asMinutes()
          let flag=false
          if(morning){
            if (startTimeElement.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(startTimeElement)).asMinutes() >=duration && checkDuration>=duration) {
              flag=true
            }
          } 
          if(evening){
            if (moment.duration(endTimeElement.diff(newMorningEveningTime)).asMinutes() >=duration && endTimeElement.isSameOrAfter(moment(newMorningEveningTime)) && checkDuration>=duration) {
              flag=true
            }
          }
          if(fullDay && checkDuration>=duration){
              flag=true
          }
          if(fixedStart && fixedEnd){
            let customStart=moment.max(moment(startTimeElement),moment(fixedStart))
            let customEnd=moment.min(moment(endTimeElement),moment(fixedEnd))
            let customSlotTime=moment.duration(customEnd.diff(customStart)).asMinutes()
            if (customSlotTime>=duration) {
              flag=true
            }
          }
          if(flag){
          for (let k = 0; k < users.length; k++) {
            if(k!=index){
              users[k].freeMinutes.forEach(element => {
              
              
                let commonStart,commonEnd,commonSlotTime
                let flagForCommon=false
                if(obj?.commonSlot){
                  commonStart=moment.max(moment(obj.commonSlot.start),moment(element.start))
                  commonEnd=moment.min(moment(obj.commonSlot.end),moment(element.end))
                  commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()
                  
                }else{
                  commonStart=moment.max(moment(startTimeElement),moment(element.start))
                  commonEnd=moment.min(moment(endTimeElement),moment(element.end))
                  if(morning){
                    commonEnd=moment.max(moment(commonStart),moment(newMorningEveningTime))
                  }
                  if(evening){
                    commonStart=moment.min(moment(commonEnd),moment(newMorningEveningTime))
                  }
                  if(fixedStart&&fixedEnd){
                    commonStart=moment.max(moment(commonStart),moment(fixedStart))
                    commonEnd=moment.min(moment(commonEnd),moment(fixedEnd))
                    
                  }
                  commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()

                }
                if(morning){
                  if (commonStart.isBefore(moment(newMorningEveningTime)) && commonEnd.isSameOrBefore(moment(newMorningEveningTime))) {
                    flagForCommon=true
                  }
                } 
                if(evening){
                  if (commonStart.isSameOrAfter(moment(newMorningEveningTime)) && commonEnd.isAfter(moment(newMorningEveningTime))) {
                    flagForCommon=true
                  }
                }
                if(fullDay){
                  flagForCommon=true
                }
                if(fixedStart&&fixedEnd){
                  if (commonStart.isSameOrAfter(fixedStart) && commonEnd.isSameOrBefore(fixedEnd)) {
                    flagForCommon=true
                  }
                }
                if(commonSlotTime>=duration &&!group.find(x=>x.name==users[k].name)&&flagForCommon){
                  group.push(users[k])
                  obj.commonSlot={'start':moment(commonStart),"end":moment(commonEnd)}
                
                }
            
              });
              }
          }
        /********************************************************** second iteration handling start ***********************************************/
        if(data.activity.length != 0 && obj.commonSlot){
          val=secondIterationHandling(data.activity,data.meeting_timeZone ,duration,obj.commonSlot.start,obj.commonSlot.end)
        if(Array.isArray(val)){
          if(!val[0]&&!val[1]){
          obj.commonSlot=undefined
        }
        if(val[0]){
          obj.commonSlot.start=val[0]
        }
        if(val[1]){
          obj.commonSlot.end=val[1]
        }}
        }
  
  
  
        if(data.activity.length != 0 && !obj.commonSlot){
        val=secondIterationHandling(data.activity, data.meeting_timeZone ,duration, startTimeElement, endTimeElement)
        if(Array.isArray(val)){
          if(!val[0]&&!val[1]){
          startTimeElement=undefined
          endTimeElement=undefined
        }
        if(val[0]){
          startTimeElement=val[0]
        }
        if(val[1]){
          endTimeElement=val[1]
        }}
      }



      if(oofResult.length != 0 && obj.commonSlot){
          val=outOfOfficeHandling(oofResult,data.meeting_timeZone ,duration,obj.commonSlot.start,obj.commonSlot.end)
        if(Array.isArray(val)){
          if(!val[0]&&!val[1]){
          obj.commonSlot=undefined
        }
        if(val[0]){
          obj.commonSlot.start=val[0]
        }
        if(val[1]){
          obj.commonSlot.end=val[1]
        }}
        }
  
  
  
        if(oofResult.length != 0 && !obj.commonSlot){
        val=outOfOfficeHandling(oofResult, data.meeting_timeZone ,duration, startTimeElement, endTimeElement)
        if(Array.isArray(val)){
          if(!val[0]&&!val[1]){
          startTimeElement=undefined
          endTimeElement=undefined
        }
        if(val[0]){
          startTimeElement=val[0]
        }
        if(val[1]){
          endTimeElement=val[1]
        }}
      }
      /********************************************************** second iteration handling end ***********************************************/
          obj.usersGroup=group
          userGroups.push(obj)
          if(max<=group.length){
            if(max<group.length&&maxlength.length)maxlength=[]
            max=group.length
            if(obj.commonSlot){
            maxlength.push({
              'group':group,
              'commonSlot':obj.commonSlot
            })
          }
          else{
            if(endTimeElement&&startTimeElement)
          { maxlength.push({
              'group':group,
              'commonSlot':{'start':startTimeElement,"end":endTimeElement}
            })
          }
        
          }
            
            commonTimeForMax.maxUserGroup=maxlength
            
            commonTimeForMax.commonSlot.push(obj.commonSlot)
          }
          obj={}
          group=[];}
      }
      
  }

  // when all user dont have common slot but available slots are greater then duration some slots already handled in previous loop but in some cases we have to handle specificaly
  if(!commonTimeForMax.commonSlot.find(x=>x)&&commonTimeForMax.maxUserGroup){
    let groupIn=[],obj={},userGroup=[],slot=[]
        commonTimeForMax.maxUserGroup.forEach(x=>{
        if(x.group.length==1){
            x.group[0].freeMinutes.forEach(ele => {
                let commonStart,commonEnd,commonSlotTime
                      commonEnd=moment(ele.end).tz(data.meeting_timeZone)
                      commonStart=moment(ele.start).tz(data.meeting_timeZone)
                      commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()
                      let flagForIt=false
                      if(data.scheduled_date&&data.scheduled_end_time&&data.scheduled_start_time&&commonSlotTime>=duration){
                        
                        let datePart = moment(data.scheduled_date);
                        let timePart = moment(data.scheduled_end_time, "HH:mm:ss");
                        let timePart2 = moment(data.scheduled_start_time, "HH:mm:ss");
                        let mergedDateTime1 = datePart.clone()
                          .hours(timePart.hours())
                          .minutes(timePart.minutes())
                          .seconds(timePart.seconds())
                          .tz(data.meeting_timeZone);
                          let mergedDateTime2 = datePart.clone()
                          .hours(timePart2.hours())
                          .minutes(timePart2.minutes())
                          .seconds(timePart2.seconds())
                          .tz(data.meeting_timeZone);
                        let diffFor2it=moment.duration(commonEnd.diff(mergedDateTime1)).asMinutes()
                        let diffFor2it1=moment.duration(mergedDateTime2.diff(commonStart)).asMinutes()
                        const isOverlap =
                          (commonStart.isSameOrBefore(mergedDateTime2) && commonEnd.isSameOrAfter(mergedDateTime2)) ||
                          (commonStart.isSameOrBefore(mergedDateTime1) && commonEnd.isSameOrAfter(mergedDateTime1)) ||
                          (mergedDateTime2.isSameOrBefore(commonStart) && mergedDateTime1.isSameOrAfter(commonEnd));
                      if(isOverlap){
                        flagForIt=true
                        let flagCheck=false
                        if(diffFor2it1>=duration){
                          commonEnd=mergedDateTime2
                          flagForIt=false
                          flagCheck=true
                        }
                        if(diffFor2it>=duration&&!flagCheck){
                          commonStart=mergedDateTime1
                          flagForIt=false
                        }
                      
                      }
                    }
                      let flagForCommonTime=false
                      if(morning){
                        if (commonStart.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(commonStart)).asMinutes() >=duration) {
                          flagForCommonTime=true
                        }
                      } 
                      if(evening){
                        if (commonStart.isSameOrAfter(moment(newMorningEveningTime)) && commonEnd.isAfter(moment(newMorningEveningTime))) {
                          flagForCommonTime=true
                        }
                      }
                      if(fullDay){
                        flagForCommonTime=true
                      }
                      if(fixedStart&&fixedEnd){
                        if (commonStart.isSameOrAfter(fixedStart) && commonEnd.isSameOrBefore(fixedEnd)) {
                          flagForCommonTime=true
                        }
                      }
                    if(commonSlotTime>=duration &&!groupIn.find(y=>y.name==x.group[0].name)&&flagForCommonTime&&!flagForIt){
                          groupIn.push(x.group[0])
                      
                      obj.commonSlot={'start':moment(commonStart),"end":moment(commonEnd)}
                      obj.group=groupIn
                      userGroup.push(obj);
                      slot.push(obj.commonSlot)
                      groupIn=[]
                      obj={}
                    // }
                    }
            });
            
        }
      })
      commonTimeForMax.maxUserGroup=userGroup;
      commonTimeForMax.commonSlot=slot;
}
let newFlagFor2
if(commonTimeForMax.maxUserGroup){
  newFlagFor2=commonTimeForMax.maxUserGroup.length>0
}
    return userGroups.length>0&&newFlagFor2?[userGroups,commonTimeForMax]:undefined;
  };
  
/********************************************* handling for getting best time slot when multiple groups have time slots  *************************/
const findCommonTimeAndUsers=(arr)=>{
const uniqueSlots = [];
const seenSlots = {};

arr[1].maxUserGroup.forEach(item => {
    const { start, end } = item.commonSlot;
    const slotKey = `${start}-${end}`;

    if (!seenSlots[slotKey]) {
        seenSlots[slotKey] = true;
        uniqueSlots.push(item);
    }
});

// console.log(uniqueSlots);
let min=Infinity,minArr=[]
for (let index = 0; index < uniqueSlots.length; index++) {
  const ele = uniqueSlots[index].group;
  for (let j = 0; j < ele.length; j++) {
    uniqueSlots[index].totalFree=uniqueSlots[index].totalFree?uniqueSlots[index].totalFree+ele[j].totalFreeTime:ele[j].totalFreeTime
    if(min>=ele[j].totalFreeTime){
        if(min>ele[j].totalFreeTime&&minArr.length)minArr=[]
        min=ele[j].totalFreeTime
        minArr.push(uniqueSlots[index])
    };
    
  }
}
let newMinArr
if(minArr. length>1){
  min=Infinity
  newMinArr=[]
  for (let j = 0; j < minArr.length; j++) {
  
      if(min>=minArr[j].totalFree){
          if(min>minArr[j].totalFree&&newMinArr.length)newMinArr=[]
          min=minArr[j].totalFree
          newMinArr.push(minArr[j])
      }; 
  }
  return newMinArr
}

return minArr
}


// if we have users in lessduration then we check previously selected time slot in this  
let findSlotLessDuration=(lessDur,resPre)=>{
let finalGroup,max=-Infinity,res
        for (let i = 0; i < resPre.length; i++) {
          const ele = resPre[i].commonSlot;
          finalGroup=[]
          for (let j = 0; j < lessDur.length; j++) {
              lessDur[j].freeMinutes.forEach(x=>{
                  let commonStart=moment.max(moment(ele.start),moment(x.start))
                  let commonEnd=moment.min(moment(ele.end),moment(x.end))
                  let commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()
                  if(commonSlotTime>0 &&!finalGroup.find(x=>x.name==lessDur[j].name)){
                        finalGroup.push(lessDur[j])
                  }
              })
              
          }
          if(max<finalGroup.length){
            max=finalGroup.length
            res=resPre[i]
          }
        }
        return res
}


let findClosestTime=(arr)=>{
    const targetDuration = duration
    let closestTimeSlot = null;
    let minDifference = Infinity;

    arr.forEach(userSchedule => {
      userSchedule.freeMinutes.forEach(slot => {
                const start = moment(slot.start);
                const end = moment(slot.end);
                const duration = moment.duration(end.diff(start)).asMinutes();

                const difference = Math.abs(duration - targetDuration);
                if (difference < minDifference) {
                    minDifference = difference;
                    closestTimeSlot = {start, end};
                }
          
        });
    });

function adjustTimeSlot(timeSlot) {
  const start = timeSlot.start.clone();
  const adjustedEndTime = start.clone().add(duration, 'minutes');
  return { start, end: adjustedEndTime };
}
if(morning){
  if (closestTimeSlot.start.isBefore(moment(newMorningEveningTime)) && closestTimeSlot.end.isSameOrBefore(fixedStart)) {
    
  }else{
    closestTimeSlot=null
  }
} 
if(evening){
  if (closestTimeSlot.start.isSameOrAfter(moment(newMorningEveningTime)) && closestTimeSlot.end.isAfter(moment(newMorningEveningTime))) {
    
  }else{
    closestTimeSlot=null
  }
}
if(fixedStart&&fixedEnd){
  if (closestTimeSlot.start.isSameOrAfter(fixedStart) && closestTimeSlot.end.isSameOrBefore(fixedEnd)) {
    
  }else{
    closestTimeSlot=null
  }
}
if (closestTimeSlot) {
  let sendMail= []
  users.forEach(x=>{sendMail.push(x.name)})
  return {
    group:[],
    commonSlot:adjustTimeSlot(closestTimeSlot),
    sendList:sendMail
  }
}
}

let res
const { fullDayBusyUsers, freeTimeUsers, lessThanDurationUsers } = filterUsers(users, duration);

if(fullDayBusyUsers.length==users.length){
return null
}

let commonFreeTimeSlotsGroups
    if(freeTimeUsers.length>0){
      commonFreeTimeSlotsGroups= findCommonFreeTimeSlotsGroup(freeTimeUsers);
    }

let slotAndUsers
    if(commonFreeTimeSlotsGroups){
      slotAndUsers=findCommonTimeAndUsers(commonFreeTimeSlotsGroups)
      res=slotAndUsers
    }
let final
    if (lessThanDurationUsers.length>0&&slotAndUsers) {
      final=findSlotLessDuration(lessThanDurationUsers,slotAndUsers)
      res=final
    }
let  closestFreeSlot
if(lessThanDurationUsers.length==users.length){
  closestFreeSlot=findClosestTime(lessThanDurationUsers)
  console.log(closestFreeSlot)
}
let finalUserList=new Set()
if(res){
  users.forEach(x=>{
    if(!Array.isArray(res))
      {
        if(!res.group.find(y=>y.name==x.name))finalUserList.add(x.name)
      }
    else{
      if(res.length>0){
      res=res[0]
      if(!res.group.find(y=>y.name==x.name))finalUserList.add(x.name)
    }else return null
    }
  })
  if(!Array.isArray(res)){
    res.sendList=[...finalUserList]
  }
  else{
    res=undefined
  }
}


return res?res:(closestFreeSlot?closestFreeSlot:null)
}
return freeSlotsResult
}
// FUNCTION TO FIND COMMON FREE SLOTS BETWEEN AUTH USERS ---END---


// FUNCTION TO AUTHORIZE USERS ---START---
async function authorizeGoogle(calendarIds) {
  // let client = await loadSavedCredentialsIfExist(calendarIds);
  // if (client) {
  //   console.log("User Already Authorized");
  //   return client;
  // }

  // const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

  
  let client_id="923376702287-vk1qrn95vda3s6k9053n3licg2pdcl7d.apps.googleusercontent.com";
  let client_secret="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";
  // let redirect_uris=["http://localhost:3000/dev/oauth2callback"];
  let redirect_uris=["https://ebmrnxlpk9.execute-api.eu-central-1.amazonaws.com/dev/oauth2callback"];

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris
  );

  // Generate an authentication URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: calendarIds, // Pass calendarIds as state
  });

  console.log("Authentication URL:----------------");
  console.log(authUrl);
  console.log("This authUrl will be sent to user via email");

  // Send the authorization URL to the user via email
  await sendAccessEmail(calendarIds, authUrl);

  // Perform any other actions as needed
  // (e.g., wait for user interaction, provide instructions)

  return true; // Indicate that authorization is pending
}
// FUNCTION TO AUTHORIZE USERS ---END---

// FUNCTION TO BLOCK THE USERS TIME SLOT ---START---
async function blockTimeSlot(
  meeting_timeZone,
  calendarIds,
  authArray,
  firstSlotStart,
  meetingEndTime,
  participants,
  jsonData
) {
  // const amsterdamTimeZone = 'Europe/Amsterdam';

  console.log(
    "All users are not available on the suitable time, blockTimeSlotHIT:-------------"
  );

  console.log("Participants:-------------")
  console.log(participants)
  console.log("calendarIds:-------------")
  console.log(calendarIds)

  const amsterdamTimeZone = meeting_timeZone;

  console.log()

  function convertToAmsterdamTime(utcTimeString) {
    return moment.utc(utcTimeString).tz(amsterdamTimeZone).format();
  }

  // Convert each meeting time to Amsterdam time zone
  const firstSlotStartAmsterdam = convertToAmsterdamTime(firstSlotStart);
  const meetingEndTimeAmsterdam = convertToAmsterdamTime(meetingEndTime);

  const availableUsersArray = authArray.filter((item) =>
    calendarIds.includes(item.calendarId)
  );

  console.log("availableUsersArray:------------")
  console.log(availableUsersArray)

  const summary = "Blocked Time";

  const event = {
    id: "1",
    subject: summary,
    start: {
      dateTime: firstSlotStartAmsterdam,
      timeZone: amsterdamTimeZone,
    },
    end: {
      dateTime: meetingEndTimeAmsterdam,
      timeZone: amsterdamTimeZone,
    },
    // showAs: "busy",
    categories: ["busy"],
  };

  const responseBlock = await Promise.all(
    availableUsersArray.map(async (client, index) => {
      try {
        // Make the API call to get free/busy information for the user
        const freeBusy = await client
          .api("/me/events")
          .version("v1.0")
          .post(event);

        // console.log("freeBusy:--------")
        // console.log(freeBusy)

        return freeBusy;
      } catch (error) {
        console.error("Error fetching free/busy data:", error);
        return null; // or handle error as needed
      }
    })
  );

  // console.log("responseBlock:------------")
  // console.log(responseBlock)

  // Extracting id and organizer for each event
  // const userIDOrganizer = responseBlock.map(event => ({
  //   id: event.id,
  //   organizer: event.organizer.emailAddress.name // or event.organizer.emailAddress.address for email
  // }));

  const userIDOrganizer = responseBlock.map((event) => ({
    meetingId: event.id,
    organizerEmail: event.organizer.emailAddress.address, // or event.organizer.emailAddress.address for email
  }));

  console.log("userIDOrganizer:------------")
  console.log(userIDOrganizer)




// function blockTimeData(participants, userIDOrganizer) {
//   const newArray = [];
//   participants.forEach(participant => {
//     userIDOrganizer.forEach(user => {
//       if (participant.email == user.organizerEmail) {
//         newArray.push({
//           calendar_meeting_id: user.meetingId,
//           user_id: participant.user_id,
//           meeting_id: jsonData.meeting_id
//         });
//       }
//     });
//   });
//   return newArray;
// }
function blockTimeData(participants, userIDOrganizer) {
  return userIDOrganizer
    .map(user => ({
      organizerEmail: user.organizerEmail,
      meetingId: user.meetingId
    }))
    .filter(userInfo => participants.some(participant => participant.email === userInfo.organizerEmail))
    .map(userInfo => ({
      calendar_meeting_id: userInfo.meetingId,
      user_id: participants.find(participant => participant.email === userInfo.organizerEmail).user_id,
      meeting_id: jsonData.meeting_id // Assuming jsonData is accessible
    }));
}



// Call the function
// const blockTimeID = await blockTimeData(participants, userIDOrganizer);
const blockTimeID = userIDOrganizer
  .filter(user => participants.some(participant => participant.email.toLowerCase() == user.organizerEmail.toLowerCase()))
  .map(user => ({
    calendar_meeting_id: user.meetingId,
    user_id: participants.find(participant => participant.email.toLowerCase() == user.organizerEmail.toLowerCase()).user_id,
    meeting_id: jsonData.meeting_id // Assuming jsonData is accessible
  }));

console.log("blockTimeID:-------------");
console.log(blockTimeID);
return blockTimeID;
  
}
// FUNCTION TO BLOCK THE USERS TIME SLOT ---END---
// FUNCTION TO AUTHORIZE USERS ---START---
async function authorize(calendarIds) {
  // let client = await loadSavedCredentialsIfExist(calendarIds);
  // if (client) {
  //   console.log("User Already Authorized");
  //   return client;
  // }

  // const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

  
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientID}&response_type=code&redirect_uri=${process.env.API_URL}/outh2CallBackPassport&response_mode=query&scope=user.read%20Calendars.ReadWrite%20offline_access`;


  console.log("Authentication URL:----------------");
  console.log(authUrl);
  console.log("This authUrl will be sent to user via email");

  // Send the authorization URL to the user via email
  await sendAccessEmail(calendarIds, authUrl);

  // Perform any other actions as needed
  // (e.g., wait for user interaction, provide instructions)

  return true; // Indicate that authorization is pending
}
// FUNCTION TO AUTHORIZE USERS ---END---

async function outh2CallBackGoogle(data){


  console.log("outh2CallBack");
  console.log(data);


  const { code, state } = data;

  console.log("code:-------");
  console.log(code);
  console.log(
    "state(optional parameter it contains the users email address):-------------"
  );
  console.log(state);

  let client_id="923376702287-vk1qrn95vda3s6k9053n3licg2pdcl7d.apps.googleusercontent.com";
  let client_secret="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";
  // let redirect_uris=["http://localhost:3000/dev/oauth2callback"];
  let redirect_uris=["https://ebmrnxlpk9.execute-api.eu-central-1.amazonaws.com/dev/oauth2callback"];

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris
  );



  // console.log("oAuth2Client: " + oAuth2Client)

  try {
    const tokens = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(tokens);

    console.log("tokens:-----------");
    console.log(tokens)
    console.log(tokens.tokens.refresh_token);
    if(tokens.tokens.refresh_token){
      let userUpdate=await updateUser(state,{"access_status":3,"is_verified":1,"refresh_token":tokens.tokens.refresh_token})
      let returnData = {
        body: JSON.stringify({
          "message": "Authorization Successfull.",
          "code": 200,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };
      // await knex.destroy();
      return returnData;
    }
    else{
      let returnData = {
        body: JSON.stringify({
          "message": "Something went wrong.",
          "code": 200,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };
      // await knex.destroy();
      return returnData;
    }
    // tokens.tokens.refresh_token

    // await saveCredentials(tokens, state);
    // await saveCredentials(tokens);

    // Redirect or respond with a success message
    console.log("authentication successful");
  } catch (error) {
    console.error("Error retrieving access token", error);
    // Redirect or respond with an error message

  }


 

}
async function outh2CallBackPassport(data){


  console.log("outh2CallBack passport called");
  console.log(data);


  // let client_id="923376702287-vk1qrn95vda3s6k9053n3licg2pdcl7d.apps.googleusercontent.com";
  // let client_secret="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";
  // let redirect_uris=["http://localhost:3000/dev/oauth2callback"];
  // let redirect_uris=["http://localhost:3000/auth/microsoft"];
  let redirect_uris=[`${process.env.API_URL}/outh2CallBackPassport`];


  const client_id = "3ec6c363-e8f7-4460-bc3d-5bb3bc3629ac";
const client_secret = "O2z8Q~AMO7ek8zQTlz-golvNn~NksdhujeW4Yajm";
const tenantID = "f8cdef31-a31e-4b4a-93e4-5f571e91255a";

  // let redirect_uris=["https://ebmrnxlpk9.execute-api.eu-central-1.amazonaws.com/dev/oauth2callback"];
try {


  async function getTokens(authorizationCode) {
    console.log("getToken called");
    const tokenEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
    const clientId = client_id;
    const clientSecret = client_secret;
    const redirectUri = redirect_uris;
  
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: authorizationCode,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      scope: "user.read", // Requesting the refresh token
    });
    
    try {
      const response = await axios.post(
        tokenEndpoint,
        params.toString(), // Convert URLSearchParams to string
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      
      console.log(response.data); // Output token response
      
      // Return the access token and refresh token
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      console.error("Error:", error.message);
      throw error; // Re-throw the error to handle it outside of this function
    }
  }
  

  


const tokens = await getTokens(data.code);
console.log("Access Token:", tokens.accessToken);
console.log("Refresh Token:", tokens.refreshToken);
const email = await getUserProfile(tokens.accessToken);
console.log("User's Email:", email);

if(tokens.refreshToken && tokens.accessToken && email){
  let expireDate = new Date(new Date().getTime() + tokens.expiresIn * 1000)
  expireDate.toISOString()
  let userUpdate=await updateUser(email,{"access_status":3,"is_verified":1,"access_token":tokens.accessToken,"refresh_token":tokens.refreshToken,"token_expires_at":expireDate})
  let returnData = {
    body: JSON.stringify({
      "message": "Authorization Successfull.",
      "code": 200,
      "data": []
    }),
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "content-type": "text/plain"
    },
    statusCode: 200
  };
  // await knex.destroy();
  return returnData;
}
else{
  let returnData = {
    body: JSON.stringify({
      "message": "Something went wrong.",
      "code": 200,
      "data": []
    }),
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "content-type": "text/plain"
    },
    statusCode: 200
  };
  // await knex.destroy();
  return returnData;
}



// console.log(passport)


  
} catch (error) {
  console.log("error in passport");
  console.log(error);
  let returnData = {
    body: JSON.stringify({
      "message": "Something went wrong.",
      "code": 200,
      "data": []
    }),
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "content-type": "text/plain"
    },
    statusCode: 200
  };
  // await knex.destroy();
  return returnData;
}
}
async function outh2CallBack(data){


  console.log("outh2CallBack");
  console.log(data);

  passport.use(
    new MicrosoftStrategy(
      {
        clientID: clientID,
        clientSecret: clientSecret,
        // callbackURL: "http://localhost:3000/auth/redirect",
  
        callbackURL: process.env.API_URL+"/outh2CallBackPassport",
        scope: ["user.read", "Calendars.ReadWrite", "offline_access"],
        tenant: "common",
        authorizationURL:
          "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      },
      async function (accessToken, refreshToken, profile, done) {
        console.log("Token Response: ", {
          accessToken: accessToken,
          refreshToken: refreshToken,
          profile: profile,
        });
  
        const userEmail = profile.userPrincipalName;
  
        console.log("userEmail:---------");
        console.log(userEmail);
  console.log('calling the save credentials');
  console.log(accessToken)
  console.log(refreshToken)
  console.log(userEmail)
        // await saveCredentials(accessToken, refreshToken, userEmail);
  
        return done(null, profile);
      }
    )
  );


  // console.log("oAuth2Client: " + oAuth2Client)

  try {
    const tokens = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(tokens);

    console.log("tokens:-----------");
    console.log(tokens)
    console.log(tokens.tokens.refresh_token);
    if(tokens.tokens.refresh_token){
      let userUpdate=await updateUser(state,{"access_status":3,"is_verified":1,"refresh_token":tokens.tokens.refresh_token})
      let returnData = {
        body: JSON.stringify({
          "message": "Authorization Successfull.",
          "code": 200,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };
      // await knex.destroy();
      return returnData;
    }
    else{
      let returnData = {
        body: JSON.stringify({
          "message": "Something went wrong.",
          "code": 200,
          "data": []
        }),
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "content-type": "text/plain"
        },
        statusCode: 200
      };
      // await knex.destroy();
      return returnData;
    }
    // tokens.tokens.refresh_token

    // await saveCredentials(tokens, state);
    // await saveCredentials(tokens);

    // Redirect or respond with a success message
    console.log("authentication successful");
  } catch (error) {
    console.error("Error retrieving access token", error);
    // Redirect or respond with an error message

  }


 

}
async function getUserProfile(accessToken) {
  const profileEndpoint = "https://graph.microsoft.com/v1.0/me";

  try {
    const response = await axios.get(profileEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Extract and return the email ID from the profile data
    return response.data.mail || response.data.userPrincipalName;
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    throw error;
  }
}
async function outh2CallBackTest(code){


  console.log("outh2CallBack");
  console.log(code);


  
  console.log("code:-------");
  console.log(code);
  console.log(
    "state(optional parameter it contains the users email address):-------------"
  );

  let client_id="923376702287-vk1qrn95vda3s6k9053n3licg2pdcl7d.apps.googleusercontent.com";
  let client_secret="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";
  // let redirect_uris=["http://localhost:3000/dev/oauth2callback"];
  let redirect_uris=["https://ebmrnxlpk9.execute-api.eu-central-1.amazonaws.com/dev/oauth2callback"];

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris
  );



  // console.log("oAuth2Client: " + oAuth2Client)

  try {
    const tokens = await oAuth2Client.getToken(code);
    console.log("tokens");
    console.log(tokens)
    await oAuth2Client.setCredentials(tokens);

    console.log("tokens:-----------");
    console.log(tokens)
    console.log(tokens.tokens.refresh_token);
  
    // tokens.tokens.refresh_token

    // await saveCredentials(tokens, state);
    // await saveCredentials(tokens);

    // Redirect or respond with a success message
    console.log("authentication successful");
  } catch (error) {
    console.error("Error retrieving access token", error);
    // Redirect or respond with an error message

  }


 

}
async function updateUser(emailId,data) {
  const knex = require('knex')(connection);
  console.log(data);

  try {

    let updateObject = {
      last_updated: await getDate() // Assuming this function returns the current date
    };
    
    // Add properties to the update object only if they are present in the data object
    if (data.access_status) updateObject.access_status = 3;
    if (data.is_verified) updateObject.is_verified = data.is_verified;
    if (data.access_token) updateObject.access_token = data.access_token;
    if (data.refresh_token) updateObject.refresh_token = data.refresh_token;
    if (data.token_expires_at) updateObject.token_expires_at = data.token_expires_at;
    
    let meetingUpdate = await knex(USER).update(updateObject).where("email", emailId);
        console.log("userInsert")
    console.log(meetingUpdate)
    if (meetingUpdate) {
      await knex.destroy();
      return true;
    } else {
      await knex.destroy();
      return false;
    }
  } catch (error) {
    console.log(error)
  }
}
async function notifyAdmin(meetingId,type){

  let meetingData=await getSingleMeetingData(meetingId);
  console.log(meetingData);
  meetingData=meetingData[0];

  let username="";
try {
  const email="llita6005@gmail.com";

  const nodemailer = require('nodemailer');
  let mailTransporter =
    nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                // user: 'eldon.carty@gmail.com',
                // pass: "dxxz rgot djnh rrjm"
                user: 'ethanwick7336@gmail.com',
                pass: "mvaw dnpz tlbf xvqq"
            }
        }
    );
let compiledTemplate="";
const meetingString =`Start Time: ${meetingData.scheduled_start_time} \n` +
`End Time: ${meetingData.scheduled_end_time}`;

    if(type==1){
       compiledTemplate = meetingConfirmationEmailTemplate.replace('<%= username %>', username)
      .replace('<%= meetingTime %>', meetingString)
      .replace('<%= meetingName %>', meetingData.meeting_title)
      .replace('<%= meetingDate %>', meetingData.scheduled_date);
    }
    else if(type==2){
       compiledTemplate = meetingFailedEmailTemplate.replace('<%= username %>', username)
      .replace('<%= meetingName %>', meetingData.meeting_title)
      .replace('<%= meetingDate %>', meetingData.start_date);


    
    
    }
 
let mailDetails = {
    from: 'ethanwick7336@gmail.com',
    to: email,
    subject: 'Scheduling App meeting information',
    // text: 'Node.js testing mail for GeeksforGeeks'
    html:compiledTemplate
};
 
// mailTransporter
//     .sendMail(mailDetails,
//         function (err, data) {
//             if (err) {
//                 console.log('Error Occurs');
//                 console.log(err)
//             } else {
//                 console.log('Email sent successfully');
//             }
//         });
     

      // Wait for nodemailer to send the email before proceeding
      await mailTransporter.sendMail(mailDetails);

  
} catch (error) {
  console.log("error in email");
  console.log(error)
}
}

// FUNCTION TO GENERATE THE FREE LOGS ---START---
async function dataForLogs(
  startTime,
  endTime,
  busySlots,
  jsonData,
  calendarIds,
  optionalUsersEmails,
  meeting_timeZone,
  currentTime
) {
  console.log("dataForLogsHit:--------------");

  const busySlotsFlat = busySlots.flat();

  // console.log("startTime:------------");
  // console.log(startTime);
  // console.log("endTime:------------");
  // console.log(endTime);

  // console.log("busySlotsFlat:----------")
  // console.log(busySlotsFlat)
  // const a = JSON.stringify(busySlotsFlat);
  // console.log(a);

  const meetings = busySlotsFlat.map((slot) => {
    const formattedSlots = slot.scheduleItems.map((item) => ({
      start: item.start.dateTime,
      end: item.end.dateTime,
    }));
    return {
      [slot.scheduleId]: formattedSlots,
    };
  });

  // console.log("meetings:------------")
  // console.log(meetings)

  const amsterdamTimeZone = meeting_timeZone;

  function convertToAmsterdamTime(utcDateTime) {
    return moment.utc(utcDateTime).tz(amsterdamTimeZone).format();
  }

  // Map through meetings array and convert start and end times to Amsterdam timezone
  const busyPeriods = meetings.map((meeting) => {
    const updatedMeeting = {};
    for (const key in meeting) {
      updatedMeeting[key] = meeting[key].map((slot) => ({
        start: convertToAmsterdamTime(slot.start),
        end: convertToAmsterdamTime(slot.end),
      }));
    }
    return updatedMeeting;
  });

  //   console.log("busyPeriods:------------");
  // console.log(busyPeriods);
  // const a = JSON.stringify(busyPeriods);
  // console.log(a);

  // Function to calculate free time slots for a user
  function calculateFreeSlots(busySlots) {
    const workingHoursStart = new Date(startTime);
    const workingHoursEnd = new Date(endTime);
    if (busySlots.length === 0) {
      // If there are no busy slots, the entire working period is free
      return [
        {
          start: workingHoursStart.toISOString(),
          end: workingHoursEnd.toISOString()
        }
      ];
    }

    // Grouping busy slots by day
    const groupedSlots = busySlots.reduce((acc, slot) => {
      const startDate = new Date(slot.start).toDateString();
      if (!acc[startDate]) {
        acc[startDate] = [];
      }
      acc[startDate].push(slot);
      return acc;
    }, {});

    const freeSlots = [];

    // Process each day's busy slots
    for (const [day, slots] of Object.entries(groupedSlots)) {
      const dailyWorkingHoursStart = new Date(
        `${day} ${workingHoursStart.getHours()}:${workingHoursStart.getMinutes()}`
      );
      const dailyWorkingHoursEnd = new Date(
        `${day} ${workingHoursEnd.getHours()}:${workingHoursEnd.getMinutes()}`
      );

      // Sort busy slots by start time
      slots.sort((a, b) => new Date(a.start) - new Date(b.start));

      let prevEndTime = dailyWorkingHoursStart;

      for (const slot of slots) {
        const busyStartTime = new Date(slot.start);
        const busyEndTime = new Date(slot.end);

        // Check for a gap
        if (busyStartTime > prevEndTime) {
          freeSlots.push({
            start: prevEndTime.toISOString(),
            end: busyStartTime.toISOString(),
          });
        }
        // Update the previous end time
        prevEndTime = busyEndTime > prevEndTime ? busyEndTime : prevEndTime;
      }

      // After last slot of the day
      if (prevEndTime < dailyWorkingHoursEnd) {
        freeSlots.push({
          start: prevEndTime.toISOString(),
          end: dailyWorkingHoursEnd.toISOString(),
        });
      }
    }
    return freeSlots.filter((slot) => {
      const slotStartTime = new Date(slot.start).getTime();
      const slotEndTime = new Date(slot.end).getTime();
      return (
        slotStartTime >= workingHoursStart.getTime() &&
        slotEndTime <= workingHoursEnd.getTime()
      );
    });
  }

  // Function to calculate free time slots for all users
  function calculateFreeTimeForAllUsers(busyPeriods) {
    const freeTimeSlots = [];

    for (const user of busyPeriods) {
      const userEmail = Object.keys(user)[0];
      const busySlots = user[userEmail];
      const freeSlots = calculateFreeSlots(busySlots);
      freeTimeSlots.push({ [userEmail]: freeSlots });
    }

    return freeTimeSlots;
  }

  const freeTimeSlots = calculateFreeTimeForAllUsers(busyPeriods);

  function convertTimeToTimeZone(freeTimeSlots, timeZone) {
    // const a = JSON.stringify(freeTimeSlots)
    // console.log(a)
    const convertedSlots = [];

    for (const user of freeTimeSlots) {
      const userEmail = Object.keys(user)[0];
      const slots = user[userEmail];
      const convertedUserSlots = slots.map((slot) => {
        const startMoment = moment(slot.start);
        const endMoment = moment(slot.end);
        const convertedStart = startMoment.tz(timeZone).format();
        const convertedEnd = endMoment.tz(timeZone).format();
        return { start: convertedStart, end: convertedEnd };
      });
      convertedSlots.push({ [userEmail]: convertedUserSlots });
    }

    return convertedSlots;
  }

  const convertedFreeTimeSlots = convertTimeToTimeZone(
    freeTimeSlots,
    amsterdamTimeZone
  );

  function groupDataByDate(data) {
    const groupedData = {};

    for (const user of data) {
      for (const [email, slots] of Object.entries(user)) {
        for (const slot of slots) {
          const date = slot.start.split("T")[0]; // Extracting date from start time
          if (!groupedData[date]) {
            groupedData[date] = {};
          }
          if (!groupedData[date][email]) {
            groupedData[date][email] = [];
          }
          groupedData[date][email].push({ start: slot.start, end: slot.end });
        }
      }
    }

    // Convert the groupedData object to the desired array format
    const result = [];
    for (const date in groupedData) {
      const slots = [];
      for (const email in groupedData[date]) {
        slots.push({ [email]: groupedData[date][email] });
      }
      result.push({ date, slots });
    }

    return result;
  }

  const freeSlotsByDate = groupDataByDate(convertedFreeTimeSlots);



  if (freeSlotsByDate.length === 0) {
    return null;
  }

  // console.log("jsonData:----------")
  // console.log(jsonData)

  const {participants } = jsonData

  // console.log("participants:----------")
  // console.log(participants)

  // console.log("freeSlotsByDate:-------------")
  // console.log(freeSlotsByDate)

  const participantsMap = participants.reduce((map, participant) => {
    map[participant.email] = participant;
    return map;
  }, {});

  const enrichedSlotsByDate = freeSlotsByDate.map(dateEntry => {
    return {
      ...dateEntry,
      slots: dateEntry.slots.map(slot => {
        const email = Object.keys(slot)[0];
        const times = slot[email];
        const participant = participantsMap[email];
  
        if (participant) {
          return {
            email,
            user_id: participant.user_id,
            name: participant.name,
            times
          };
        } else {
          return slot;
        }
      })
    };
  });

  // console.log("enrichedSlotsByDate:-------------")
  // console.log(enrichedSlotsByDate)


  function convertToAmsterdamTime(utcTimeString) {
    return moment.utc(utcTimeString).tz(amsterdamTimeZone).format();
  }

  // Convert each meeting time to Amsterdam time zone
  let currentTimeInTimeZone = convertToAmsterdamTime(currentTime);

  const enrichedSlotsByDateWithTime = {
    generated_at: currentTimeInTimeZone,
    slots: enrichedSlotsByDate // Your logic to enrich slots by date
  };
  
  const dataForLogsOutput = {
    freeSlotsByDate: freeSlotsByDate,
    enrichedSlotsByDateWithTime:enrichedSlotsByDateWithTime
  }

  // console.log("dataForLogsOutput:-----------")
  // console.log(dataForLogsOutput)

  return dataForLogsOutput;
}
// FUNCTION TO GENERATE THE FREE LOGS ---END---

// FUNCTION TO FIND THE COMMON FREE SLOTS FOR USERS ---START---
async function findCommonFreeTimeSlots(logData, meeting_timeZone,jsonData, currentTime) {
  if (!logData || logData.length === 0) {
    return "No free slot(s) available for the participants, so can't get the common free slot(s)";
  }

  const commonSlots = [];
  logData.forEach((day) => {
    const date = day.date;
    const userSlots = day.slots.map((userSlot) => Object.entries(userSlot)[0]);

    let allSlots = [];
    userSlots.forEach((slots) => {
      const user = slots[0];
      slots[1].forEach((slot) => {
        allSlots.push({
          user,
          start: moment(slot.start),
          end: moment(slot.end),
        });
      });
    });

    allSlots.sort((a, b) => a.start - b.start);

    let commonSlot = null;
    let commonUsers = new Set();
    for (let i = 1; i < allSlots.length; i++) {
      if (allSlots[i].start.isBefore(allSlots[i - 1].end)) {
        const overlapStart = moment.max(
          allSlots[i].start,
          allSlots[i - 1].start
        );
        const overlapEnd = moment.min(allSlots[i].end, allSlots[i - 1].end);
        if (commonSlot && overlapStart.isSameOrBefore(commonSlot.end)) {
          commonSlot.end = moment.max(commonSlot.end, overlapEnd);
          commonUsers.add(allSlots[i].user);
          commonUsers.add(allSlots[i - 1].user);
        } else {
          if (commonSlot) {
            commonSlots.push({
              slot: commonSlot,
              users: Array.from(commonUsers),
            });
            commonUsers.clear();
          }
          commonSlot = { start: overlapStart, end: overlapEnd };
          commonUsers.add(allSlots[i].user);
          commonUsers.add(allSlots[i - 1].user);
        }
      }
    }
    if (commonSlot)
      commonSlots.push({ slot: commonSlot, users: Array.from(commonUsers) });
  });

  console.log("commonSlots");
  console.log(commonSlots)
  const commonFreeSlots = commonSlots.map((entry) => ({
    start: entry.slot.start.tz(meeting_timeZone).format(),
    end: entry.slot.end.tz(meeting_timeZone).format(),
    users: entry.users,
  }));

  if (commonFreeSlots.length === 0) {
    return "No common free time slot(s) found for the selected participants";
  }
  const { participants } = jsonData

  // console.log("commonFreeSlots:--------")
  // console.log(commonFreeSlots)
  // const C = JSON.stringify(commonFreeSlots)
  // console.log(C)

  // console.log("participants:-------------")
  // console.log(participants)

  const participantsMap = participants.reduce((map, participant) => {
    map[participant.email] = participant;
    return map;
  }, {});
  
  const commonFreeSlotsWithNameAndID = commonFreeSlots.map(slot => {
    return {
      ...slot,
      users: slot.users.map(email => {
        const participant = participantsMap[email];
        return participant ? { email, user_id: participant.user_id, name: participant.name } : { email };
      })
    };
  });

  // console.log("commonFreeSlotsWithNameAndID:-------------")
  // console.log(commonFreeSlotsWithNameAndID)
  // const E = JSON.stringify(commonFreeSlotsWithNameAndID)
  // console.log(E)

  function convertToAmsterdamTime(utcTimeString) {
    return moment.utc(utcTimeString).tz(meeting_timeZone).format();
  }

  // Convert each meeting time to Amsterdam time zone
  let currentTimeInTimeZone = convertToAmsterdamTime(currentTime);

  const commonFreeTimeSlotsOutput = {
      generated_at: currentTimeInTimeZone,
      slots: commonFreeSlotsWithNameAndID // Your logic to enrich slots by date
  }

  

  return commonFreeTimeSlotsOutput;
}
// FUNCTION TO FIND THE COMMON FREE SLOTS FOR USERS ---END---

module.exports = {
  adminLogin,
  getUsers,
  addUser,
  updateUser,
  addMeeting,
  getMeetings,
  saveCurrentSelectionForMeeting,
  sendAccessRequestEmail,
  adminLoginTest,
  outh2CallBack,
  outh2CallBackPassport,
  getCategories
};