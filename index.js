// REQUIRED NODE.JS MODULES ---START---
import express, { json } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { access, promises as fs } from "fs";
import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import env from "dotenv";
import moment from "moment";
import momentTZ from "moment-timezone";
import passport from "passport";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import graph from "@microsoft/microsoft-graph-client";
import axios from "axios";
// REQUIRED NODE.JS MODULES ---END---


// EXPRESS SERVER SETUP ---START---
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
env.config();
// EXPRESS SERVER SETUP ---END---

// PASSPORT SETUP ---START---
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
// PASSPORT SETUP ---END---

// OUTLOOK CREDENTIALS ---START---
const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
// OUTLOOK CREDENTIALS ---END---


// CREATE THE PASSPORT OBJECT INSTANCE ---START---
passport.use(
  new MicrosoftStrategy(
    {
      clientID: clientID,
      clientSecret: clientSecret,
      // callbackURL: "http://localhost:3000/auth/redirect",

      callbackURL: "http://localhost:3000/auth/microsoft",
      scope: ["user.read", "Calendars.ReadWrite", "offline_access"],
      tenant: "common",
      authorizationURL:
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    },
    async function (accessToken, refreshToken, profile, done) {
      // console.log("Token Response: ", {
      //   accessToken: accessToken,
      //   refreshToken: refreshToken,
      //   profile: profile,
      // });

      const userEmail = profile.userPrincipalName;

      // console.log("userEmail:---------");
      // console.log(userEmail);
      const expires_in = 3600;

      await saveCredentials(accessToken, refreshToken, userEmail, expires_in);

      return done(null, profile);
    }
  )
);
// CREATE THE PASSPORT OBJECT INSTANCE ---START---


// DEFINE PATH TO STORE AND LOAD AUTH USERS CREDENTIALS ---START---
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
// DEFINE PATH TO STORE AND LOAD AUTH USERS CREDENTIALS ---END---


// FUNCTION TO LOAD SAVED AUTH USERS CREDENTIALS ---START---
async function loadSavedCredentialsIfExist(calendarIds, meetingTimeZone) {
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

          // const accessToken = credentials.access_token;
          const refreshToken = credentials.refresh_token;

          // Create a client using the found credentials
          // console.log("calendarId loadSavedCredentialsIfExist:---------------");
          // console.log(calendarId);

          const accessToken = await refreshTokenIfNeeded(calendarId);
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

          // console.log("client:----------");
          // console.log(client);

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
      console.log(
        `No credentials found for the provided calendar ID: ${calendarIds}`
      );
      return null;
    }
  } catch (err) {
    console.error("Error loading saved credentials:", err.message);
    throw err;
  }
}
// FUNCTION TO LOAD SAVED AUTH USERS CREDENTIALS ---END---


// FUNCTION TO SAVE USERS CREDENTIALS AFTER SUCCESSFUL AUTHENTICATION ---START---
async function saveCredentials(
  accessToken,
  refreshToken,
  userEmail,
  expires_in
) {
  try {
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

    // const expires_in = 600;
    const expireDate = new Date(new Date().getTime() + expires_in * 1000);

    // console.log("expireDate:-----------")
    // console.log(expireDate)

    const newCredentials = {
      type: "authorized_user",
      client_id: clientID,
      client_secret: clientSecret,
      access_token: accessToken,
      refresh_token: refreshToken,
      expire_date: expireDate.toISOString(),
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


// FUNCTION TO REFRESH THE ACCESS TOKEN ---START---
async function refreshTokenIfNeeded(userEmail) {
  console.log("refreshTokenIfNeededHIT:--------------");

  const savedUsersCredentials = JSON.parse(await fs.readFile(TOKEN_PATH));

  const userCredentials = savedUsersCredentials.find(
    (cred) => cred.user_email === userEmail
  );

  const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds

  const expireTimestamp = Math.floor(
    new Date(userCredentials.expire_date).getTime() / 1000
  );

  // Check if the access token is expired
  if (expireTimestamp < currentTimestamp) {
    console.log(
      `Access Token Expired for ${userCredentials.user_email}, Refreshing the Access Token:------------`
    );

    const refreshResponse = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        refresh_token: userCredentials.refresh_token,
        grant_type: "refresh_token",
        redirect_uri: "http://localhost:3000/auth/microsoft",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = refreshResponse.data;
    // Save the new credentials
    await saveCredentials(access_token, refresh_token, userEmail, expires_in);

    return access_token;
  } else {
    // If the access token is not expired, return the existing one
    console.log(
      `Access Token is not Expired for ${userCredentials.user_email}, using the existing one:------------`
    );

    // console.log("existing access token:---------")
    // console.log(userCredentials.access_token)
    return userCredentials.access_token;
  }
  // return (access_token, userEmail);
}
// FUNCTION TO REFRESH THE ACCESS TOKEN ---END---


// EMAIL AND APP PASSWORD FOR THE ACCOUNT WHICH SEND AUTH EMAILS TO THE USERS ---START---
// const user_name = "ethanwick7336@gmail.com";
// const app_pass = "mvaw dnpz tlbf xvqq";

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

  // const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientID}&response_type=code&redirect_uri=http://localhost:3000/auth/redirect&response_mode=query&scope=user.read%20Calendars.ReadWrite%20offline_access`;

  // const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientID}&response_type=code&redirect_uri=http://localhost:3000/auth/microsoft&response_mode=query&scope=user.read%20Calendars.ReadWrite%20offline_access`;

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientID}&response_type=code&redirect_uri=http://localhost:3000/auth/microsoft&response_mode=query&scope=user.read%20Calendars.ReadWrite%20offline_access&login_hint=${calendarIds}`;

  // console.log("authURL:---------")
  // console.log(authUrl)

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
  meeting_title,
  meeting_description,
  startTime,
  endTime,
  meeting_location,
  meetingDuration,
  jsonData,
  meeting_timeZone,
  meeting_min
) {
  // console.log("calendarIds:----------");
  // console.log(calendarIds);

  // console.log("scheduleMeetingStartTime:---------");
  // console.log(startTime);

  // console.log("scheduleMeetingEndTime:-------------");
  // console.log(endTime);

  const timeZone = meeting_timeZone;

  // // Check if the selected day is between Monday to Friday
  // const startDay = startTime.getDay();
  // const endDay = endTime.getDay();
  // const isWeekday =
  //   startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

  // if (!isWeekday) {
  //   console.log("Meeting can only be scheduled from Monday to Friday.");
  //   return false; // Indicate failure
  // }

  const scheduleJsonData = jsonData;

  const { participants, meeting_id } = scheduleJsonData;

  // const participantUserID = participants.map(
  //   (participant) => participant.user_id
  // );

  let objUserId = {};

  participants.forEach((participant) => {
    objUserId[participant.email] = participant.user_id;
  });

  // console.log("busyStart:---------");F
  // console.log(startTime.toISOString());
  // console.log("busyEnd:---------");
  // console.log(endTime.toISOString());

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

  // console.log("freeBusyResults:------------");
  // console.log(freeBusyResults);

  const busySlotsArray = freeBusyResults.map((element) => {
    return element.value;
  });

  // console.log("busySlotsArray:-----------");
  // console.log(busySlotsArray);
  // const B = JSON.stringify(busySlotsArray)
  // console.log(B)

  // Function to extract required information
  // Function to extract required information
  function extractEventData(array) {
    const result = [];
    array.forEach((userArray) => {
      userArray.forEach((user) => {
        const userEmail = user.scheduleId;
        user.scheduleItems.forEach((event) => {
          const startTimeAmsterdam = convertToAmsterdamTime(
            event.start.dateTime
          );
          const endTimeAmsterdam = convertToAmsterdamTime(event.end.dateTime);

          const eventData = {
            email: userEmail,
            subject: event.subject,
            startTime: startTimeAmsterdam,
            endTime: endTimeAmsterdam,
          };
          result.push(eventData);
        });
      });
    });
    return result;
  }

  // Extracted data in desired JSON format
  const extractedData = extractEventData(busySlotsArray);
  // console.log("extractedData:-----------");
  // console.log(extractedData);

  let commonFreeSlots;

  const optionalParticipants = participants.filter(
    (participant) => participant.is_optional === 1
  );

  // console.log("optionalParticipants::-------------");
  // console.log(optionalParticipants);

  const optionalUsersEmails = optionalParticipants.map(
    (participant) => participant.email
  );

  // console.log("optionalUsersEmails:------------");
  // console.log(optionalUsersEmails);

  // Ensure that all responses were valid
  if (busySlotsArray.every((slots) => slots !== null)) {
    // Calculate common free slots
    commonFreeSlots = await calculateCommonFreeSlots(
      startTime,
      endTime,
      busySlotsArray,
      scheduleJsonData,
      calendarIds,
      optionalUsersEmails,
      meeting_timeZone
    );
  } else {
    console.log("Error processing freeBusy responses. Aborting scheduling.");
    return false;
  }

  // Minimum duration required for the meeting
  let minimumMeetingDuration = meetingDuration * 60 * 1000;

  // console.log("meetingDuration:----------");
  // console.log(meetingDuration);

  // console.log("minimumMeetingDuration1:----------");
  // console.log(minimumMeetingDuration);

  let suitableSlots;

  // let suitableFreeSlot = commonFreeSlots ? commonFreeSlots.map((element) => element.commonSlot) : null;

  // console.log("commonFreeSlots:------------");
  // console.log(commonFreeSlots);

  let suitableFreeSlot = commonFreeSlots
    ? commonFreeSlots.map((element) => element.commonSlot)
    : null;

  // let suitableFreeSlot = commonFreeSlots?commonFreeSlots.map(element => element.commonSlot):null

  // console.log("suitableFreeSlot:-----------");
  // console.log(suitableFreeSlot);

  // console.log("meetingMin1:---------");
  // console.log(meeting_min);

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

      console.log("suitableFreeSlots:---------");
      console.log(suitableFreeSlot);
      // console.log("minimumMeetingDuration2:----------");
      // console.log(minimumMeetingDuration);
    }
    // console.log("meeting_min2:------");
    // console.log(meeting_min);
  }

  if (suitableFreeSlot) {
    // Filter common free slots that are long enough for the meeting

    // console.log("suitableFreeSlot:--------");
    // console.log(suitableFreeSlot);
    suitableSlots = suitableFreeSlot.filter((slot) => {
      const slotDuration =
        new Date(slot.end).getTime() - new Date(slot.start).getTime();
      // console.log("slotDuration:---------");
      // console.log(slotDuration);
      return slotDuration >= minimumMeetingDuration;
    });

    // console.log("suitableSlots1:---------");
    // console.log(suitableSlots);
  } else {


    let logData;

    if (busySlotsArray.every((slots) => slots !== null)) {
      // Calculate common free slots
      console.log("generateAT:-------------")
      console.log(generatedAt)
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
    const logDataForCommonSlots = logData.freeSlotsByDate

    const commonTimeSlots = await findCommonFreeTimeSlots(logDataForCommonSlots, meeting_timeZone, jsonData, currentTime);
    // console.log("commonTimeSlots:-----------");
    // console.log(commonTimeSlots);
    // let b = JSON.stringify(commonTimeSlots);
    // console.log(b);

    if (!logData || logData.length === 0) {
      logData = "No free slot(s) available for participants";
    }

    console.log(
      "No suitable free slots found for the meeting, showing log data"
    );

    const freeSlotsAndCommonFreeSlots = {
      freeSlots: logData,
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
    return false; // Indicate failure
  }

  const sendListArr = commonFreeSlots.map((element) => element.sendList);
  const sendListArray = sendListArr.flat();

  // console.log("hostParticipant:--------------")
  // console.log(hostParticipant)

  // console.log("host:--------------")
  // console.log(host)

  if (sendListArray.length == 0) {
    if (suitableSlots.length > 0) {
      const firstSlot = suitableSlots[0];
      const meetingEndTime = new Date(
        new Date(firstSlot.start).getTime() + minimumMeetingDuration
      );

      const firstSlotStart = new Date(firstSlot.start);

      console.log("firstSlotStart:--------");
      console.log(firstSlotStart);

      console.log("meetingEndTime:----------");
      console.log(meetingEndTime);



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
        console.log("Error processing Free slots responses. Aborting scheduling.");
        return false;
      }
  
      // console.log("FreeTimeSlots when all users are available:------------");
      // console.log(logData);
      // let a = JSON.stringify(logData);
      // console.log(a);
      const logDataForCommonSlots = logData.freeSlotsByDate

      // if(logData === null){
      //   console.log("");
      // }


  
      const commonTimeSlots = await findCommonFreeTimeSlots(logDataForCommonSlots, meeting_timeZone, jsonData, currentTime);
      // console.log("commonTimeSlots when all users are available:-----------");
      // console.log(commonTimeSlots);
      // let b = JSON.stringify(commonTimeSlots);
      // console.log(b);
  
      if (!logData || logData.length === 0) {
        logData = "No free slot(s) available for participants";
      }


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

      const scheduleTimeStart = moment
        .tz(firstSlotStart, timeZone)
        .format("HH:mm");
      const scheduleTimeEnd = moment
        .tz(meetingEndTime, timeZone)
        .format("HH:mm");
      const scheduleDate = moment
        .tz(firstSlotStart, timeZone)
        .format("DD/MM/YYYY");

      const meetingScheduled = {
        startTime: scheduleTimeStart,
        endTime: scheduleTimeEnd,
        date: scheduleDate,
        meetingId: meeting_id,
        status: "2",
      };

      console.log("meetingScheduled:----------");
      console.log(meetingScheduled);
      return meetingScheduled; // return the meetingSchedule JSON
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
      const logDataForCommonSlots = logData.freeSlotsByDate

      const commonTimeSlots = await findCommonFreeTimeSlots(logDataForCommonSlots, meeting_timeZone, jsonData, currentTime);
      // console.log("commonTimeSlots:-----------");
      // console.log(commonTimeSlots);
      // let b = JSON.stringify(commonTimeSlots);
      // console.log(b);

      if (!logData || logData.length === 0) {
        logData = "No free slot(s) available for participants";
      }

      console.log(
        "No suitable free slots found for the meeting, showing log data"
      );

      const freeSlotsAndCommonFreeSlots = {
        freeSlots: logData,
        commonFreeSlots: commonTimeSlots, // common free slots
      };
      return freeSlotsAndCommonFreeSlots; // Indicate failure
    }
  } else {
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
    // console.log("calendarIds in scheduleMeeting function else:--------------");
    // console.log(calendarIds);

    // console.log("sendListArray in scheduleMeeting function else:--------------");
    // console.log(sendListArray);

    // console.log("firstSlotUTC:-----------");
    // console.log(firstSlotUTC);

    // console.log("bestEndTime:---------");
    // console.log(bestEndTime);

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

    // await blockTimeSlot(
    //   meeting_timeZone,
    //   calendarIds,
    //   authArray,
    //   // firstSlotStartAmsterdam,
    //   // meetingEndTimeAmsterdam,
    //   firstSlotUTC,
    //   bestEndTime,
    //   participants,
    //   jsonData
    // );
    // SCHEDULE EVENT FOR THE USERS WHO ARE AVAILABLE IN THE SLOT ---END---

    // GET USERS CALENDAR DATA
    // await viewCalendar(
    //   meeting_timeZone,
    //   calendarIds,
    //   authArray,
    //   // firstSlotStartAmsterdam,
    //   // meetingEndTimeAmsterdam,
    //   firstSlotUTC,
    //   bestEndTime,
    //   participants,
    //   jsonData
    // );

    let logData;

    if (busySlotsArray.every((slots) => slots !== null)) {
      // Calculate common free slots

      // const generatedAt = new Date().toISOString();

      // console.log("generatedAT:------------")
      // console.log(generatedAt)

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

      // logData.generated_at = generatedAt;

    } else {
      console.log("Error processing freeBusy responses. Aborting scheduling.");
      return false;
    }

    // console.log("FreeTimeSlots:------------");
    // console.log(logData);
    // let a = JSON.stringify(logData);
    // console.log(a);

    const logDataForCommonSlots = logData.freeSlotsByDate

    // console.log("FreeTimeSlots:------------");
    // console.log(logData.enrichedSlotsByDateWithTime);
    // let L = JSON.stringify(logData.enrichedSlotsByDateWithTime);
    // console.log(L);

    

    const commonTimeSlots = await findCommonFreeTimeSlots(
      logDataForCommonSlots,
      meeting_timeZone,
      jsonData,
      currentTime
    );
    // console.log("commonTimeSlots:-----------");
    // console.log(commonTimeSlots);
    // let b = JSON.stringify(commonTimeSlots);
    // console.log(b);

    if (!logData || logData.length === 0) {
      logData = "No free slot(s) available for participants";
    }

    const start_time = moment.tz(firstSlotUTC, timeZone).format("HH:mm");
    const end_time = moment.tz(bestEndTime, timeZone).format("HH:mm");
    const date = moment.tz(firstSlotUTC, timeZone).format("DD/MM/YYYY");

    console.log("No suitable free slots found for the meeting, Create LOGS.");

    const extractedEmailSend = {
      startTime: start_time,
      endTime: end_time,
      date: date,
      sendEmail: meetingUserIds,
      status: "1",
      meetingId: meeting_id,
      freeSlots: logData.enrichedSlotsByDateWithTime,
      commonFreeSlots: commonTimeSlots,
    };

    console.log("extractedEmailSend:-------");
    console.log(extractedEmailSend);

    return extractedEmailSend;
  }
}
// BLOCK TIME SLOT FOR THE USERS WHO ARE AVAILABLE DURING THE SUITABLE TIME SLOT ---END---

