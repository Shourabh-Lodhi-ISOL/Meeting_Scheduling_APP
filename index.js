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
  endTime
) {
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

  if (
    startHour < 9 ||
    (startHour === 9 && startMinutes < 30) ||
    endHour > 18 ||
    (endHour === 18 && endMinutes > 30)
  ) {
    console.log("Meeting can only be scheduled between 9:30 am to 6:30 pm.");
    return false; // Indicate failure
  }

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
      busySlotsArray
    );

    // Continue with the rest of your code...
  } else {
    console.log("Error processing freeBusy responses. Aborting scheduling.");
    return false;
  }
  console.log("commonFreeSlots:-----");
  console.log(commonFreeSlots);

  // Minimum duration required for the meeting
  const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

  // Filter common free slots that are long enough for the meeting
  const suitableSlots = commonFreeSlots.filter((slot) => {
    const slotDuration =
      new Date(slot.end).getTime() - new Date(slot.start).getTime();
    return slotDuration >= minimumMeetingDuration;
  });

  if (suitableSlots.length > 0) {
    const firstSlot = suitableSlots[0];
    const meetingEndTime = new Date(
      new Date(firstSlot.start).getTime() + minimumMeetingDuration
    );
    const event = {
      summary,
      description,
      start: {
        dateTime: firstSlot.start,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: meetingEndTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
    };

    for (const calendarId of calendarIds) {
      const calendarIndex = calendarIds.indexOf(calendarId);
      await calendars[calendarIndex].events.insert({
        auth: authArray[calendarIndex],
        calendarId: calendarId,
        resource: event,
      });
    }

    console.log(
      `Meeting scheduled for ${
        firstSlot.start
      } to ${meetingEndTime.toISOString()}`
    );
    return true; // Indicate success
  } else {
    console.log("No suitable free slots found for the meeting.");
    return false; // Indicate failure
  }
}
// FUNCTION TO SCHEDULE MEETING BETWEEN AUTH USERS ---END---


// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
function calculateCommonFreeSlots(startTime, endTime, busySlots) {
  const busyPeriods = busySlots.map((obj) => {
    const { busy } = Object.values(obj)[0];
    return busy;
  });
  console.log("busyPeriods:-----");
  console.log(busyPeriods);

  const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

  return commonFreeSlots;
}
// FUNCTION TO CALCULATE COMMON FREE SLOTS BETWEEN AUTH USERS ---END---


// FUNCTION TO FIND COMMON FREE SLOTS BETWEEN AUTH USERS ---START---
function findCommonFreeSlots(startTime, endTime, busyPeriods) {
  const mergedBusyPeriods = [].concat(...busyPeriods);
  mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

  const commonFreeSlots = [];
  let currentStartTime = new Date(startTime);

  for (const busyPeriod of mergedBusyPeriods) {
    const busyStartTime = new Date(busyPeriod.start);
    const busyEndTime = new Date(busyPeriod.end);

    if (currentStartTime < busyStartTime) {
      if (busyStartTime <= endTime) {
        commonFreeSlots.push({
          start: currentStartTime.toISOString(),
          end: busyStartTime.toISOString(),
        });
        currentStartTime = new Date(busyEndTime);
      }
    } else {
      currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
    }
  }

  if (currentStartTime < endTime) {
    commonFreeSlots.push({
      start: currentStartTime.toISOString(),
      end: endTime.toISOString(),
    });
  }

  return commonFreeSlots;
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
    const { calendarIds, summary, description, startTime, endTime } = req.body;

    if (!calendarIds || !summary || !description || !startTime || !endTime) {
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

    // Schedule meetings for all users
    const success = await scheduleMeeting(
      authArray,
      userEmailArray,
      summary,
      description,
      new Date(startTime),
      new Date(endTime)
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
