
// REQUIRED NODE.JS MODULES ---START--- 
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { promises as fs } from "fs";
import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import env from "dotenv";
import moment from "moment";
import momentTZ from 'moment-timezone';
// REQUIRED NODE.JS MODULES ---END---


// EXPRESS SERVER SETUP ---START---
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
env.config();
// EXPRESS SERVER SETUP ---END---


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
    const content = await fs.readFile(TOKEN_PATH);
    const savedCredentials = JSON.parse(content);

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


// FUNCTION TO SAVE USERS CREDENTIALS AFTER SUCCESSFUL AUTHENTICATION ---START---
async function saveCredentials(tokens, userEmail) {
  try {
    // Check if TOKEN_PATH file exists, if not, create an empty array
    let savedCredentials = [];
    try {
      const content = await fs.readFile(TOKEN_PATH);
      savedCredentials = JSON.parse(content);
    } catch (error) {
      // If file does not exist or cannot be parsed, continue with an empty array
      console.error("Error reading TOKEN_PATH:", error.message);
    }

    const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
    const key = keys.installed || keys.web;

    const newCredentials = {
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: tokens.tokens.refresh_token,
      user_email: userEmail,
    };

    // Check if credentials for the user already exist, update if so, otherwise add new credentials
    const index = savedCredentials.findIndex(
      (cred) => cred.user_email === userEmail
    );

    if (index !== -1) {
      savedCredentials[index] = newCredentials;
    } else {
      savedCredentials.push(newCredentials);
    }

    const payload = JSON.stringify(savedCredentials);

    await fs.writeFile(TOKEN_PATH, payload);

    console.log(`Credentials saved for ${userEmail}`);
  } catch (err) {
    console.error("Error saving credentials:", err.message);
    throw err;
  }
}
// FUNCTION TO SAVE USERS CREDENTIALS AFTER SUCCESSFUL AUTHENTICATION ---END---


// EMAIL AND APP PASSWORD FOR THE ACCOUNT WHICH SEND AUTH EMAILS TO THE USERS ---START---
const user_name = process.env.USERNAME;
const app_pass = process.env.APPPASS;
// EMAIL AND APP PASSWORD FOR THE ACCOUNT WHICH SEND AUTH EMAILS TO THE USERS ---END---


// FUNCTION TO SEND AUTH EMAIL TO NEW USERS ---START---
async function sendAuthorizationEmail(calendarIds, authUrl) {
  console.log("sendAuthorizationEmail hit--------");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user_name,
      pass: app_pass,
    },
  });

  const htmlContent = `
    <html>
      <head>
        <title>Authorization Link</title>
      </head>
      <body>
        <p>Click the following link to authorize the Google Calendar API:</p>
        <a href="${authUrl}" target="_blank">click here</a>
      </body>
    </html>
  `;

  const mailOptions = {
    from: user_name,
    to: calendarIds,
    subject: "Authorize Google Calendar API",
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Authentication Email Send Successfully");
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // Rethrow the error to be caught in the calling function
  }
}
// FUNCTION TO SEND AUTH EMAIL TO NEW USERS ---END---


// FUNCTION TO AUTHORIZE USERS ---START---
async function authorize(calendarIds) {
  let client = await loadSavedCredentialsIfExist(calendarIds);
  if (client) {
    console.log("User Already Authorized");
    return client;
  }

  const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

  const { client_secret, client_id, redirect_uris } = credentials.web;
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

  // Send the authorization URL to the user via email
  await sendAuthorizationEmail(calendarIds, authUrl);

  // Perform any other actions as needed
  // (e.g., wait for user interaction, provide instructions)

  return null; // Indicate that authorization is pending
}
// FUNCTION TO AUTHORIZE USERS ---END---