// FUNCTION TO SCHEDULE MEETING INTO USERS CALENDARS ---START---
async function setMeetingOLD(
  meeting_title,
  meeting_location,
  meeting_description,
  meeting_timeZone,
  calendarIds,
  authArray,
  firstSlotStart,
  meetingEndTime,
  participants
) {
  console.log("setMeetingHit:-------------");
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

  // let host = hostParticipant.email;

  let host;

  if (hostParticipant) {
    host = hostParticipant.email;
    console.log(`Host is provided form CMS, HOST: ${host}`);
  } else if (calendarIds.length > 0) {
    // If no host participant is found, set the first email in calendarIds as the host
    host = calendarIds[0];
    console.log(`Host is not provided form CMS, Making HOST: ${host}`);
  } else {
    // Handle case where there are no calendarIds
    console.error("No calendarIds provided");
    return; // Exit function early
  }

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
    // sendInvitations: "none", // This property prevents sending invitations to attendees
  };

  let organizer = [];
  organizer.push(host);

  // Find the client object with matching calendarId
  const organizerEmail = organizer[0]; // Assuming only one organizer email
  const clientObject = authArray.find(
    (client) => client.calendarId === organizerEmail
  );

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

      // console.log("organizerUser:---------")
      // console.log(organizerUser)

      console.log("Organizer:", organizerUser.name, "-", organizerUser.address);

      // Getting attendees
      const attendees = response.data.attendees;

      // Extract email addresses into a separate array
      // console.log("attendeesResponse:---------")
      // console.log(attendees)

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
}






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
) {
  console.log("setMeetingHit:-------------");
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

  // let host = hostParticipant.email;

  let host;

  if (hostParticipant) {
    host = hostParticipant.email;
    console.log(`Host is provided form CMS, HOST: ${host}`);
  } else if (calendarIds.length > 0) {
    // If no host participant is found, set the first email in calendarIds as the host
    host = calendarIds[0];
    console.log(`Host is not provided form CMS, Making HOST: ${host}`);
  } else {
    // Handle case where there are no calendarIds
    console.error("No calendarIds provided");
    return; // Exit function early
  }

  // const event = {
  //   subject: meeting_title,
  //   start: {
  //     dateTime: firstSlotStartAmsterdam,
  //     timeZone: amsterdamTimeZone,
  //   },
  //   end: {
  //     dateTime: meetingEndTimeAmsterdam,
  //     timeZone: amsterdamTimeZone,
  //   },
  //   location: {
  //     displayName: meeting_location,
  //   },
  //   body: {
  //     content: meeting_description,
  //     contentType: "text",
  //   },
  //   attendees: calendarIds.map((email) => ({
  //     emailAddress: { address: email },
  //     type: "required",
  //   })),
  //   responseRequested: false,
  //   // sendInvitations: "none", // This property prevents sending invitations to attendees
  // };




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
    isOrganizer: false,
    attendees: calendarIds.map((email) => ({
      emailAddress: { address: email },
      type: "required",
    })),
    // organizer: {
    //   emailAddress: {
    //     address: "erikg691@outlook.com",
    //   }     
    // }
  };

  let organizer = [];
  organizer.push(host);

  // Find the client object with matching calendarId
  const organizerEmail = organizer[0]; // Assuming only one organizer email
  const clientObject = authArray.find(
    (client) => client.calendarId === organizerEmail
  );

  async function createMeeting(event, accessToken) {
    try {

      // const accessTokenOrg = "EwBoA8l6BAAUbDba3x2OMJElkF7gJ4z/VbCPEz0AAZsJmoQY3MQECWrYoRppp8X6hLbcX68N8ysyFUT6MDgYy2wdELgtjc+iYEGWCl/n26ZfgJAsgwDyr0x8NEvKZvt0VckdEpvy/0J1q7LR5aI/s7lIjHGOB6VCWj97ZntqoFqWYspUW5XO0Dnn9WBwSBC93mkQPfRgeXOGAfjsY5FCEqt5gCrcajxH4LAcDFhfV7qzD/Oi4ZLmP2hwcehzuK9P4ZIaUQLIrB7lEMMcgF3JCgpN4J+bxtZX5CfFOZuU/z7FDXRjSVNMvg5Aoyc5ScH/wbBb7iPCtiafJwSlK2QSbnNJplLy29f9rXChKqbJNV0MK1IAnS1ts5LJqpo1JZUDZgAACF1TTpC1owyJOAKLGxageer/VEyiKEIHWMN9V3sW2LEcb1NIWO54inXJJxDGP2INpG77n8PzYVGAjjOc9XjVqvf56ZcSBX6z/XQQn7U0u0m0WOIUn8Ttpso3njgMLg1sQj+3AspMSCChr8njKcHx3ocPmAFb9aCdHn9V+y3LakYNdlkT0/Mha1xE9Z9O49YtTe+DmhH9hXYW8xt65xMywZMk61X5yGa2sz4BLm88VzxdXBPRt1yVXRhXsZG+CLFXOn58MpaoFpdyEtoR1LW/L/tJea+m8Zjifq7nErZ/imNQAE/nfsMS3AsLQGin97wGplRe4lBmIFiqzxWp05/0t76+rm2ktwswpRtPMzBRBTNrNmc9IAyFNPTvixW+5cwf1sjFPFG1ixQNoIRL/2eoUxk+ZjS43PN8OlR+tI8Gtk3G5eVxievX1HkwGMlbFzeVchWWILAOyRsFTd+g0sPtkGa2oyEQOx5yjnoGQFw+nBS2Q+b5ygK57IVwv7ZX489hRLiyo/Hb0akrHs9ckaf7tGf78ePR2GwXycoNRrRd9I5cW/LR6k1Jg1Irg+n5KNw78hMSsQy7nPF0wmDXx7IodxcNRf2ZKg9Eg4cSyMdwTlf3ijU2uN6PXx3upObX0YaFGgFIXVeAeJZHjmAfNq2DB6E/0UqLtmSoEGpoa8WOYUCoVIBqsZPbfQ7ET7fy507qR0+6JHRYaIzDSwDTw+IGadT/sTV/vldZweD3fibJ6oY55aRJNIwaoDniVzQ5Zi2uW2JxfAI="

      const response = await axios.post(
        "https://graph.microsoft.com/v1.0/me/calendar/events",
        event,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            // Authorization: `Bearer ${accessTokenOrg}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("Meeting created:", response.data);

      const organizerUser = response.data.organizer.emailAddress;

      // console.log("organizerUser:---------")
      // console.log(organizerUser)

      console.log("Organizer:", organizerUser.name, "-", organizerUser.address);

      // Getting attendees
      const attendees = response.data.attendees;

      // Extract email addresses into a separate array
      // console.log("attendeesResponse:---------")
      // console.log(attendees)

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
}




// FUNCTION TO SCHEDULE MEETING INTO USERS CALENDARS ---END---

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

  console.log("Participants:-------------");
  console.log(participants);

  const amsterdamTimeZone = meeting_timeZone;

  function convertToAmsterdamTime(utcTimeString) {
    return moment.utc(utcTimeString).tz(amsterdamTimeZone).format();
  }

  // Convert each meeting time to Amsterdam time zone
  const firstSlotStartAmsterdam = convertToAmsterdamTime(firstSlotStart);
  const meetingEndTimeAmsterdam = convertToAmsterdamTime(meetingEndTime);

  const availableUsersArray = authArray.filter((item) =>
    calendarIds.includes(item.calendarId)
  );

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

  const userIDOrganizer = responseBlock.map((event) => ({
    meetingId: event.id,
    organizerEmail: event.organizer.emailAddress.address, // or event.organizer.emailAddress.address for email
  }));

  // console.log("userIDOrganizer:----------");
  // console.log(userIDOrganizer);

  const blockTimeID = userIDOrganizer
    .filter((user) =>
      participants.some(
        (participant) => participant.email === user.organizerEmail
      )
    )
    .map((user) => ({
      calendar_meeting_id: user.meetingId,
      user_id: participants.find(
        (participant) => participant.email === user.organizerEmail
      ).user_id,
      meeting_id: jsonData.meeting_id, // Assuming jsonData is accessible
    }));

  console.log("blockTimeID:-------------");
  console.log(blockTimeID);

  let blockTest = 0;

  if (blockTest == 1) {
    // await deleteBlockTimeSlot(availableMeetingParticipants)
    await deleteBlockTimeSlot(blockTimeID);
  } else {
    console.log("deleteBlockTimeSlot FUNCTION DID NOT HIT:--------------");
  }
}
// FUNCTION TO BLOCK THE USERS TIME SLOT ---END---

// FUNCTION TO DELETE THE BLOCK TIME ---START---
async function deleteBlockTimeSlot(blockTimeID) {
  console.log(
    "Meeting has been successfully created so, deleteBlockTimeSlotHIT:--------------"
  );

  const savedUsersCredentials = JSON.parse(await fs.readFile(TOKEN_PATH));

  let users = [
    {
      type: "authorized_user",
      client_id: "608c798e-cba6-4fd5-be11-4faf246e98fa",
      client_secret: "6Nn8Q~3wNvQ30lxPa5XcAcUUyFZa2yFToNsF.ag.",
      access_token:
        "EwBgA8l6BAAUbDba3x2OMJElkF7gJ4z/VbCPEz0AASArRZvtvJHJhWaiOadO58mVMtPpcr02mBYYwHrzwBWjmNjG8RE9pegDSIzChuoUmCa9FKa+oq8aDh/eMcrdcUA7YrKhaDEc2Ev/SnP5XF7yKNdApGK8u1yO6bdMuOlaUrqZLBn7xa+uZ6axSuuk1WYBSETuOIX7Ls1mnrnLXMPkEUX+OGkIS8RrTBNLv5/Ryfar+Q9idAvJZXe35NHRgvFf+CJkm3jYlpdZysP/cPEpaX4qTypX0taWBt0RkHvD3yXA+14oTor18aDVZ19iPfX7eKLoI0jn/xWRmFPPdHLSmJGpvRl8gThwzSXYEzgJu52B4TyVv0VewBQA2rd0114DZgAACDHEkDmOcoYUMALAlxPR6FXiH1D6s9nuH+Im+OMalULhEQA8F3bisze4Ytkxnc7hoArob/802D5bgKiyNO3+JGakNP2flUZhS6FzCPgkzgQVgQvugh69fGGM5dFmqtmGkHVXKRJVpHnYlThQmfaugEM1Ri2+tBMbziHKgKmgAk/FHZP2hxJ7MeELa65ZQikhsEHMZoLtAFvEa+ZH7p6PN4krouOAqWoQHJRCDVhwJ9Idj+at16kTXmctML7ZzhThJvfn7KxlxE7lGrN0snbbL9bQJl5D+VnY+hmztUCPoe70xeeVVIQ0DEYnubu8gBg2N1T1O5+b6XZ1Dehb4NKF/sPwEdltf/d/Z4YTXO4WvdMpTd9lkSiTiTsdZKBXFaE9BIELJywBJLZr85RxOsYPJdEimcnqUIAxZ1RsVOiqRoKWtds56Jwtg6AKaSnEijygHXCRTAT+bCu7AO2fcvX6mIlEjogXCHJWHMZotGXRgD0xDz1SS2geSE36JC8mWFBsyA+nwveWLjbtBGk+eGO0HJQGkDJHxrz/5+SqtHewgbgsc+0gn1LYZHejnCjFMAch01UGrN7F3rcDjwZmNjwkWgnFYB5NoNWSohwglJypzOYFaDFmtOAYhmD5w3dhIe5DcoeR+f6LsZ0yYcAk5wXNpM8t2ZsBEb1pgeEePmeFilIvEsK4L8BVd7NUeR3uSlrwyQMzs78ejgLNoYfOVT+vDGn51ySKXs1hkxn8AM7O6mdzn8Px5LMhZN3yXnEC",
      refresh_token:
        "M.C527_BAY.0.U.-CtQHFs35oo1*iTnQ7O!QqcpsJlAfqY*lKkS8tUOJ9oJD6CiteHbRtYKk!PRbMas0L9zh9tlzF3UdObsVYaaJfrIH*uYMj*!BhNjhDN5ufVfwORFw3dEUUQNr4WDKHcwK0NHbkX1vFelp*1z6dUJkIPsG*BzvrqzOBTt6WaeqcWGG7UqSMstYUvSpM4N8QZUvOPaNi!YJu0d9*LtB2NvLxnRhXkW6YdPYIvVsOVvHdZG4wB8ObboiiW01zrpRoefljHS0v*KDQ0YHT8bStpUW4Xk*u*re0wiuBTVx*TsiXvyxoa3BFDTm1pv8LoWAQcmpd!Ir*b*Wx4zkBsUk4McMCw4MIXeyuFkEQz8p2D2N4RBu",
      expire_date: "2024-05-06T07:35:05.856Z",
      user_email: "erikg691@outlook.com",
      user_id: "7",
    },
    {
      type: "authorized_user",
      client_id: "608c798e-cba6-4fd5-be11-4faf246e98fa",
      client_secret: "6Nn8Q~3wNvQ30lxPa5XcAcUUyFZa2yFToNsF.ag.",
      access_token:
        "EwBoA8l6BAAUbDba3x2OMJElkF7gJ4z/VbCPEz0AATuk0IlVko1ibzFqRBi28h9+VSzT8cXWMqHAM/9Ye1IaolWMrAdpASzLbYNLXY3UfeSSVT65XDKN5TA1QqRh60Q0onXWYMXBQz5idmeD6ENjMLXUyg2F1z/TevMkO0pUMJIXjR7z2w5aUOf2OaYegO9gwNgpITXZBDzRxYdRm1RPFciNfWaKS04WjeY33GYGzXOWRt7soK0chb7XR4P1tMseO6+cIazb/FGerrLR6ZZCGk5dx7z8CITQtjApYloMdco0XU6HOsR+hcLG7NFiZWnclWersLLgDEPPXJi6vBUvcpjgPPpY4Zz1UbU/l/UxopA8U1r9cN+nDhPGlHJzDG4DZgAACLVxNt8jbpSIOAIR2l7D4OX6cCDOHYp4M9ewi7F0UoADMkPUhdBibG06hkQyuUlsoXmTOKfcYuRddOAqElgMhyRZTj4jEBRs4SAHsqysk/8g6RGubviR8aak/T+OCuq0X4CEF2KJvOIs+A3yvVpQtFZQ/1ot5RhLWb7q8Rx1VSihH+YXZmdnhI0Kf8YmwVgKcaa9d+SHUKFx+mlj2Lf5vOuVG589oSiyafUIiDBmsQnUwRiqL76sViTqJLJDXhBGghea0ZURIsw5RoAOjnBEBvHtINtPh0zPvq1D4zTLC+SmFj31De5Hhul9zFPr/QpYWfPwWBYOMdKgk3mAReRkDIwsn4G1Ki0ddBcIgiQ7mxlnsUc5tWuSHW4R5TtsR/yppOTxcENsfxlMNdkSNA7yShlWWN4BBOI7QyIUN1F/0aTRlx0zlcfan/8xWkHofenHwR7a3Lt5hiSNNBv5xMpKFUp7DvN55GGa3Z4rIaNlsoH8PGRScMLQfh41A4VnR9Od56S3uBMpgy6PwG2LfRx6kkKx+xk90n2Pj+NFvA7BY1OMj7yBEN2aSJkgIjouXlO3Qg8DgAWJappMrDBh49EEUD+GJdoNEV2vz485WfacGMvKguNjBQ5HPB4ex7TgkTZOs+DzKlJ1qemoa+0TrR+1OtRqqMjEgslerEM4QMe1wIipK5N0QHiNtH50JkoXYpLMV+r98iXbY2FAhJB6K2CxehqOPrdrQSbnKYsjYBSLwUdGe/Im5eE3idDCHIj7G04gBgSLfQI=",
      refresh_token:
        "M.C511_BAY.0.U.-ChZJCFCdCEwcE2NnZL5GmLEdWsqx9ul4K25q2uNvpKdiYrC593kJ*P4KpNDbbjkPPipWkDjtuoadtRabJ67nlbY5aRaQwvw5CxPuZfyMYMCbJ5MVnHzm4o0xi8VSEx6reh75oGTu1Sw6QiM1*SgcmCI8k10H2hJmBLQNDGV6pQU0!endu61asqdUhoOWX0fYYLShG7M!TCs4n0ZvwhSndTelRu1xy!iSxL92d2PJK3AmmzyT*rkPBwFT6ZHYw7X0Tq04fB3j5yeIaQQ4zKHwg*o!hf4UQ!EGdQFcorA7ksWs0cqUGpKxw0GclfHIYaibhLNNeV4OPuW4Y1cPC4bBYVWLCpDqmVG0pH!qfgw!Sf*K",
      expire_date: "2024-05-06T07:35:06.683Z",
      user_email: "teresaf3487@outlook.com",
      user_id: "3",
    },
    {
      type: "authorized_user",
      client_id: "608c798e-cba6-4fd5-be11-4faf246e98fa",
      client_secret: "6Nn8Q~3wNvQ30lxPa5XcAcUUyFZa2yFToNsF.ag.",
      access_token:
        "EwBoA8l6BAAUbDba3x2OMJElkF7gJ4z/VbCPEz0AASeju482B+ce4qF6+ui9Yr5chZYZVc1brKsuJuxYbJEyD1wYOK01ecE0GsaEkSj3I3HpEBPXSyRMwWwdRy5kPtthje4ajhV5n5V5nWLSxyEIg8IZCGasIrTDzHLoyNuRd98qQ3tDUvtf06iQnvFb77wVdnL4v5vSS20Gl4v+Pbke50jynRIZ25rMn5r1lPZ7dD/+CHPxZNPkLHaozTpuDap9j5WpYJvCVCNmC2JykHsToPPQAphUb+63kLP4bYE+nnbonRsiFs7IqoRQw5r5ZFyJ42L4uwGZ9j3FtXw9Xe9XWIv8Jb/iiW+J/vQTzD2PTaVKXKTvBuQHDUy1U+9nmlYDZgAACJwV0CIFExAuOAKFZMbB/TzRuTwhL6CUQ5qq0RJJr0tAJsZ6/F8TQU2r18mDZSXWJa6/49dTMFNCyHHmdS1NQzjImp1jOYqg4Tv6sl99SFX9YBrE/EeGlSCKzxhYb6H06i4oilgzaRdVkGd3TcLKM4AgNtiGJkDsP81ueCUuObIA3pqBluZp/zRtIn52TMEbjam+zy4xOwtL8M0teo9WG9FANiT7rilFp8psK0bJQ6Lsdc+FXeoi5kEaDHJ8ejqwlPDZmfKxBlMwkxVOZ538EeN3pNlAfEZsuTJOs7v2q07DRrfkGsflR7mBvVP6nV192Jioe4hwUMcPjtmu7JiGYnpaLxxDQ2Ac4Y3T0cMZeNpBl7002JtZKnsGe8Va62is+cUWyPbsOjmsgW483dbHWav55lgfYHAz//8w8WjJClgvoCjAkYrscoB2J/cyHlnli9H5MIUWA3ALnFCXkmMvgjICAQ4e08jfiqQIMsHwCYx5R4z1xBywpk5H/KxR4BomsV2eNeu0GCbqOlJfvbYS+ju/VVM4VumX2GbzmCwNapjKQKxzfJeAfhu9PE49zWW1+mBegk0pIvtkNOI1mFq5OrBQKHypZqkGXLz6NDtLoeo40PNhVEFbWBSLqUzbKeUZ+NGOtnr/ooXLet3tg29Hbtjb9gguWIt99ypD21k0BOKRBun67oxQHUu/6OIbPaxZZDXmtWvJ++ZztoENlIXh5VR/e5mLDKpRSCPQPTa4TXNS4vNhQkYkpBK6eqf8XxNF1gcOdwI=",
      refresh_token:
        "M.C504_SN1.0.U.-CrT6TipJH0brSjCpJra69lg5wjTYL7Glz06irwI2bp35*f6B2jG!MJbU3ZM6atuqyzONawoPLKjiahaBOfEBKRcGo0nKjzZh4UkeYusvMdwxeBVpb1CkHNHp!yFxfShzNfAH!yr2fG87XzRVCfa3H48zsK5YTdnLGPBzzsYXiyQxBYHGA5g0Gdr5mlLZCnqh*Dz47OQTaRAQmZoRVgde15i4RywDPAI9Dt3Yhf9ao8AzOTkykKnx84uM8cF6l8xDEjE!1rYIQtelCwwS0vSQnSzGYn79zFJMmuX1RqORLdZay8ay2Wr0vZPj8lQ!7iKdqNg2zlUUoqXA8n8SFyDRNmw$",
      expire_date: "2024-05-06T07:35:04.041Z",
      user_email: "rileyh341@outlook.com",
      user_id: "5",
    },
  ];

  let blockedID = blockTimeID;

  blockedID = [
    {
      calendar_meeting_id:
        "AQMkADAwATM3ZmYAZS03ZDI2LTRmNWEtMDACLTAwCgBGAAAD5nbQJDBRM0WnVaKGQvsz0wcAq_SdtSkTwkyi1ua0jWfctgAAAgENAAAAq_SdtSkTwkyi1ua0jWfctgAAAAQdspgAAAA=",
      user_id: "5",
      meeting_id: 10,
    },
    {
      calendar_meeting_id:
        "AQMkADAwATM3ZmYAZS03YzhjLWE3MmYtMDACLTAwCgBGAAADCeSCslmphEOYwGILWhVglgcAU1b3Yn_owUaP0R_VED5-PAAAAgENAAAAU1b3Yn_owUaP0R_VED5-PAAAAAi6wkEAAAA=",
      user_id: "3",
      meeting_id: 10,
    },
  ];

  //   // Function to compare and create new array
  // function blockTimeUserDelete(users, blockedID) {
  //   const newArray = [];
  //   blockedID.forEach(blockedUser => {
  //     users.forEach(user => {
  //       if (user.user_id === blockedUser.user_id) {
  //         newArray.push({
  //           meetingId: blockedUser.meetingId,
  //           organizerEmail: user.user_email,
  //           user_id: user.user_id
  //         });
  //       }
  //     });
  //   });
  //   return newArray;
  // }

  // // Call the function
  // const blockTimeUser = blockTimeUserDelete(users, blockedID);

  // console.log("blockTimeUser:------------");
  // console.log(blockTimeUser);

  function blockedUsersArr(users, blockedID) {
    return blockedID.map((blockedUser) => {
      const user = users.find((u) => u.user_id === blockedUser.user_id);
      return {
        meetingId: blockedUser.calendar_meeting_id,
        organizerEmail: user ? user.user_email : null,
        user_id: blockedUser.user_id,
      };
    });
  }

  // Call the function
  const blockTimeUser = blockedUsersArr(users, blockedID);
  console.log("blockTimeUser:------------");
  console.log(blockTimeUser);

  // try {
  //   for (const userEvent of blockTimeUser) {
  //     const organizerEmail = userEvent.organizerEmail;
  //     // console.log("organizerEmail:----------")
  //     // console.log(organizerEmail)

  //     const meetingID = userEvent.meetingId;

  //     // console.log("meetingID:----------")
  //     // console.log(meetingID)

  //     // Find the corresponding client object in availableUsersArray
  //     const userClient = blockTimeUser.find(
  //       (user) => user.organizerEmail === organizerEmail
  //     );

  //     if (userClient) {
  //       const accessToken = await refreshTokenIfNeeded(organizerEmail);
  //       let client = graph.Client.init({
  //         authProvider: async (done) => {
  //           try {
  //             done(null, accessToken);
  //           } catch (error) {
  //             done(error, null);
  //           }
  //         },
  //       });

  //       // Delete the event from the user's calendar
  //       await client.api(`/me/events/${meetingID}`).delete();

  //       console.log(
  //         `Event ${meetingID} deleted successfully for user ${organizerEmail}`
  //       );
  //     } else {
  //       console.log(`Client not found for user ${organizerEmail}`);
  //     }
  //   }

  // } catch (error) {
  //   console.error("Error deleting events:", error);
  // }

  try {
    // Create an array to store promises for each deletion operation
    const deletionPromises = blockTimeUser.map(async (userEvent) => {
      const organizerEmail = userEvent.organizerEmail;
      const meetingID = userEvent.meetingId;

      // Find the corresponding client object in availableUsersArray
      const userClient = blockTimeUser.find(
        (user) => user.organizerEmail === organizerEmail
      );

      if (userClient) {
        const accessToken = await refreshTokenIfNeeded(organizerEmail);
        let client = graph.Client.init({
          authProvider: async (done) => {
            try {
              done(null, accessToken);
            } catch (error) {
              done(error, null);
            }
          },
        });

        // Delete the event from the user's calendar and return the promise
        return client.api(`/me/events/${meetingID}`).delete();
      } else {
        console.log(`Client not found for user ${organizerEmail}`);
        return null; // Return null for clients not found
      }
    });

    // Wait for all deletion promises to resolve
    const results = await Promise.all(deletionPromises);

    console.log("result:------------");
    console.log(results);

    // Log deletion results
    results.forEach((result, index) => {
      const organizerEmail = blockTimeUser[index].organizerEmail;
      const meetingID = blockTimeUser[index].meetingId;
      if (result) {
        console.log(`Event deleted successfully for user ${organizerEmail}`);
      } else {
        console.log(`Event could not be deleted for user ${organizerEmail}`);
      }
    });
  } catch (error) {
    console.error("Error deleting events:", error);
  }
}
// FUNCTION TO DELETE THE BLOCK TIME ---END---

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
  // console.log("dataForLogsHit:--------------");

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


  // console.log("enrichedSLotsByDateWithTime:-------------")
  // console.log(enrichedSlotsByDateWithTime)
  // const E = JSON.stringify(enrichedSlotsByDateWithTime)
  // console.log(E)
  

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
async function findCommonFreeTimeSlots(logData, meeting_timeZone, jsonData, currentTime) {
  console.log("findCommonFReeTimeSlotsHIT:-------------")
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

  const commonFreeSlots = commonSlots.map((entry) => ({
    start: entry.slot.start.tz(meeting_timeZone).format(),
    end: entry.slot.end.tz(meeting_timeZone).format(),
    users: entry.users,
  }));

  // console.log("commonFreeSlots:--------")
  // console.log(commonFreeSlots)

  if (commonFreeSlots.length === 0) {
    console.log("commonFreeSlots in the when commonFReeSlots.length === 0")
    console.log(commonFreeSlots)
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


  // console.log("commonFreeTimeSlotsOutput:-----------")
  // console.log(commonFreeTimeSlotsOutput)
  // const C = JSON.stringify(commonFreeTimeSlotsOutput)
  // console.log(C)

  

  return commonFreeTimeSlotsOutput;
}
// FUNCTION TO FIND THE COMMON FREE SLOTS FOR USERS ---END---

// FUNCTION TO VIEW THE USERS CALENDAR ---START---
async function viewCalendar(
  meeting_timeZone,
  calendarIds,
  authArray,
  // firstSlotStartAmsterdam,
  // meetingEndTimeAmsterdam,
  firstSlotUTC,
  bestEndTime,
  participants,
  jsonData
) {
  console.log("list the users events:-----------");
  const listEvents = await Promise.all(
    authArray.map(async (client, index) => {
      try {
        // Make the API call to get free/busy information for the user
        const eventList = await client
          .api("/me/events")
          // .header("Prefer", `outlook.timezone=${meeting_timeZone}`)
          .get();

        // console.log("freeBusy:--------")
        // console.log(freeBusy)

        return eventList.value;
      } catch (error) {
        console.error("Error getting users event data:", error);
        return null; // or handle error as needed
      }
    })
  );

  // console.log("calendar view the users events:-----------")
  // const listEvents = await Promise.all(
  //   authArray.map(async (client, index) => {
  //     try {
  //       // Make the API call to get free/busy information for the user
  //       const eventList = await client
  //       .api(`me/calendarView?startDateTime=2024-05-16T08:00:00-08:00&endDateTime=2024-05-17T18:00:00-08:00`)
  //       // .header("Prefer", `outlook.timezone=${meeting_timeZone}`)
  //       .get();

  //       // console.log("freeBusy:--------")
  //       // console.log(freeBusy)

  //       return eventList.value;
  //     } catch (error) {
  //       console.error("Error getting users event data:", error);
  //       return null; // or handle error as needed
  //     }
  //   })
  // );

  console.log("listEvents:-----------");
  console.log(listEvents);
}
// FUNCTION TO VIEW THE USERS CALENDAR ---END---


// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
async function calculateCommonFreeSlots(
  startTime,
  endTime,
  busySlots,
  jsonData,
  calendarIds,
  optionalUsersEmails,
  meeting_timeZone
) {
  console.log("calculateCommonFreeSlotsHit:--------------");

  const busySlotsFlat = busySlots.flat();

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

  // console.log("busyPeriods:------------");
  // console.log(busyPeriods);
  // const a = JSON.stringify(busyPeriods);
  // console.log(a);

  // Extract optional users and their corresponding values ---START---
  const optionalUsersArray = busyPeriods.filter((period) => {
    const email = Object.keys(period)[0];
    return optionalUsersEmails.includes(email);
  });

  // console.log("optionalUsersArray:-------------");
  // console.log(optionalUsersArray);
  // Extract optional users and their corresponding values ---END---

  // Remove optional users their corresponding values ---START---
  const requiredUsersArray = busyPeriods.filter((period) => {
    const email = Object.keys(period)[0];
    return !optionalUsersEmails.includes(email);
  });

  // console.log("requiredUsersArray:------------");
  // console.log(requiredUsersArray);
  // Remove optional users their corresponding values ---END---

  const commonFreeSlots = findCommonFreeSlots(
    startTime,
    endTime,
    requiredUsersArray,
    jsonData
  );

  // const commonFreeSlots = findCommonFreeSlots(
  //   startTime,
  //   endTime,
  //   busyPeriods,
  //   jsonData
  // );
  return commonFreeSlots;
}
// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---END---


// FUNCTION TO FIND COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
function findCommonFreeSlotsOLD(
  startTime,
  endTime,
  busyPeriods,
  jsonDataFormate
) {
  let data = jsonDataFormate;
  let users = busyPeriods;

  console.log("JSONDATAFORMATE:----------");
  console.log(data);
  console.log("busyPeriods in ALGO:----------");
  console.log(users);

  moment.tz.setDefault(data.meeting_timeZone);
  let freeSlotsResult = [];

  var startDate = moment(data.start_date).tz(data.meeting_timeZone);
  var endDate = moment(data.end_date).tz(data.meeting_timeZone);

  console.log("startDate in ALGO:----------");
  console.log(startDate);
  console.log("endDate in ALGO:----------");
  console.log(endDate);

  // Array to store the dates in between
  var datesInBetween = [];
  // Current date to start iteration
  var currentDate = startDate.clone();
  console.log("currentDate in ALGO:----------");
  console.log(currentDate);

  // Iterate through dates
  while (currentDate.isSameOrBefore(endDate)) {
    datesInBetween.push(currentDate.format("YYYY-MM-DD"));
    currentDate.add(1, "days");
  }

  // Group events by date
  users.forEach((x) => {
    let userEmail = Object.keys(x)[0];
    let eventsList = x[userEmail];
    var groupedEvents = eventsList.reduce((acc, event) => {
      var date = moment(event.start).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});
    x[userEmail] = groupedEvents;
  });

  console.log("busyPeriods for users after forEach in ALGO:----------");
  console.log(users);

  console.log("datesInBetween in ALGO:----------");
  console.log(datesInBetween);

  let arr = [];
  let officeStart = moment("2024-03-27T08:00:00").tz(data.meeting_timeZone);
  let officeEnd = moment("2024-03-27T18:30:00").tz(data.meeting_timeZone);
  let morningEveningTime = moment("2024-01-06T12:00:00").tz(
    data.meeting_timeZone
  );

  datesInBetween.forEach((element) => {
    element = moment(element).tz(data.meeting_timeZone);
    arr = [];
    users.forEach((x) => {
      let userEmail = Object.keys(x)[0];
      let eventsList = x[userEmail];
      var final = moment(element).format("YYYY-MM-DD");
      arr.push({
        [userEmail]: eventsList[final] ? eventsList[final] : [],
      });
    });
    let startDatetime = officeStart.clone().set({
      year: moment(element).year(),
      month: moment(element).month(),
      date: moment(element).date(),
    });
    let endDatetime = officeEnd.clone().set({
      year: moment(element).year(),
      month: moment(element).month(),
      date: moment(element).date(),
    });
    let newMorningEveningTime = morningEveningTime.clone().set({
      year: moment(element).year(),
      month: moment(element).month(),
      date: moment(element).date(),
    });
    // console.log(arr,data.meeting_duration,startDatetime,endDatetime)
    let morning = null,
      evening = null,
      fullDay = null,
      fixedStart = null,
      fixedEnd = null;
    if (data.meeting_timing == 1) {
      fullDay = true;
    }
    if (data.meeting_timing == 2) {
      morning = true;
    }
    if (data.meeting_timing == 3) {
      evening = true;
    }
    if (data.meeting_timing == 4) {
      // Parse date and time separately
      const date = moment(element, "YYYY-MM-DD").tz(data.meeting_timeZone);
      const time = moment(data.start_time, "HH:mm:ss").tz(
        data.meeting_timeZone
      );

      // Merge date and time
      const mergedDateTime = date.clone().add({
        hours: time.hours(),
        minutes: time.minutes(),
        seconds: time.seconds(),
      });
      const time2 = moment(data.end_time, "HH:mm:ss").tz(data.meeting_timeZone);
      const mergedDateTime2 = date.clone().add({
        hours: time2.hours(),
        minutes: time2.minutes(),
        seconds: time2.seconds(),
      });
      // console.log(mergedDateTime.format('YYYY-MM-DDTHH:mm:ss.SSSSSSS'));
      fixedStart = moment(mergedDateTime.format("YYYY-MM-DDTHH:mm:ss")).tz(
        data.meeting_timeZone
      );
      fixedEnd = moment(mergedDateTime2.format("YYYY-MM-DDTHH:mm:ss")).tz(
        data.meeting_timeZone
      );
    }
    let durationTime;
    if (data.meeting_duration) {
      durationTime = data.meeting_duration;
    }
    if (data.meeting_min_duration) {
      durationTime = data.meeting_min_duration;
    }
    let result = getTime(
      arr,
      durationTime,
      startDatetime,
      endDatetime,
      morning,
      evening,
      fullDay,
      fixedStart,
      fixedEnd,
      newMorningEveningTime
    );

    console.log("result:-----------");
    console.log(result);

    if (result) {
      freeSlotsResult.push(result);
    } else {
      freeSlotsResult = null;
    }
  });

  // /******************************************** filter users according to durations in three array  ************************/
  function getTime(
    users,
    duration,
    officeStart,
    officeEnd,
    morning,
    evening,
    fullDay,
    fixedStart,
    fixedEnd,
    newMorningEveningTime
  ) {
    const filterUsers = (users, duration) => {
      const fullDayBusyUsers = [];
      const freeTimeUsers = [];
      const lessThanDurationUsers = [];

      users.forEach((user) => {
        const userName = Object.keys(user)[0];
        const userSlots = user[userName];

        let totalFreeTime = 0;
        user["name"] = userName;
        user["freeslots"] = [];
        user["freeslotsinmin"] = [];

        for (let i = 0; i < userSlots.length; i++) {
          if (i == 0) {
            totalFreeTime = moment(
              moment(userSlots[i].start).tz(data.meeting_timeZone)
            ).diff(officeStart, "minutes");
            if (totalFreeTime > 0) {
              user["freeslots"].push({
                start: moment(officeStart).tz(data.meeting_timeZone),
                end: moment(userSlots[i].start).tz(data.meeting_timeZone),
              });
              user["freeslotsinmin"].push(totalFreeTime);
            }
          }
          if (i == userSlots.length - 1) {
            totalFreeTime = moment(officeEnd).diff(
              moment(userSlots[i].end).tz(data.meeting_timeZone),
              "minutes"
            );
            if (totalFreeTime > 0) {
              user["freeslots"].push({
                start: moment(userSlots[i].end).tz(data.meeting_timeZone),
                end: moment(officeEnd).tz(data.meeting_timeZone),
              });
              user["freeslotsinmin"].push(totalFreeTime);
            }
          } else {
            totalFreeTime = moment(moment(userSlots[i + 1]?.start)).diff(
              userSlots[i].end,
              "minutes"
            );
            if (totalFreeTime > 0) {
              user["freeslots"].push({
                start: moment(userSlots[i].end).tz(data.meeting_timeZone),
                end: moment(userSlots[i + 1]?.start).tz(data.meeting_timeZone),
              });
              user["freeslotsinmin"].push(totalFreeTime);
            }
          }
        }
        if (userSlots.length == 0) {
          user["freeslots"].push({
            start: moment(officeStart).tz(data.meeting_timeZone),
            end: moment(officeEnd).tz(data.meeting_timeZone),
          });
          user["freeslotsinmin"].push(
            moment
              .duration(moment(officeEnd).diff(moment(officeStart)))
              .asMinutes()
          );
        }
        if (!user.freeslotsinmin.find((x) => x > 0)) {
          fullDayBusyUsers.push({
            name: userName,
            freeMinutes: user.freeslots,
            freeTimeInMinutes: user.freeslotsinmin,
          });
        } else if (user.freeslotsinmin.find((x) => x >= duration)) {
          freeTimeUsers.push({
            name: userName,
            freeMinutes: user.freeslots,
            freeTimeInMinutes: user.freeslotsinmin,
            totalFreeTime: user.freeslotsinmin.reduce(
              (acc, currentValue) => acc + currentValue,
              0
            ),
          });
        } else {
          lessThanDurationUsers.push({
            name: userName,
            freeMinutes: user.freeslots,
            freeTimeInMinutes: user.freeslotsinmin,
            totalFreeTime: user.freeslotsinmin.reduce(
              (acc, currentValue) => acc + currentValue,
              0
            ),
          });
        }
      });

      // console.log("totalFreeTime:------------")
      // console.log(totalFreeTime)

      // console.log("freeTimeUsers:------------");
      // console.log(freeTimeUsers);
      // console.log("fullDayBusyUsers:------------");
      // console.log(fullDayBusyUsers);
      // console.log("lessThanDurationUsers:------------");
      // console.log(lessThanDurationUsers);

      return { fullDayBusyUsers, freeTimeUsers, lessThanDurationUsers };
    };

    /********************************************  make groups according common free time slot *****************/
    const findCommonFreeTimeSlotsGroup = (users) => {
      let userGroups = [],
        maxlength = [],
        max = -Infinity,
        group = [],
        commonTimeForMax = { commonSlot: [] };

      for (let index = 0; index < users.length; index++) {
        const element = users[index];
        // group.push(element)

        for (let j = 0; j < element.freeMinutes.length; j++) {
          let obj = {};
          group = [];
          group.push(element);
          const endTimeElement = moment(element.freeMinutes[j].end).tz(
            data.meeting_timeZone
          );
          const startTimeElement = moment(element.freeMinutes[j].start).tz(
            data.meeting_timeZone
          );
          let checkDuration = moment
            .duration(endTimeElement.diff(startTimeElement))
            .asMinutes();
          let flag = false;
          if (morning) {
            if (
              startTimeElement.isBefore(moment(newMorningEveningTime)) &&
              moment
                .duration(newMorningEveningTime.diff(startTimeElement))
                .asMinutes() >= duration
            ) {
              flag = true;
            }
          }
          if (evening) {
            if (
              startTimeElement.isAfter(moment(newMorningEveningTime)) &&
              endTimeElement.isAfter(moment(newMorningEveningTime)) &&
              checkDuration >= duration
            ) {
              flag = true;
            }
          }
          if (fullDay && checkDuration >= duration) {
            flag = true;
          }
          if (fixedStart && fixedEnd) {
            let customStart = moment.max(
              moment(startTimeElement),
              moment(fixedStart)
            );
            let customEnd = moment.min(
              moment(endTimeElement),
              moment(fixedEnd)
            );
            let customSlotTime = moment
              .duration(customEnd.diff(customStart))
              .asMinutes();
            if (customSlotTime >= duration) {
              flag = true;
            }
          }
          if (flag) {
            for (let k = 0; k < users.length; k++) {
              if (k != index) {
                users[k].freeMinutes.forEach((element) => {
                  let commonStart, commonEnd, commonSlotTime;
                  let flagForCommon = false;
                  if (obj?.commonSlot) {
                    commonStart = moment.max(
                      moment(obj.commonSlot.start),
                      moment(element.start)
                    );
                    commonEnd = moment.min(
                      moment(obj.commonSlot.end),
                      moment(element.end)
                    );
                    commonSlotTime = moment
                      .duration(commonEnd.diff(commonStart))
                      .asMinutes();
                  } else {
                    commonStart = moment.max(
                      moment(startTimeElement),
                      moment(element.start)
                    );
                    commonEnd = moment.min(
                      moment(endTimeElement),
                      moment(element.end)
                    );
                    commonSlotTime = moment
                      .duration(commonEnd.diff(commonStart))
                      .asMinutes();
                  }
                  if (morning) {
                    if (
                      commonStart.isBefore(moment(newMorningEveningTime)) &&
                      commonEnd.isSameOrBefore(moment(newMorningEveningTime))
                    ) {
                      flagForCommon = true;
                    }
                  }
                  if (evening) {
                    if (
                      commonStart.isSameOrAfter(
                        moment(newMorningEveningTime)
                      ) &&
                      commonEnd.isAfter(moment(newMorningEveningTime))
                    ) {
                      flagForCommon = true;
                    }
                  }
                  if (fullDay) {
                    flagForCommon = true;
                  }
                  if (fixedStart && fixedEnd) {
                    if (
                      commonStart.isSameOrAfter(fixedStart) &&
                      commonEnd.isSameOrBefore(fixedEnd)
                    ) {
                      flagForCommon = true;
                    }
                  }
                  if (
                    commonSlotTime >= duration &&
                    !group.find((x) => x.name == users[k].name) &&
                    flagForCommon
                  ) {
                    group.push(users[k]);
                    // if(min>=commonSlotTime){
                    //   min=commonSlotTime
                    obj.commonSlot = {
                      start: moment(commonStart),
                      end: moment(commonEnd),
                    };

                    // }
                  }
                });
              }
            }

            if (
              data.scheduled_date &&
              data.scheduled_end_time &&
              data.scheduled_start_time &&
              obj.commonSlot
            ) {
              let datePart = moment(data.scheduled_date);
              let timePart = moment(data.scheduled_end_time, "HH:mm:ss");
              let timePart2 = moment(data.scheduled_start_time, "HH:mm:ss");
              let mergedDateTime1 = datePart
                .clone()
                .hours(timePart.hours())
                .minutes(timePart.minutes())
                .seconds(timePart.seconds())
                .tz(data.meeting_timeZone);
              let mergedDateTime2 = datePart
                .clone()
                .hours(timePart2.hours())
                .minutes(timePart2.minutes())
                .seconds(timePart2.seconds())
                .tz(data.meeting_timeZone);
              let diffFor2it = moment
                .duration(obj.commonSlot.end.diff(mergedDateTime1))
                .asMinutes();
              let diffFor2it1 = moment
                .duration(mergedDateTime2.diff(obj.commonSlot.start))
                .asMinutes();
              const isOverlap =
                (obj.commonSlot.start.isSameOrBefore(mergedDateTime2) &&
                  obj.commonSlot.end.isSameOrAfter(mergedDateTime2)) ||
                (obj.commonSlot.start.isSameOrBefore(mergedDateTime1) &&
                  obj.commonSlot.end.isSameOrAfter(mergedDateTime1)) ||
                (mergedDateTime2.isSameOrBefore(obj.commonSlot.start) &&
                  mergedDateTime1.isSameOrAfter(obj.commonSlot.end));
              if (isOverlap) {
                let flagForIt = false;
                let flagCheck = false;
                if (diffFor2it1 >= duration) {
                  obj.commonSlot.end = mergedDateTime2;
                  flagForIt = true;
                  flagCheck = true;
                }
                if (diffFor2it >= duration && !flagCheck) {
                  obj.commonSlot.start = mergedDateTime1;
                  flagForIt = true;
                }
                // else{
                //   obj.commonSlot=undefined
                // }
                if (diffFor2it1 >= duration && !flagCheck) {
                  obj.commonSlot.end = mergedDateTime2;
                  flagForIt = true;
                }
                if (!flagForIt) {
                  obj.commonSlot = undefined;
                }
              }
            }
            obj.usersGroup = group;
            userGroups.push(obj);
            if (max <= group.length) {
              if (max < group.length && maxlength.length) maxlength = [];
              max = group.length;
              if (obj.commonSlot) {
                maxlength.push({
                  group: group,
                  commonSlot: obj.commonSlot,
                });
              } else {
                maxlength.push({
                  group: group,
                  commonSlot: { start: startTimeElement, end: endTimeElement },
                });
              }

              commonTimeForMax.maxUserGroup = maxlength;

              commonTimeForMax.commonSlot.push(obj.commonSlot);
            }
            obj = {};
            group = [];
          }
        }
      }
      if (
        !commonTimeForMax.commonSlot.find((x) => x) &&
        commonTimeForMax.maxUserGroup
      ) {
        let groupIn = [],
          obj = {},
          userGroup = [],
          slot = [];
        commonTimeForMax.maxUserGroup.forEach((x) => {
          if (x.group.length == 1) {
            x.group[0].freeMinutes.forEach((ele) => {
              let commonStart, commonEnd, commonSlotTime;
              commonEnd = moment(ele.end).tz(data.meeting_timeZone);
              commonStart = moment(ele.start).tz(data.meeting_timeZone);
              commonSlotTime = moment
                .duration(commonEnd.diff(commonStart))
                .asMinutes();
              let flagForIt = false;
              if (
                data.scheduled_date &&
                data.scheduled_end_time &&
                data.scheduled_start_time &&
                commonSlotTime >= duration
              ) {
                let datePart = moment(data.scheduled_date);
                let timePart = moment(data.scheduled_end_time, "HH:mm:ss");
                let timePart2 = moment(data.scheduled_start_time, "HH:mm:ss");
                let mergedDateTime1 = datePart
                  .clone()
                  .hours(timePart.hours())
                  .minutes(timePart.minutes())
                  .seconds(timePart.seconds())
                  .tz(data.meeting_timeZone);
                let mergedDateTime2 = datePart
                  .clone()
                  .hours(timePart2.hours())
                  .minutes(timePart2.minutes())
                  .seconds(timePart2.seconds())
                  .tz(data.meeting_timeZone);
                let diffFor2it = moment
                  .duration(commonEnd.diff(mergedDateTime1))
                  .asMinutes();
                let diffFor2it1 = moment
                  .duration(mergedDateTime2.diff(commonStart))
                  .asMinutes();
                const isOverlap =
                  (commonStart.isSameOrBefore(mergedDateTime2) &&
                    commonEnd.isSameOrAfter(mergedDateTime2)) ||
                  (commonStart.isSameOrBefore(mergedDateTime1) &&
                    commonEnd.isSameOrAfter(mergedDateTime1)) ||
                  (mergedDateTime2.isSameOrBefore(commonStart) &&
                    mergedDateTime1.isSameOrAfter(commonEnd));
                if (isOverlap) {
                  flagForIt = true;
                  let flagCheck = false;
                  if (diffFor2it1 >= duration) {
                    commonEnd = mergedDateTime2;
                    flagForIt = false;
                    flagCheck = true;
                  }
                  if (diffFor2it >= duration && !flagCheck) {
                    commonStart = mergedDateTime1;
                    flagForIt = false;
                  }
                }
              }
              let flagForCommonTime = false;
              if (morning) {
                //startTimeElement.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(startTimeElement)).asMinutes() >=duration
                if (
                  commonStart.isBefore(moment(newMorningEveningTime)) &&
                  moment
                    .duration(newMorningEveningTime.diff(commonStart))
                    .asMinutes() >= duration
                ) {
                  flagForCommonTime = true;
                }
              }
              if (evening) {
                if (
                  commonStart.isSameOrAfter(moment(newMorningEveningTime)) &&
                  commonEnd.isAfter(moment(newMorningEveningTime))
                ) {
                  flagForCommonTime = true;
                }
              }
              if (fullDay) {
                flagForCommonTime = true;
              }
              if (fixedStart && fixedEnd) {
                if (
                  commonStart.isSameOrAfter(fixedStart) &&
                  commonEnd.isSameOrBefore(fixedEnd)
                ) {
                  flagForCommonTime = true;
                }
              }
              if (
                commonSlotTime >= duration &&
                !groupIn.find((y) => y.name == x.group[0].name) &&
                flagForCommonTime &&
                !flagForIt
              ) {
                groupIn.push(x.group[0]);
                // if(min>=commonSlotTime){
                //   min=commonSlotTime
                obj.commonSlot = {
                  start: moment(commonStart),
                  end: moment(commonEnd),
                };
                obj.group = groupIn;
                userGroup.push(obj);
                slot.push(obj.commonSlot);
                groupIn = [];
                obj = {};
                // }
              }
            });
          }
        });
        commonTimeForMax.maxUserGroup = userGroup;
        commonTimeForMax.commonSlot = slot;
      }
      let newFlagFor2;
      if (commonTimeForMax.maxUserGroup) {
        newFlagFor2 = commonTimeForMax.maxUserGroup.length > 0;
      }
      return userGroups.length > 0 && newFlagFor2
        ? [userGroups, commonTimeForMax]
        : undefined;
    };

    const findCommonTimeAndUsers = (arr) => {
      const uniqueSlots = [];
      const seenSlots = {};

      arr[1].maxUserGroup.forEach((item) => {
        const { start, end } = item.commonSlot;
        const slotKey = `${start}-${end}`;

        if (!seenSlots[slotKey]) {
          seenSlots[slotKey] = true;
          uniqueSlots.push(item);
        }
      });

      // console.log(uniqueSlots);
      let min = Infinity,
        minArr = [];
      for (let index = 0; index < uniqueSlots.length; index++) {
        const ele = uniqueSlots[index].group;
        for (let j = 0; j < ele.length; j++) {
          uniqueSlots[index].totalFree = uniqueSlots[index].totalFree
            ? uniqueSlots[index].totalFree + ele[j].totalFreeTime
            : ele[j].totalFreeTime;
          if (min >= ele[j].totalFreeTime) {
            if (min > ele[j].totalFreeTime && minArr.length) minArr = [];
            min = ele[j].totalFreeTime;
            minArr.push(uniqueSlots[index]);
          }
        }
      }
      let newMinArr;
      if (minArr.length > 1) {
        min = Infinity;
        newMinArr = [];
        for (let j = 0; j < minArr.length; j++) {
          if (min >= minArr[j].totalFree) {
            if (min > minArr[j].totalFree && newMinArr.length) newMinArr = [];
            min = minArr[j].totalFree;
            newMinArr.push(minArr[j]);
          }
        }
        return newMinArr;
      }

      return minArr;
    };

    let findSlotLessDuration = (lessDur, resPre) => {
      let finalGroup,
        max = -Infinity,
        res;
      for (let i = 0; i < resPre.length; i++) {
        const ele = resPre[i].commonSlot;
        finalGroup = [];
        for (let j = 0; j < lessDur.length; j++) {
          lessDur[j].freeMinutes.forEach((x) => {
            let commonStart = moment.max(moment(ele.start), moment(x.start));
            let commonEnd = moment.min(moment(ele.end), moment(x.end));
            let commonSlotTime = moment
              .duration(commonEnd.diff(commonStart))
              .asMinutes();
            if (
              commonSlotTime > 0 &&
              !finalGroup.find((x) => x.name == lessDur[j].name)
            ) {
              finalGroup.push(lessDur[j]);
            }
          });
        }
        if (max < finalGroup.length) {
          max = finalGroup.length;
          res = resPre[i];
        }
      }
      return res;
    };

    let findClosestTime = (arr) => {
      const targetDuration = duration;
      let closestTimeSlot = null;
      let minDifference = Infinity;

      arr.forEach((userSchedule) => {
        userSchedule.freeMinutes.forEach((slot) => {
          const start = moment(slot.start);
          const end = moment(slot.end);
          const duration = moment.duration(end.diff(start)).asMinutes();

          const difference = Math.abs(duration - targetDuration);
          if (difference < minDifference) {
            minDifference = difference;
            closestTimeSlot = { start, end };
          }
        });
      });

      function adjustTimeSlot(timeSlot) {
        const start = timeSlot.start.clone();
        const adjustedEndTime = start.clone().add(duration, "minutes");
        return { start, end: adjustedEndTime };
      }

      if (morning) {
        //startTimeElement.isBefore(moment(newMorningEveningTime)) && moment.duration(newMorningEveningTime.diff(startTimeElement)).asMinutes() >=duration
        if (
          closestTimeSlot.start.isBefore(moment(newMorningEveningTime)) &&
          moment
            .duration(newMorningEveningTime.diff(commonStart))
            .asMinutes() >= duration
        ) {
        } else {
          closestTimeSlot = null;
        }
      }
      if (evening) {
        if (
          closestTimeSlot.start.isSameOrAfter(moment(newMorningEveningTime)) &&
          closestTimeSlot.end.isAfter(moment(newMorningEveningTime))
        ) {
        } else {
          closestTimeSlot = null;
        }
      }
      if (fixedStart && fixedEnd) {
        if (
          closestTimeSlot.start.isSameOrAfter(fixedStart) &&
          closestTimeSlot.end.isSameOrBefore(fixedEnd)
        ) {
        } else {
          closestTimeSlot = null;
        }
      }

      if (closestTimeSlot) {
        let sendMail = [];
        users.forEach((x) => {
          sendMail.push(x.name);
        });
        return {
          group: [],
          commonSlot: adjustTimeSlot(closestTimeSlot),
          sendList: sendMail,
        };
      }
    };

    let res;
    const { fullDayBusyUsers, freeTimeUsers, lessThanDurationUsers } =
      filterUsers(users, duration);

    if (fullDayBusyUsers.length == users.length) {
      return null;
    }

    let commonFreeTimeSlotsGroups;
    if (freeTimeUsers.length > 0) {
      commonFreeTimeSlotsGroups = findCommonFreeTimeSlotsGroup(freeTimeUsers);
    }

    let slotAndUsers;
    if (commonFreeTimeSlotsGroups) {
      slotAndUsers = findCommonTimeAndUsers(commonFreeTimeSlotsGroups);
      res = slotAndUsers;
    }
    let final;
    if (lessThanDurationUsers.length > 0 && slotAndUsers) {
      final = findSlotLessDuration(lessThanDurationUsers, slotAndUsers);
      res = final;
    }
    let closestFreeSlot;
    if (lessThanDurationUsers.length == users.length) {
      closestFreeSlot = findClosestTime(lessThanDurationUsers);
      console.log(closestFreeSlot);
    }
    let finalUserList = new Set();
    if (res) {
      users.forEach((x) => {
        if (!Array.isArray(res)) {
          if (!res.group.find((y) => y.name == x.name))
            finalUserList.add(x.name);
        } else {
          if (res.length > 0) {
            res = res[0];
            if (!res.group.find((y) => y.name == x.name))
              finalUserList.add(x.name);
          } else return null;
        }
      });
      if (!Array.isArray(res)) {
        res.sendList = [...finalUserList];
      } else {
        res = undefined;
      }
    }

    return res ? res : closestFreeSlot ? closestFreeSlot : null;
  }
  return freeSlotsResult;
}





async function findCommonFreeSlots(start, end, busyPeriods, jsonDataFormate) {

  let data = jsonDataFormate;
  let users = busyPeriods;

  // console.log("jsonDataFormate in ALGO:----------")
  // console.log(data)
  console.log("busyPeriods in ALGO:----------")
  console.log(users)
  const U = JSON.stringify(users)
  console.log(U)

  moment.tz.setDefault(data.meeting_timeZone);

  let freeSlotsResult = [],
    slotsResults = [],
    multiResult = [],
    resCheck;

  var startDate = moment(data.start_date).tz(data.meeting_timeZone);
  var endDate = moment(data.end_date).tz(data.meeting_timeZone);

  // console.log("startDate in ALGO:----------")
  // console.log(startDate)
  // console.log("endDate in ALGO:----------")
  // console.log(endDate)

  // Array to store the dates in between
  var datesInBetween = [];
  // Current date to start iteration
  var currentDate = startDate.clone();

  // console.log("currentDate in ALGO:----------")
  // console.log(currentDate)

  // Iterate through dates
  while (currentDate.isSameOrBefore(endDate)) {
    datesInBetween.push(currentDate.format("YYYY-MM-DD"));
    currentDate = moment.tz(currentDate.add(1, "days"), data.meeting_timeZone);
  }

  let resArr,
    maxLen = -Infinity,
    maxLenMulti = -Infinity;

  // Group events by date
  users.forEach((x) => {
    let userEmail = Object.keys(x)[0];
    let eventsList = x[userEmail];
    var groupedEvents = eventsList.reduce((acc, event) => {
      let eventStart = moment.tz(event.start, data.meeting_timeZone);
      var date = moment(eventStart).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});
    x[userEmail] = groupedEvents;
  });
  // console.log("datesInBetween in ALGO:------------")
  // console.log(datesInBetween);
  
  let arr = [];

  // define the office start, end and morningEvening time ---START---
  // let officeStart = moment("2024-03-27T08:00:00").tz(data.meeting_timeZone);
  // let officeEnd = moment("2024-03-27T18:30:00").tz(data.meeting_timeZone);
  // let morningEveningTime = moment("2024-01-06T12:00:00").tz(
  //   data.meeting_timeZone
  // );


  let officeStart = moment("2024-03-27T08:30:00").tz(data.meeting_timeZone);
  let officeEnd = moment("2024-03-27T17:00:00").tz(data.meeting_timeZone);
  let morningEveningTime = moment("2024-01-06T12:00:00").tz(
    data.meeting_timeZone
  );

  console.log("officeStart in ALOG:-----------")
  console.log(officeStart)
  console.log("officeEnd in ALOG:-----------")
  console.log(officeEnd)
  console.log("morningEveningTime in ALOG:-----------")
  console.log(morningEveningTime)

  // define the office start, end and morningEvening time ---END---



  for (let element of datesInBetween) {
    element = moment(element).tz(data.meeting_timeZone);
    console.log("element in ALOG:-----------")
    console.log(element)

    arr = [];

    // get users busy slots according to date ---START---
    users.forEach((x) => {
      let userEmail = Object.keys(x)[0];
      let eventsList = x[userEmail];
      var final = moment(element).format("YYYY-MM-DD");
      arr.push({
        [userEmail]: eventsList[final] ? eventsList[final] : [],
      });
      // console.log("arr in the users.forEach loop:--------------")
      // console.log(arr)
      // const A = JSON.stringify(arr)
      // console.log(A)
    });

    console.log("Users in first for loop in ALGO:---------")
    console.log(users)
    const U = JSON.stringify(users)
    console.log(U)

    // get users busy slots according to date ---END---

    let startDatetime = officeStart.clone().set({
      year: moment(element).year(),
      month: moment(element).month(),
      date: moment(element).date(),
    });
    console.log("startDatetime in first for loop in ALGO:---------")
    console.log(startDatetime)

    let endDatetime = officeEnd.clone().set({
      year: moment(element).year(),
      month: moment(element).month(),
      date: moment(element).date(),
    });
    console.log("endDatetime in first for loop in ALGO:---------")
    console.log(endDatetime)

    let newMorningEveningTime = morningEveningTime.clone().set({
      year: moment(element).year(),
      month: moment(element).month(),
      date: moment(element).date(),
    });
    console.log("newMorningEveningTime in first for loop in ALGO:---------")
    console.log(newMorningEveningTime)

    // console.log(arr,data.meeting_duration,startDatetime,endDatetime)
    let morning = null,
      evening = null,
      fullDay = null,
      fixedStart = null,
      fixedEnd = null;
    if (data.meeting_timing == 1) {
      fullDay = true;
    }
    if (data.meeting_timing == 2) {
      morning = true;
    }
    if (data.meeting_timing == 3) {
      evening = true;
    }
    if (data.meeting_timing == 4) {
      // Parse date and time separately
      const date = moment(element, "YYYY-MM-DD").tz(data.meeting_timeZone);

      const time = moment(data.start_time, "HH:mm:ss").tz(
        data.meeting_timeZone
      );

      console.log("time in the ALGO:----------")
      console.log(time)

      // Merge date and time
      const mergedDateTime = date.clone().add({
        hours: time.hours(),
        minutes: time.minutes(),
        seconds: time.seconds(),
      });

      console.log("mergedDateTime in the ALGO:----------")
      console.log(mergedDateTime)

      const time2 = moment(data.end_time, "HH:mm:ss").tz(data.meeting_timeZone);
      console.log("time2 in the ALGO:----------")
      console.log(time2)
      const mergedDateTime2 = date.clone().add({
        hours: time2.hours(),
        minutes: time2.minutes(),
        seconds: time2.seconds(),
      });

      console.log("mergedDateTime2 in the ALGO:----------")
      console.log(mergedDateTime2)
      // console.log(mergedDateTime.format('YYYY-MM-DDTHH:mm:ss.SSSSSSS'));
      fixedStart = moment(mergedDateTime.format("YYYY-MM-DDTHH:mm:ss")).tz(
        data.meeting_timeZone
      );
      fixedEnd = moment(mergedDateTime2.format("YYYY-MM-DDTHH:mm:ss")).tz(
        data.meeting_timeZone
      );
    }

    console.log("fixedStart in first for loop in ALGO:---------")
    console.log(fixedStart)
    console.log("fixedEnd in first for loop in ALGO:---------")
    console.log(fixedEnd)


    let durationTime;
    if (data.meeting_duration) {
      durationTime = data.meeting_duration;
    }
    if (data.meeting_min_duration) {
      durationTime = data.meeting_min_duration;
    }

    // This is the main ALGO function calling

    console.log("arr in first for loop in ALGO just before getTime function calls:---------")
    console.log(arr)
    const K = JSON.stringify(arr)
    console.log(K)

    let result = await getTime(
      arr,
      durationTime,
      startDatetime,
      endDatetime,
      morning,
      evening,
      fullDay,
      fixedStart,
      fixedEnd,
      newMorningEveningTime
    );

    console.log("result after first iteration in ALGO:-----------")
    console.log(result);

    if (result) {
      if (maxLenMulti <= result.group.length) {
        if (maxLenMulti < result.group.length) multiResult = [];
        maxLenMulti = result.group.length;
        multiResult.push(result);
      }
      if (result.sendList.length) {
        // return this result
        if (maxLen < result.group.length) {
          maxLen = result.group.length;
          resArr = result;
        }
      } else {
        resArr = result;
        freeSlotsResult.push(resArr);
        // return freeSlotsResult
        break;
      }
    }

    slotsResults.push(result);
    if (datesInBetween.length == slotsResults.length) {
      if (resArr) freeSlotsResult.push(resArr);
      else {
        freeSlotsResult = null;
      }
      // return freeSlotsResult
      if (multiResult.length > 1) {
        resCheck = await findCommonTimeForMulti(multiResult);
        if (resCheck) {
          freeSlotsResult = [];
          freeSlotsResult.push(resCheck);
        } else freeSlotsResult = null;
        break;
      }
    }
  }


  function findCommonTimeForMulti(arr) {
    let uniqueSlots = arr;

    let min = -Infinity,
      minArr = [];
    for (let index = 0; index < uniqueSlots.length; index++) {
      const ele = uniqueSlots[index].group;
      for (let j = 0; j < ele.length; j++) {
        if (min <= ele[j].totalFreeTime) {
          if (min < ele[j].totalFreeTime && minArr.length) minArr = [];
          min = ele[j].totalFreeTime;
          minArr.push(uniqueSlots[index]);
        }
      }
    }
    let newMinArr;
    if (minArr.length > 1) {
      min = -Infinity;
      newMinArr = [];
      for (let j = 0; j < minArr.length; j++) {
        if (min <= minArr[j].totalFree) {
          if (min < minArr[j].totalFree && newMinArr.length) newMinArr = [];
          min = minArr[j].totalFree;
          newMinArr.push(minArr[j]);
        }
      }
      return newMinArr ? newMinArr[0] : newMinArr;
    }

    return minArr.length ? minArr[0] : minArr;
  }


  function secondIterationHandling(
    scheduled_date,
    meeting_timeZone,
    scheduled_end_time,
    scheduled_start_time,
    duration,
    commonStart,
    commonEnd
  ) {
    let datePart = moment(scheduled_date, "YYYY-MM-DD").tz(meeting_timeZone);
    let flagForMulti;
    flagForMulti = datePart.isSame(commonStart, "day");
    flagForMulti = datePart.isSame(commonEnd, "day");
    let timePart = moment(scheduled_end_time, "HH:mm:ss").tz(meeting_timeZone);
    let timePart2 = moment(scheduled_start_time, "HH:mm:ss").tz(
      meeting_timeZone
    );
    let mergedDateTime1 = datePart
      .clone()
      .hours(timePart.hours())
      .minutes(timePart.minutes())
      .seconds(timePart.seconds())
      .tz(meeting_timeZone);
    let mergedDateTime2 = datePart
      .clone()
      .hours(timePart2.hours())
      .minutes(timePart2.minutes())
      .seconds(timePart2.seconds())
      .tz(meeting_timeZone);
    let diffFor2it = moment
      .duration(commonEnd.diff(mergedDateTime1))
      .asMinutes();
    let diffFor2it1 = moment
      .duration(mergedDateTime2.diff(commonStart))
      .asMinutes();
    const isOverlap =
      (commonStart.isSameOrBefore(mergedDateTime2) &&
        commonEnd.isSameOrAfter(mergedDateTime2)) ||
      (commonStart.isSameOrBefore(mergedDateTime1) &&
        commonEnd.isSameOrAfter(mergedDateTime1)) ||
      (mergedDateTime2.isSameOrBefore(commonStart) &&
        mergedDateTime1.isSameOrAfter(commonEnd));
    if (isOverlap && flagForMulti) {
      let flagForIt = false;
      let flagCheck = false;
      if (diffFor2it1 >= duration) {
        commonEnd = mergedDateTime2;
        flagForIt = true;
        flagCheck = true;
      }
      if (diffFor2it >= duration && !flagCheck) {
        commonStart = mergedDateTime1;
        flagForIt = true;
      }
      // else{
      //   obj.commonSlot=undefined
      // }
      if (diffFor2it1 >= duration && !flagCheck) {
        commonEnd = mergedDateTime2;
        flagForIt = true;
      }
      if (!flagForIt) {
        commonStart = undefined;
        commonEnd = undefined;
      }
      return [commonStart, commonEnd];
    }
  }


  function getTime(
    users,
    duration,
    officeStart,
    officeEnd,
    morning,
    evening,
    fullDay,
    fixedStart,
    fixedEnd,
    newMorningEveningTime
  ) {
    /********************************************* filter users according to durations in three array  *************************/
    const filterUsers = (users, duration) => {
      const fullDayBusyUsers = [];
      const freeTimeUsers = [];
      const lessThanDurationUsers = [];

      console.log("officeStart in getTime function in ALGO:---------")
      console.log(officeStart)
      console.log("officeEnd in getTime function in ALGO:---------")
      console.log(officeEnd)

      users.forEach((user) => {
        const userName = Object.keys(user)[0];
        const userSlots = user[userName];

        let totalFreeTime = 0;
        user["name"] = userName;
        user["freeslots"] = [];
        user["freeslotsinmin"] = [];

        for (let i = 0; i < userSlots.length; i++) {
          if (i == 0) {
            totalFreeTime = moment(
              moment(userSlots[i].start).tz(data.meeting_timeZone)
            ).diff(officeStart, "minutes");
            if (totalFreeTime > 0) {
              user["freeslots"].push({
                start: moment(officeStart).tz(data.meeting_timeZone),
                end: moment(userSlots[i].start).tz(data.meeting_timeZone),
              });
              console.log("user in first if condition of the getTime function in the ALGO:-----------")
              console.log(user)
              user["freeslotsinmin"].push(totalFreeTime);
            }
          }
          if (i == userSlots.length - 1) {
            totalFreeTime = moment(officeEnd).diff(
              moment(userSlots[i].end).tz(data.meeting_timeZone),
              "minutes"
            );
            if (totalFreeTime > 0) {
              user["freeslots"].push({
                start: moment(userSlots[i].end).tz(data.meeting_timeZone),
                end: moment(officeEnd).tz(data.meeting_timeZone),
              });
              console.log("user in first if condition of the getTime function in the ALGO:-----------")
              console.log(user)
              user["freeslotsinmin"].push(totalFreeTime);
            }
          } else {
            totalFreeTime = moment(moment(userSlots[i + 1]?.start)).diff(
              userSlots[i].end,
              "minutes"
            );
            if (totalFreeTime > 0) {
              user["freeslots"].push({
                start: moment(userSlots[i].end).tz(data.meeting_timeZone),
                end: moment(userSlots[i + 1]?.start).tz(data.meeting_timeZone),
              });
              console.log("user in first if condition of the getTime function in the ALGO:-----------")
              console.log(user)
              user["freeslotsinmin"].push(totalFreeTime);
            }
          }
        }
        if (userSlots.length == 0) {
          user["freeslots"].push({
            start: moment(officeStart).tz(data.meeting_timeZone),
            end: moment(officeEnd).tz(data.meeting_timeZone),
          });
          user["freeslotsinmin"].push(
            moment
              .duration(moment(officeEnd).diff(moment(officeStart)))
              .asMinutes()
          );
        }
        if (!user.freeslotsinmin.find((x) => x > 0)) {
          fullDayBusyUsers.push({
            name: userName,
            freeMinutes: user.freeslots,
            freeTimeInMinutes: user.freeslotsinmin,
          });
        } else if (user.freeslotsinmin.find((x) => x >= duration)) {
          freeTimeUsers.push({
            name: userName,
            freeMinutes: user.freeslots,
            freeTimeInMinutes: user.freeslotsinmin,
            totalFreeTime: user.freeslotsinmin.reduce(
              (acc, currentValue) => acc + currentValue,
              0
            ),
          });
        } else {
          lessThanDurationUsers.push({
            name: userName,
            freeMinutes: user.freeslots,
            freeTimeInMinutes: user.freeslotsinmin,
            totalFreeTime: user.freeslotsinmin.reduce(
              (acc, currentValue) => acc + currentValue,
              0
            ),
          });
        }
      });
      return { fullDayBusyUsers, freeTimeUsers, lessThanDurationUsers };
    };

    /*********************************************  make groups according common free time slot ******************/

    const findCommonFreeTimeSlotsGroup = (users) => {
      let userGroups = [],
        maxlength = [],
        max = -Infinity,
        group = [],
        commonTimeForMax = { commonSlot: [] };
      let val;
      for (let index = 0; index < users.length; index++) {
        const element = users[index];

        for (let j = 0; j < element.freeMinutes.length; j++) {
          let obj = {};
          group = [];
          group.push(element);
          let endTimeElement = moment(element.freeMinutes[j].end).tz(
            data.meeting_timeZone
          );
          let startTimeElement = moment(element.freeMinutes[j].start).tz(
            data.meeting_timeZone
          );
          let checkDuration = moment
            .duration(endTimeElement.diff(startTimeElement))
            .asMinutes();
          let flag = false;
          if (morning) {
            if (
              startTimeElement.isBefore(moment(newMorningEveningTime)) &&
              moment
                .duration(newMorningEveningTime.diff(startTimeElement))
                .asMinutes() >= duration &&
              checkDuration >= duration
            ) {
              flag = true;
            }
          }
          if (evening) {
            if (
              moment
                .duration(endTimeElement.diff(newMorningEveningTime))
                .asMinutes() >= duration &&
              endTimeElement.isSameOrAfter(moment(newMorningEveningTime)) &&
              checkDuration >= duration
            ) {
              flag = true;
            }
          }
          if (fullDay && checkDuration >= duration) {
            flag = true;
          }
          if (fixedStart && fixedEnd) {
            let customStart = moment.max(
              moment(startTimeElement),
              moment(fixedStart)
            );
            let customEnd = moment.min(
              moment(endTimeElement),
              moment(fixedEnd)
            );
            let customSlotTime = moment
              .duration(customEnd.diff(customStart))
              .asMinutes();
            if (customSlotTime >= duration) {
              flag = true;
            }
          }
          if (flag) {
            for (let k = 0; k < users.length; k++) {
              if (k != index) {
                users[k].freeMinutes.forEach((element) => {
                  let commonStart, commonEnd, commonSlotTime;
                  let flagForCommon = false;
                  if (obj?.commonSlot) {
                    commonStart = moment.max(
                      moment(obj.commonSlot.start),
                      moment(element.start)
                    );
                    commonEnd = moment.min(
                      moment(obj.commonSlot.end),
                      moment(element.end)
                    );
                    commonSlotTime = moment
                      .duration(commonEnd.diff(commonStart))
                      .asMinutes();
                  } else {
                    commonStart = moment.max(
                      moment(startTimeElement),
                      moment(element.start)
                    );
                    commonEnd = moment.min(
                      moment(endTimeElement),
                      moment(element.end)
                    );
                    if (morning) {
                      commonEnd = moment.max(
                        moment(commonStart),
                        moment(newMorningEveningTime)
                      );
                    }
                    if (evening) {
                      commonStart = moment.min(
                        moment(commonEnd),
                        moment(newMorningEveningTime)
                      );
                    }
                    if (fixedStart && fixedEnd) {
                      commonStart = moment.max(
                        moment(commonStart),
                        moment(fixedStart)
                      );
                      commonEnd = moment.min(
                        moment(commonEnd),
                        moment(fixedEnd)
                      );
                    }
                    commonSlotTime = moment
                      .duration(commonEnd.diff(commonStart))
                      .asMinutes();
                  }
                  if (morning) {
                    if (
                      commonStart.isBefore(moment(newMorningEveningTime)) &&
                      commonEnd.isSameOrBefore(moment(newMorningEveningTime))
                    ) {
                      flagForCommon = true;
                    }
                  }
                  if (evening) {
                    if (
                      commonStart.isSameOrAfter(
                        moment(newMorningEveningTime)
                      ) &&
                      commonEnd.isAfter(moment(newMorningEveningTime))
                    ) {
                      flagForCommon = true;
                    }
                  }
                  if (fullDay) {
                    flagForCommon = true;
                  }
                  if (fixedStart && fixedEnd) {
                    if (
                      commonStart.isSameOrAfter(fixedStart) &&
                      commonEnd.isSameOrBefore(fixedEnd)
                    ) {
                      flagForCommon = true;
                    }
                  }
                  if (
                    commonSlotTime >= duration &&
                    !group.find((x) => x.name == users[k].name) &&
                    flagForCommon
                  ) {
                    group.push(users[k]);
                    obj.commonSlot = {
                      start: moment(commonStart),
                      end: moment(commonEnd),
                    };
                  }
                });
              }
            }
            /********************************************************** second iteration handling start ***********************************************/
            
            if (
              data.scheduled_date &&
              data.scheduled_end_time &&
              data.scheduled_start_time &&
              obj.commonSlot
            ) {
              val = secondIterationHandling(
                data.scheduled_date,
                data.meeting_timeZone,
                data.scheduled_end_time,
                data.scheduled_start_time,
                duration,
                obj.commonSlot.start,
                obj.commonSlot.end
              );
              if (Array.isArray(val)) {
                if (!val[0] && !val[1]) {
                  obj.commonSlot = undefined;
                }
                if (val[0]) {
                  obj.commonSlot.start = val[0];
                }
                if (val[1]) {
                  obj.commonSlot.end = val[1];
                }
              }
            }

            if (
              data.scheduled_date &&
              data.scheduled_end_time &&
              data.scheduled_start_time &&
              !obj.commonSlot
            ) {
              val = secondIterationHandling(
                data.scheduled_date,
                data.meeting_timeZone,
                data.scheduled_end_time,
                data.scheduled_start_time,
                duration,
                startTimeElement,
                endTimeElement
              );
              if (Array.isArray(val)) {
                if (!val[0] && !val[1]) {
                  startTimeElement = undefined;
                  endTimeElement = undefined;
                }
                if (val[0]) {
                  startTimeElement = val[0];
                }
                if (val[1]) {
                  endTimeElement = val[1];
                }
              }
            }


            /********************************************************** second iteration handling end ***********************************************/
            obj.usersGroup = group;
            userGroups.push(obj);
            if (max <= group.length) {
              if (max < group.length && maxlength.length) maxlength = [];
              max = group.length;
              if (obj.commonSlot) {
                maxlength.push({
                  group: group,
                  commonSlot: obj.commonSlot,
                });
              } else {
                if (endTimeElement && startTimeElement) {
                  maxlength.push({
                    group: group,
                    commonSlot: {
                      start: startTimeElement,
                      end: endTimeElement,
                    },
                  });
                }
              }

              commonTimeForMax.maxUserGroup = maxlength;

              commonTimeForMax.commonSlot.push(obj.commonSlot);
            }
            obj = {};
            group = [];
          }
        }
      }

      // when all user dont have common slot but available slots are greater then duration some slots already handled in previous loop but in some cases we have to handle specificaly
      if (
        !commonTimeForMax.commonSlot.find((x) => x) &&
        commonTimeForMax.maxUserGroup
      ) {
        let groupIn = [],
          obj = {},
          userGroup = [],
          slot = [];
        commonTimeForMax.maxUserGroup.forEach((x) => {
          if (x.group.length == 1) {
            x.group[0].freeMinutes.forEach((ele) => {
              let commonStart, commonEnd, commonSlotTime;
              commonEnd = moment(ele.end).tz(data.meeting_timeZone);
              commonStart = moment(ele.start).tz(data.meeting_timeZone);
              commonSlotTime = moment
                .duration(commonEnd.diff(commonStart))
                .asMinutes();
              let flagForIt = false;
              if (
                data.scheduled_date &&
                data.scheduled_end_time &&
                data.scheduled_start_time &&
                commonSlotTime >= duration
              ) {
                let datePart = moment(data.scheduled_date);
                let timePart = moment(data.scheduled_end_time, "HH:mm:ss");
                let timePart2 = moment(data.scheduled_start_time, "HH:mm:ss");
                let mergedDateTime1 = datePart
                  .clone()
                  .hours(timePart.hours())
                  .minutes(timePart.minutes())
                  .seconds(timePart.seconds())
                  .tz(data.meeting_timeZone);
                let mergedDateTime2 = datePart
                  .clone()
                  .hours(timePart2.hours())
                  .minutes(timePart2.minutes())
                  .seconds(timePart2.seconds())
                  .tz(data.meeting_timeZone);
                let diffFor2it = moment
                  .duration(commonEnd.diff(mergedDateTime1))
                  .asMinutes();
                let diffFor2it1 = moment
                  .duration(mergedDateTime2.diff(commonStart))
                  .asMinutes();
                const isOverlap =
                  (commonStart.isSameOrBefore(mergedDateTime2) &&
                    commonEnd.isSameOrAfter(mergedDateTime2)) ||
                  (commonStart.isSameOrBefore(mergedDateTime1) &&
                    commonEnd.isSameOrAfter(mergedDateTime1)) ||
                  (mergedDateTime2.isSameOrBefore(commonStart) &&
                    mergedDateTime1.isSameOrAfter(commonEnd));
                if (isOverlap) {
                  flagForIt = true;
                  let flagCheck = false;
                  if (diffFor2it1 >= duration) {
                    commonEnd = mergedDateTime2;
                    flagForIt = false;
                    flagCheck = true;
                  }
                  if (diffFor2it >= duration && !flagCheck) {
                    commonStart = mergedDateTime1;
                    flagForIt = false;
                  }
                }
              }
              let flagForCommonTime = false;
              if (morning) {
                if (
                  commonStart.isBefore(moment(newMorningEveningTime)) &&
                  moment
                    .duration(newMorningEveningTime.diff(commonStart))
                    .asMinutes() >= duration
                ) {
                  flagForCommonTime = true;
                }
              }
              if (evening) {
                if (
                  commonStart.isSameOrAfter(moment(newMorningEveningTime)) &&
                  commonEnd.isAfter(moment(newMorningEveningTime))
                ) {
                  flagForCommonTime = true;
                }
              }
              if (fullDay) {
                flagForCommonTime = true;
              }
              if (fixedStart && fixedEnd) {
                if (
                  commonStart.isSameOrAfter(fixedStart) &&
                  commonEnd.isSameOrBefore(fixedEnd)
                ) {
                  flagForCommonTime = true;
                }
              }
              if (
                commonSlotTime >= duration &&
                !groupIn.find((y) => y.name == x.group[0].name) &&
                flagForCommonTime &&
                !flagForIt
              ) {
                groupIn.push(x.group[0]);

                obj.commonSlot = {
                  start: moment(commonStart),
                  end: moment(commonEnd),
                };
                obj.group = groupIn;
                userGroup.push(obj);
                slot.push(obj.commonSlot);
                groupIn = [];
                obj = {};
                // }
              }
            });
          }
        });
        commonTimeForMax.maxUserGroup = userGroup;
        commonTimeForMax.commonSlot = slot;
      }
      let newFlagFor2;
      if (commonTimeForMax.maxUserGroup) {
        newFlagFor2 = commonTimeForMax.maxUserGroup.length > 0;
      }
      return userGroups.length > 0 && newFlagFor2
        ? [userGroups, commonTimeForMax]
        : undefined;
    };

    /********************************************* handling for getting best time slot when multiple groups have time slots  *************************/
    const findCommonTimeAndUsers = (arr) => {
      const uniqueSlots = [];
      const seenSlots = {};

      arr[1].maxUserGroup.forEach((item) => {
        const { start, end } = item.commonSlot;
        const slotKey = `${start}-${end}`;

        if (!seenSlots[slotKey]) {
          seenSlots[slotKey] = true;
          uniqueSlots.push(item);
        }
      });

      // console.log(uniqueSlots);
      let min = Infinity,
        minArr = [];
      for (let index = 0; index < uniqueSlots.length; index++) {
        const ele = uniqueSlots[index].group;
        for (let j = 0; j < ele.length; j++) {
          uniqueSlots[index].totalFree = uniqueSlots[index].totalFree
            ? uniqueSlots[index].totalFree + ele[j].totalFreeTime
            : ele[j].totalFreeTime;
          if (min >= ele[j].totalFreeTime) {
            if (min > ele[j].totalFreeTime && minArr.length) minArr = [];
            min = ele[j].totalFreeTime;
            minArr.push(uniqueSlots[index]);
          }
        }
      }
      let newMinArr;
      if (minArr.length > 1) {
        min = Infinity;
        newMinArr = [];
        for (let j = 0; j < minArr.length; j++) {
          if (min >= minArr[j].totalFree) {
            if (min > minArr[j].totalFree && newMinArr.length) newMinArr = [];
            min = minArr[j].totalFree;
            newMinArr.push(minArr[j]);
          }
        }
        return newMinArr;
      }

      return minArr;
    };

    // if we have users in lessduration then we check previously selected time slot in this
    let findSlotLessDuration = (lessDur, resPre) => {
      let finalGroup,
        max = -Infinity,
        res;
      for (let i = 0; i < resPre.length; i++) {
        const ele = resPre[i].commonSlot;
        finalGroup = [];
        for (let j = 0; j < lessDur.length; j++) {
          lessDur[j].freeMinutes.forEach((x) => {
            let commonStart = moment.max(moment(ele.start), moment(x.start));
            let commonEnd = moment.min(moment(ele.end), moment(x.end));
            let commonSlotTime = moment
              .duration(commonEnd.diff(commonStart))
              .asMinutes();
            if (
              commonSlotTime > 0 &&
              !finalGroup.find((x) => x.name == lessDur[j].name)
            ) {
              finalGroup.push(lessDur[j]);
            }
          });
        }
        if (max < finalGroup.length) {
          max = finalGroup.length;
          res = resPre[i];
        }
      }
      return res;
    };

    let findClosestTime = (arr) => {
      const targetDuration = duration;
      let closestTimeSlot = null;
      let minDifference = Infinity;

      arr.forEach((userSchedule) => {
        userSchedule.freeMinutes.forEach((slot) => {
          const start = moment(slot.start);
          const end = moment(slot.end);
          const duration = moment.duration(end.diff(start)).asMinutes();

          const difference = Math.abs(duration - targetDuration);
          if (difference < minDifference) {
            minDifference = difference;
            closestTimeSlot = { start, end };
          }
        });
      });

      function adjustTimeSlot(timeSlot) {
        const start = timeSlot.start.clone();
        const adjustedEndTime = start.clone().add(duration, "minutes");
        return { start, end: adjustedEndTime };
      }
      if (morning) {
        if (
          closestTimeSlot.start.isBefore(moment(newMorningEveningTime)) &&
          closestTimeSlot.end.isSameOrBefore(fixedStart)
        ) {
        } else {
          closestTimeSlot = null;
        }
      }
      if (evening) {
        if (
          closestTimeSlot.start.isSameOrAfter(moment(newMorningEveningTime)) &&
          closestTimeSlot.end.isAfter(moment(newMorningEveningTime))
        ) {
        } else {
          closestTimeSlot = null;
        }
      }
      if (fixedStart && fixedEnd) {
        if (
          closestTimeSlot.start.isSameOrAfter(fixedStart) &&
          closestTimeSlot.end.isSameOrBefore(fixedEnd)
        ) {
        } else {
          closestTimeSlot = null;
        }
      }
      if (closestTimeSlot) {
        let sendMail = [];
        users.forEach((x) => {
          sendMail.push(x.name);
        });
        return {
          group: [],
          commonSlot: adjustTimeSlot(closestTimeSlot),
          sendList: sendMail,
        };
      }
    };

    let res;
    const { fullDayBusyUsers, freeTimeUsers, lessThanDurationUsers } =
      filterUsers(users, duration);

    if (fullDayBusyUsers.length == users.length) {
      return null;
    }

    let commonFreeTimeSlotsGroups;
    if (freeTimeUsers.length > 0) {
      commonFreeTimeSlotsGroups = findCommonFreeTimeSlotsGroup(freeTimeUsers);
    }

    let slotAndUsers;
    if (commonFreeTimeSlotsGroups) {
      slotAndUsers = findCommonTimeAndUsers(commonFreeTimeSlotsGroups);
      res = slotAndUsers;
    }
    let final;
    if (lessThanDurationUsers.length > 0 && slotAndUsers) {
      final = findSlotLessDuration(lessThanDurationUsers, slotAndUsers);
      res = final;
    }
    let closestFreeSlot;
    if (lessThanDurationUsers.length == users.length) {
      closestFreeSlot = findClosestTime(lessThanDurationUsers);
      console.log(closestFreeSlot);
    }
    let finalUserList = new Set();
    if (res) {
      users.forEach((x) => {
        if (!Array.isArray(res)) {
          if (!res.group.find((y) => y.name == x.name))
            finalUserList.add(x.name);
        } else {
          if (res.length > 0) {
            res = res[0];
            if (!res.group.find((y) => y.name == x.name))
              finalUserList.add(x.name);
          } else return null;
        }
      });
      if (!Array.isArray(res)) {
        res.sendList = [...finalUserList];
      } else {
        res = undefined;
      }
    }

    return res ? res : closestFreeSlot ? closestFreeSlot : null;
  }
  return freeSlotsResult;
}

// FUNCTION TO FIND COMMON FREE SLOTS BETWEEN AUTH USERS ---END---

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
    const { participants } = req.body;
    for (const participant of participants) {
      if (!participant.email) {
        console.error("Participant is missing email:", participant);
        continue; // Skip this participant if email is missing
      }

      const calendarId = participant.email.trim();

      // Call the authorize function to send the authentication email
      await authorize([calendarId]); // Sending each email individually
    }

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
// app.get('/auth/redirect', passport.authenticate('microsoft', {
//   session:false,
//   successRedirect: 'http://localhost:3000',
//   failureRedirect: '/login' // Redirect to login page or handle error
// }));

// GET ROUTE FOR REDIRECT URI --START---
app.get(
  "/auth/microsoft",
  passport.authenticate("microsoft", {
    session: false,
    successRedirect: "http://localhost:3000",
    failureRedirect: "http://localhost:3000",
    // failureRedirect: "/login", // Redirect to login page or handle error
  })
);
// GET ROUTE FOR REDIRECT URI --END---
// GET ROUTE TO CALL WHEN NEW USER SUCCESSFULLY AUTHENTICATES THEIR ACCOUNT ---END---

app.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

// POST ROUTE TO SCHEDULE MEETING BETWEEN AUTH USERS ---START---
app.post("/schedule-meeting", async (req, res) => {
  try {
    const {
      meeting_title,
      meeting_description,
      start_date,
      end_date,
      participants,
      meeting_location,
      meeting_duration,
      meeting_timeZone,
      meeting_min_duration,
      meeting_max_duration,
    } = req.body;

    const jsonData = req.body;

    const meetingTimezone = meeting_timeZone;

    // console.log("meetingDuration:--------");
    // console.log(meeting_duration);
    // console.log("meetingMinDuration:---------");
    // console.log(meeting_min_duration);
    // console.log("meetingMaxDuration:----------");
    // console.log(meeting_max_duration);

    let office_Start = moment.tz("2024-03-27T08:00:00", meetingTimezone);
    let office_End = moment.tz("2024-03-27T18:30:00", meetingTimezone);

    let start_Date_time_zone = office_Start.clone().set({
      year: moment(start_date).year(),
      month: moment(start_date).month(),
      date: moment(start_date).date(),
    });

    // var start_Date_time = moment.utc(start_Date_time_zone);
    var start_Date_time = moment(start_Date_time_zone);

    // var start_Date_time = moment.tz(start_Date_time_zone, "Europe/Amsterdam");

    // console.log("start_Date_Time");
    // console.log(start_Date_time);

    let end_Date_time_zone = office_End.clone().set({
      year: moment(end_date).year(),
      month: moment(end_date).month(),
      date: moment(end_date).date(),
    });
    // var end_Date_time = moment.utc(end_Date_time_zone);
    var end_Date_time = moment(end_Date_time_zone);
    // var end_Date_time = moment.tz(end_Date_time_zone,"Europe/Amsterdam");

    // console.log("end_Date_time:---------");
    // console.log(end_Date_time);

    const participantEmails = participants.map(
      (participant) => participant.email
    );
    const calendarIds = participantEmails.flat();

    if (
      !calendarIds ||
      !meeting_title ||
      !meeting_description ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Load saved credentials for provided calendarIds
    const authClients = await loadSavedCredentialsIfExist(
      calendarIds,
      meetingTimezone
    );

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

    const meetingLocation = meeting_location;
    //  meetingDuration = meeting_duration
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
      meeting_min_duration
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