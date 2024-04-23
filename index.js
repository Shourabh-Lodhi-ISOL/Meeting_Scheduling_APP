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


// // SCOPES TO DEFINE THE ACCESS OF USERS GOOGLE CALENDAR ---START---
// const SCOPES = [
//   "https://www.googleapis.com/auth/calendar.readonly",
//   "https://www.googleapis.com/auth/calendar.events",
// ];
// // SCOPES TO DEFINE THE ACCESS OF USERS GOOGLE CALENDAR ---END---


// OUTLOOK CREDENTIALS ---START---
const clientID = "608c798e-cba6-4fd5-be11-4faf246e98fa";
const clientSecret = "6Nn8Q~3wNvQ30lxPa5XcAcUUyFZa2yFToNsF.ag.";
const tenantID = "f8cdef31-a31e-4b4a-93e4-5f571e91255a";
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
      console.log("Token Response: ", {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile,
      });

      const userEmail = profile.userPrincipalName;

      console.log("userEmail:---------");
      console.log(userEmail);

      await saveCredentials(accessToken, refreshToken, userEmail);

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

          // const accessToken = credentials.access_token;
          const refreshToken = credentials.refresh_token;

          // Create a client using the found credentials
          console.log("calendarId loadSavedCredentialsIfExist:---------------");
          console.log(calendarId);

          const client = graph.Client.init({
            authProvider: async (done) => {
              try {
                const accessToken = await refreshTokenIfNeeded(calendarId);
                // console.log("accessToken:------------")
                // console.log(accessToken)
                done(null, accessToken);
              } catch (error) {
                done(error, null);
              }
            },
          });

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
async function saveCredentials(accessToken, refreshToken, userEmail) {
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

    const newCredentials = {
      type: "authorized_user",
      client_id: clientID,
      client_secret: clientSecret,
      access_token: accessToken,
      refresh_token: refreshToken,
      // expire_date: expireDateAmsterdam,
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

  const savedCredentials = JSON.parse(await fs.readFile(TOKEN_PATH));
  const userCreds = savedCredentials.find(
    (cred) => cred.user_email === userEmail
  );

  // console.log('Refreshing access token...');

  const refreshResponse = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    new URLSearchParams({
      client_id: clientID,
      client_secret: clientSecret,
      refresh_token: userCreds.refresh_token,
      grant_type: "refresh_token",
      redirect_uri: "http://localhost:3000/auth/microsoft",
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  // console.log("refreshResponse:---------")
  // console.log(refreshResponse)

  const { access_token, refresh_token } = refreshResponse.data;

  // console.log("newAccessToken:---------");
  // console.log(access_token);
  await saveCredentials(access_token, refresh_token, userEmail);
  return access_token;
}
// FUNCTION TO REFRESH THE ACCESS TOKEN ---END---


// EMAIL AND APP PASSWORD FOR THE ACCOUNT WHICH SEND AUTH EMAILS TO THE USERS ---START---
const user_name = "ethanwick7336@gmail.com";
const app_pass = "mvaw dnpz tlbf xvqq";
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

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientID}&response_type=code&redirect_uri=http://localhost:3000/auth/microsoft&response_mode=query&scope=user.read%20Calendars.ReadWrite%20offline_access`;

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
  meeting_min,
  scheduled_date,
  scheduled_start_time,
  scheduled_end_time
) {
  // console.log("calendarIds:----------");
  // console.log(calendarIds);

  // console.log("scheduleMeetingStartTime:---------");
  // console.log(startTime);

  // console.log("scheduleMeetingEndTime:-------------");
  // console.log(endTime);

  const timeZone = meeting_timeZone;
  // Check if the selected day is between Monday to Friday
  const startDay = startTime.getDay();
  const endDay = endTime.getDay();
  const isWeekday =
    startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

  if (!isWeekday) {
    console.log("Meeting can only be scheduled from Monday to Friday.");
    return false; // Indicate failure
  }

  const scheduleJsonData = jsonData;

  const { participants, meeting_id } = scheduleJsonData;

  const participantUserID = participants.map(
    (participant) => participant.user_id
  );

  let objUserId = {};

  participants.forEach((participant) => {
    objUserId[participant.email] = participant.user_id;
  });

  // console.log("busyStart:---------");
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

  console.log("authArray:-----------");
  console.log(authArray);

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

  // console.log("freeBusyResults:------------");
  // console.log(freeBusyResults);

  const busySlotsArray = freeBusyResults.map((element) => {
    return element.value;
  });

  // console.log("busySlotsArray:-----------");

  // console.log(busySlotsArray);

  let commonFreeSlots;

  // Ensure that all responses were valid
  if (busySlotsArray.every((slots) => slots !== null)) {
    // Calculate common free slots
    commonFreeSlots = calculateCommonFreeSlots(
      startTime,
      endTime,
      busySlotsArray,
      scheduleJsonData,
      calendarIds
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

      // console.log("suitableFreeSlots:---------");
      // console.log(suitableFreeSlot);
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
    console.log(
      "No suitable free slots found for the meeting, Users full day busy."
    );
    return false; // Indicate failure
  }

  const sendListArr = commonFreeSlots.map((element) => element.sendList);
  const sendListArray = sendListArr.flat();

  if (sendListArray.length == 0) {
    if (suitableSlots.length > 0) {
      const firstSlot = suitableSlots[0];
      const meetingEndTime = new Date(
        new Date(firstSlot.start).getTime() + minimumMeetingDuration
      );

      const firstSlotStart = new Date(firstSlot.start);

      // console.log("firstSlotStart:--------");
      // console.log(firstSlotStart);

      // console.log("meetingEndTime:----------");
      // console.log(meetingEndTime);

      setMeeting(
        meeting_title,
        meeting_location,
        meeting_description,
        meeting_timeZone,
        calendarIds,
        authArray,
        scheduled_date,
        scheduled_start_time,
        scheduled_end_time,
        firstSlotStart,
        meetingEndTime
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
      console.log("No suitable free slots found for the meeting.");
      return false; // Indicate failure
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
    };

    console.log("extractedEmailSend:-------");
    console.log(extractedEmailSend);

    return extractedEmailSend;
  }
}
// FUNCTION TO SCHEDULE MEETING BETWEEN AUTH USERS ---END---


// FUNCTION TO SCHEDULE MEETING INTO USERS CALENDARS ---START---
async function setMeeting(
  meeting_title,
  meeting_location,
  meeting_description,
  meeting_timeZone,
  calendarIds,
  authArray,
  scheduled_date,
  scheduled_start_time,
  scheduled_end_time,
  firstSlotStart,
  meetingEndTime
) {
  // const amsterdamTimeZone = 'Europe/Amsterdam';
  const amsterdamTimeZone = meeting_timeZone;

  function convertToAmsterdamTime(utcTimeString) {
    return moment.utc(utcTimeString).tz(amsterdamTimeZone).format();
  }

  // Convert each meeting time to Amsterdam time zone
  const firstSlotStartAmsterdam = convertToAmsterdamTime(firstSlotStart);
  const meetingEndTimeAmsterdam = convertToAmsterdamTime(meetingEndTime);

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

  const content = await fs.readFile(TOKEN_PATH);
  const savedCredentials = JSON.parse(content);

  console.log("calendarIds setMeeting function:-----------");
  console.log(calendarIds);
  const organizer = calendarIds[0];

  const filteredCredentials = savedCredentials.filter((cred) =>
    organizer.includes(cred.user_email)
  );

  console.log("filteredCredentials:-------------");
  console.log(filteredCredentials);

  const filteredAccessToken = filteredCredentials.map(
    (accessTokenF) => accessTokenF.access_token
  );

  console.log("filteredAccessToken:---------");
  console.log(filteredAccessToken);

  axios
    .post("https://graph.microsoft.com/v1.0/me/calendar/events", event, {
      headers: {
        Authorization: `Bearer ${filteredAccessToken}`, // Use User A's access token
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("Meeting created by User A (host):", response.data);
    })
    .catch((error) => {
      console.error("Error creating meeting:", error.response.data);
    });
}
// FUNCTION TO SCHEDULE MEETING INTO USERS CALENDARS ---END---


// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
function calculateCommonFreeSlots(
  startTime,
  endTime,
  busySlots,
  jsonData,
  calendarIds
) {
  console.log("calculateCommonFreeSlotsHit:--------------");

  const busySlotsFlat = busySlots.flat();

  // console.log("busySlotsFlat:----------")
  // console.log(busySlotsFlat)

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

  const commonFreeSlots = findCommonFreeSlots(
    startTime,
    endTime,
    busyPeriods,
    jsonData
  );
  return commonFreeSlots;
}
// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---END---


// FUNCTION TO FIND COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
function findCommonFreeSlots(startTime, endTime, busyPeriods, jsonDataFormate) {
  let data = jsonDataFormate;
  let users = busyPeriods;

  moment.tz.setDefault(data.meeting_timeZone);
  let freeSlotsResult = [];

  var startDate = moment(data.start_date).tz(data.meeting_timeZone);
  var endDate = moment(data.end_date).tz(data.meeting_timeZone);

  // Array to store the dates in between
  var datesInBetween = [];
  // Current date to start iteration
  var currentDate = startDate.clone();

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


app.get(
  "/auth/microsoft",
  passport.authenticate("microsoft", {
    session: false,
    successRedirect: "http://localhost:3000",
    failureRedirect: "/login", // Redirect to login page or handle error
  })
);
// GET ROUTE TO CALL WHEN NEW USER SUCCESSFULLY AUTHENTICATES THEIR ACCOUNT ---END---



app.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/", function (req, res) {
  res.render("index", { user: req.user });
});

app.get("/login", function (req, res) {
  res.render("login", { user: req.user });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});


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
      scheduled_date,
      scheduled_start_time,
      scheduled_end_time,
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
      meeting_min_duration,
      scheduled_date,
      scheduled_start_time,
      scheduled_end_time
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