// FUNCTION TO SCHEDULE MEETING BETWEEN AUTH USERS ---START---
async function scheduleMeeting(
  authArray,
  calendarIds,
  summary,
  description,
  startTime,
  endTime,
  meetingLocation,
  meetingDuration,
  jsonData,
  meeting_timeZone
) {

  console.log("scheduleMeetingStartTime:---------")
  console.log(startTime)
  console.log("scheduleMeetingEndTime:-------------")
  console.log(endTime)

  const timeZone = meeting_timeZone
  // Check if the selected day is between Monday to Friday
  const startDay = startTime.getDay();
  const endDay = endTime.getDay();
  const isWeekday =
    startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

  if (!isWeekday) {
    console.log("Meeting can only be scheduled from Monday to Friday.");
    return false; // Indicate failure
  }

  // Check if the selected time is between 9:30 am to 6:30 pm
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const startMinutes = startTime.getMinutes();
  const endMinutes = endTime.getMinutes();


  const scheduleJsonData = jsonData

  const calendars = authArray.map((auth, index) => {
    return google.calendar({ version: "v3", auth });
  });

  const freeBusyResponses = await Promise.all(
    calendars.map((calendar, index) => {
      return calendar.freebusy.query({
        auth: authArray[index],
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          // timeMin: startTime,
          // timeMax: endTime,
          // timeZone: "Asia/Kolkata",
          timeZone: timeZone,
          items: [{ id: calendarIds[index] }],
        },
      });
    })
  );

  const busySlotsArray = freeBusyResponses.map((response) => {
    if (response && response.data && response.data.calendars) {
      return response.data.calendars;
    } else {
      console.log("Error processing freeBusy response:", response);
      return null;
    }
  });

  let commonFreeSlots;

  // Ensure that all responses were valid
  if (busySlotsArray.every((slots) => slots !== null)) {
    // Calculate common free slots
    commonFreeSlots = calculateCommonFreeSlots(
      startTime,
      endTime,
      busySlotsArray,
      scheduleJsonData
    );

    // Continue with the rest of your code...
  } else {
    console.log("Error processing freeBusy responses. Aborting scheduling.");
    return false;
  }

  // Minimum duration required for the meeting
  const minimumMeetingDuration = meetingDuration * 60 * 1000;

  let suitableSlots;

  let suitableFreeSlot = commonFreeSlots?commonFreeSlots.map(element => element.commonSlot):null

  console.log("suitableFreeSlot:-----------")
  console.log(suitableFreeSlot)

if(suitableFreeSlot){
  // Filter common free slots that are long enough for the meeting
  suitableSlots = suitableFreeSlot.filter((slot) => {
    const slotDuration =
      new Date(slot.end).getTime() - new Date(slot.start).getTime();
    return slotDuration >= minimumMeetingDuration;
  });
}else {
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
      

      
      // console.log("firstSlot:---------")
      // console.log(firstSlot)
      // const firstSlotStart = new Date(firstSlot.start)

      console.log("firstSlotStart:--------")
      console.log(firstSlotStart)

      console.log("meetingEndTime:----------")
      console.log(meetingEndTime)
  
      // console.log("meetingEndTime:------------")
      // console.log(meetingEndTime)
  
     
      const event = {
        summary,
        location: meetingLocation,
        description,
        start: {
          // dateTime: firstSlot.start,
          dateTime: firstSlotStart,
          // timeZone: "Asia/Kolkata",
          timeZone: timeZone,
        },
        end: {
          // dateTime: meetingEndTime.toISOString(),
          dateTime: meetingEndTime,
          // timeZone: "Asia/Kolkata",
          timeZone: timeZone,
        },
      };
  
      // for (const calendarId of calendarIds) {
      //   const calendarIndex = calendarIds.indexOf(calendarId);
      //   await calendars[calendarIndex].events.insert({
      //     auth: authArray[calendarIndex],
      //     calendarId: calendarId,
      //     resource: event,
      //   });
      // }


      for (const calendarId of calendarIds) {
        const calendarIndex = calendarIds.indexOf(calendarId);
        await calendars[calendarIndex].events.insert({
          auth: authArray[calendarIndex],
          calendarId: 'primary',
          resource: event,
        });
      }

      const scheduleTimeStart = moment.tz(firstSlotStart, timeZone).format('DD/MM/YYYY HH:mm');
      const scheduleTimeEnd = moment.tz(meetingEndTime, timeZone).format('DD/MM/YYYY HH:mm');

      console.log(`Meeting scheduled for ${scheduleTimeStart} to ${scheduleTimeEnd}`);

      return true; // Indicate success
    } else {
      console.log("No suitable free slots found for the meeting.");
      return false; // Indicate failure
    }
  }else{

    const formattedSlots = suitableFreeSlot.map(slot => {
  return {
    start: slot.start.format('DD/MM/YYYY HH:mm'),
    end: slot.end.format('DD/MM/YYYY HH:mm')
  };
});

    console.log("No common free sots found between the users, send Email to the email address ")
    console.log(sendListArray)
    console.log("Suitable time slot for meeting is ")
    console.log(formattedSlots)
  }
}
// FUNCTION TO SCHEDULE MEETING BETWEEN AUTH USERS ---END---


// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
function calculateCommonFreeSlots(startTime, endTime, busySlots, jsonData) {
  const busyPeriods = busySlots.map((obj) => {
    const email = Object.keys(obj)[0];
    const busy = Object.values(obj)[0].busy;
    return { [email]: busy };
  });

  console.log("busyPeriods:---------")
  console.log(busyPeriods)
  const a = JSON.stringify(busyPeriods)
  console.log(a)

  const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods, jsonData);

  return commonFreeSlots;
}
// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---END---


// FUNCTION TO FIND COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
function findCommonFreeSlots(startTime, endTime, busyPeriods, jsonDataFormate) {
  let data = jsonDataFormate;
  let users = busyPeriods;

moment.tz.setDefault(data.meeting_timeZone);
let freeSlotsResult = []
  
var startDate = moment(data.start_date).tz(data.meeting_timeZone);
var endDate = moment(data.end_date).tz(data.meeting_timeZone);

// Array to store the dates in between
var datesInBetween = [];
// Current date to start iteration
var currentDate = startDate.clone();

// Iterate through dates
while (currentDate.isSameOrBefore(endDate)) {
    datesInBetween.push(currentDate.format('YYYY-MM-DD'));
    currentDate.add(1, 'days');
}

// Group events by date
users.forEach(x=>{
  let userEmail=Object.keys(x)[0]
  let eventsList=x[userEmail]
  var groupedEvents= eventsList.reduce((acc, event) => {
  var date = moment(event.start).format('YYYY-MM-DD');
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
datesInBetween.forEach(element => {
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
  // fixedStart=mergedDateTime.format('YYYY-MM-DDTHH:mm:ss.SSSSSSS').tz(data.meeting_timeZone)
  // fixedEnd=mergedDateTime2.format('YYYY-MM-DDTHH:mm:ss.SSSSSSS').tz(data.meeting_timeZone)

  fixedStart=moment(mergedDateTime.format('YYYY-MM-DDTHH:mm:ss')).tz(data.meeting_timeZone)
  fixedEnd=moment(mergedDateTime2.format('YYYY-MM-DDTHH:mm:ss')).tz(data.meeting_timeZone)
}
let result=getTime(arr,data.meeting_duration,startDatetime,endDatetime,morning,evening,fullDay,fixedStart,fixedEnd,newMorningEveningTime)

console.log("result:-----------")
console.log(result)
if(result){
freeSlotsResult.push(result)
}else{
freeSlotsResult=null
}
});
  
  
  // /******************************************** filter users according to durations in three array  ************************/ 
function getTime(users,duration,officeStart,officeEnd,morning,evening,fullDay,fixedStart,fixedEnd,newMorningEveningTime){
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
          if(i==0) { totalFreeTime=moment(userSlots[i].start).diff(officeStart, 'minutes')
          if(totalFreeTime>0)
          {user['freeslots'].push({
              'start':moment(officeStart).tz(data.meeting_timeZone),
              'end':moment(userSlots[i].start).tz(data.meeting_timeZone)
          })
          user['freeslotsinmin'].push(totalFreeTime)
      }
      }
      if(i==userSlots.length-1) {
              totalFreeTime=moment(officeEnd).diff(moment(userSlots[i].end), 'minutes')
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

/********************************************  make groups according common free time slot *****************/
const findCommonFreeTimeSlotsGroup = (users) => {
let userGroups = [],maxlength=[],max=-Infinity,group=[],commonTimeForMax={'commonSlot':[]}

for (let index = 0; index < users.length; index++) {
    const element = users[index];
    // group.push(element)
    
    for (let j = 0; j < element.freeMinutes.length; j++) {
      let obj={}
      group=[]
      group.push(element)
        const endTimeElement =moment(element.freeMinutes[j].end).tz(data.meeting_timeZone);
        const startTimeElement = moment(element.freeMinutes[j].start).tz(data.meeting_timeZone);
        let checkDuration=moment.duration(endTimeElement.diff(startTimeElement)).asMinutes()
        let flag=false
        if(morning){
          if (startTimeElement.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(startTimeElement)).asMinutes() >=duration ) {
            flag=true
          }
        } 
        if(evening){
          if (startTimeElement.isAfter(moment(newMorningEveningTime)) && endTimeElement.isAfter(moment(newMorningEveningTime)) && checkDuration>=duration) {
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
                 commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()

              }
              if(morning){
                if (commonStart.isBefore(moment(newMorningEveningTime)) && commonEnd.isBefore(moment(newMorningEveningTime))) {
                  flagForCommon=true
                }
              } 
              if(evening){
                if (commonStart.isAfter(moment(newMorningEveningTime)) && commonEnd.isAfter(moment(newMorningEveningTime))) {
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
          maxlength.push({
            'group':group,
            'commonSlot':{'start':startTimeElement,"end":endTimeElement}
          })
          }
          
          commonTimeForMax.maxUserGroup=maxlength
          
          commonTimeForMax.commonSlot.push(obj.commonSlot)
        }
        obj={}
        group=[];}
    }
    
}
if(!commonTimeForMax.commonSlot.find(x=>x)&&commonTimeForMax.maxUserGroup){
   let groupIn=[],obj={},userGroup=[],slot=[]
      commonTimeForMax.maxUserGroup.forEach(x=>{
      if(x.group.length==1){
          x.group[0].freeMinutes.forEach(ele => {
              let commonStart,commonEnd,commonSlotTime
                    commonEnd=moment(ele.end).tz(data.meeting_timeZone)
                    commonStart=moment(ele.start).tz(data.meeting_timeZone)
                    commonSlotTime=moment.duration(commonEnd.diff(commonStart)).asMinutes()
                    let flagForCommonTime=false
                    if(morning){
                      //startTimeElement.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(startTimeElement)).asMinutes() >=duration
                      if (commonStart.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(commonStart)).asMinutes() >=duration) {
                        flagForCommonTime=true
                      }
                    } 
                    if(evening){
                      if (commonStart.isAfter(moment(newMorningEveningTime)) && commonEnd.isAfter(moment(newMorningEveningTime))) {
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
                  if(commonSlotTime>=duration &&!groupIn.find(y=>y.name==x.group[0].name)&&flagForCommonTime){
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
  return userGroups.length>0&&commonTimeForMax.maxUserGroup?[userGroups,commonTimeForMax]:undefined;
};


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
const adjustedEndTime = start.clone().add(data.meeting_duration, 'minutes');
return { start, end: adjustedEndTime };
}

if (closestTimeSlot) {
return adjustTimeSlot(closestTimeSlot)
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


// // ROOT ROUTE ---START---
// app.get('/', (req, res) => {
// //   res.send("Authentication Successfull.")
// res.sendFile(__dirname + "/index.html")
// })
// // ROOT ROUTE ---END---


// ROUTE TO HANDLE WHEN THE USER DENIES FOR AUTHORIZATION ---START---
app.get("/error", (req, res) => {
  res.send(`
    <p>You rejected giving access to your events.</p>
    <p><a href="/">Go back to the home page</a></p>
  `);
});
// ROUTE TO HANDLE WHEN THE USER DENIES FOR AUTHORIZATION ---END---


// POST ROUTE TO SEND AUTH EMAIL TO NEW USERS ---START---
app.post("/send-auth-email", async (req, res) => {
  try {
    const { calendarIds } = req.body;

    if (!calendarIds) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Call the authorize function to send the authentication email
    await authorize(calendarIds);

    return res.json({
      message: "Authorization email sent. Please check your email.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// POST ROUTE TO SEND AUTH EMAIL TO NEW USERS ---END---


// GET ROUTE TO CALL WHEN NEW USER SUCCESSFULLY AUTHENTICATES THEIR ACCOUNT ---START---
app.get("/oauth2callback", async (req, res) => {
  const { code, state } = req.query;

  const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
  const a = JSON.stringify(credentials);
  const { client_secret, client_id, redirect_uris } = credentials.web; 
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  // console.log("oAuth2Client: " + oAuth2Client)

  try {
    const tokens = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    await saveCredentials(tokens, state);
    // await saveCredentials(tokens);

    // Redirect or respond with a success message
    res.redirect("/"); // Redirect to your HTML page
    console.log("authentication successful");
  } catch (error) {
    console.error("Error retrieving access token", error);
    // Redirect or respond with an error message
    res.redirect("/error");
  }
});
// GET ROUTE TO CALL WHEN NEW USER SUCCESSFULLY AUTHENTICATES THEIR ACCOUNT ---END---


// POST ROUTE TO SCHEDULE MEETING BETWEEN AUTH USERS ---START---
app.post("/schedule-meeting", async (req, res) => {
  try {
    const { meeting_title,
      meeting_description,
      start_date,
      end_date,
      participants,
      meeting_location,
      meeting_duration,
      meeting_timeZone } = req.body;

      const jsonData = req.body;

      const meetingTimezone = meeting_timeZone

      let office_Start=moment.tz('2024-03-27T08:00:00', meetingTimezone)
      let office_End=moment.tz('2024-03-27T18:30:00', meetingTimezone)

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


      // console.log("end_Date_time:---------")
      // console.log(end_Date_time)
      

      const participantEmails = participants.map(participant => participant.email);
      const calendarIds = participantEmails.flat();

    if (!calendarIds || !meeting_title || !meeting_description || !start_date || !end_date) {
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
    const meetingDuration = meeting_duration

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
      meeting_timeZone
    );

    if (!success) {
      return res.status(400).json({ error: "Failed to schedule meetings" });
    }

    return res.json({ message: "Meetings scheduled successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// POST ROUTE TO SCHEDULE MEETING BETWEEN AUTH USERS ---END---


// POST ON WHICH EXPRESS APPLICATION RUNS ---START---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// POST ON WHICH EXPRESS APPLICATION RUNS ---END---