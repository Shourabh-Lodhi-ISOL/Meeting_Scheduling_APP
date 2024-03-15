// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_mail = "ethanhunt7336@gmail.com"
// const user_pass = "Ethanwick1@"
// const service = "gamil"

// async function sendAuthorizationEmail(calendarIdss, authUrl) {
//   const transporter = nodemailer.createTransport({
//     service: service,
//     auth: {
//       user: user_mail,
//       pass: user_pass,
//     },
//   });

//   const encodedUrl = encodeURIComponent(authUrl);
//   const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
// </body>
//     </html>
//   `;

//   const mailOptions = {
//     from: user_mail,
//     to: calendarIdss.join(','),
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent,
//   };

//   await transporter.sendMail(mailOptions);
// }

// // async function authorize(calendarIds) {
// //   let client = await loadSavedCredentialsIfExist();
// //   if (client) {
// //     return client;
// //   }

// //   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

// //   const { client_secret, client_id, redirect_uris } = credentials.installed;
// //   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// //   // Generate an authentication URL
// //   const authUrl = oAuth2Client.generateAuthUrl({
// //     access_type: 'offline',
// //     scope: SCOPES,
// //   });

// //   // Send the authorization URL to the user via email
// //   await sendAuthorizationEmail(calendarIds, authUrl);

// //   // Perform any other actions as needed
// //   // (e.g., wait for user interaction, provide instructions)

// //   return null; // Indicate that authorization is pending
// // }

// // async function authorize(calendarIds) {
// //   let client = await loadSavedCredentialsIfExist();
// //   if (client) {
// //     return client;
// //   }

// //   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

// //   const { client_secret, client_id, redirect_uris } = credentials.installed;
// //   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// //   // Generate an authentication URL
// //   const authUrl = oAuth2Client.generateAuthUrl({
// //     access_type: 'offline',
// //     scope: SCOPES,
// //   });

// //   // Send the authorization URL to the user via email
// //   await sendAuthorizationEmail(calendarIds, authUrl);

// // }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     redirect_uri: 'http://localhost' // Update this with your actual redirect URI
//   });

//   // return client;

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 10AM to 6PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 3 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10AM to 6PM.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     // Continue with scheduling the meeting using the obtained auth object
//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_mail = "ethanwick7336@gmail.com"
// const user_pass = "Ethanwick1@"
// const service = "gmail"

// async function sendAuthorizationEmail(calendarIdss, authUrl) {
//   const transporter = nodemailer.createTransport({
//     service: service,
//     auth: {
//       user: user_mail,
//       pass: user_pass,
//     },
//   });

//   const encodedUrl = encodeURIComponent(authUrl);
//   const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
// </body>
//     </html>
//   `;

//   const mailOptions = {
//     from: user_mail,
//     to: calendarIdss.join(','),
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent,
//   };

//   await transporter.sendMail(mailOptions);
// }

// // async function authorize(calendarIds) {
// //   let client = await loadSavedCredentialsIfExist();
// //   if (client) {
// //     return client;
// //   }

// //   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

// //   const { client_secret, client_id, redirect_uris } = credentials.installed;
// //   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// //   // Generate an authentication URL
// //   const authUrl = oAuth2Client.generateAuthUrl({
// //     access_type: 'offline',
// //     scope: SCOPES,
// //   });

// //   // Send the authorization URL to the user via email
// //   await sendAuthorizationEmail(calendarIds, authUrl);

// //   // Perform any other actions as needed
// //   // (e.g., wait for user interaction, provide instructions)

// //   return null; // Indicate that authorization is pending
// // }

// // async function authorize(calendarIds) {
// //   let client = await loadSavedCredentialsIfExist();
// //   if (client) {
// //     return client;
// //   }

// //   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

// //   const { client_secret, client_id, redirect_uris } = credentials.installed;
// //   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// //   // Generate an authentication URL
// //   const authUrl = oAuth2Client.generateAuthUrl({
// //     access_type: 'offline',
// //     scope: SCOPES,
// //   });

// //   // Send the authorization URL to the user via email
// //   await sendAuthorizationEmail(calendarIds, authUrl);

// // }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     redirect_uri: 'http://localhost' // Update this with your actual redirect URI
//   });

//   // return client;

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 10AM to 6PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 3 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10AM to 6PM.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     // Continue with scheduling the meeting using the obtained auth object
//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// const user_mail = "ethanwich2767@outlook.com";
// const user_pass = "Johnhunt1@"; // Use App Password or Gmail password

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// async function sendAuthorizationEmail(calendarIdss, authUrl) {
//   const transporter = nodemailer.createTransport({
//     service: "outlook",
//     auth: {
//       user: user_mail,
//       pass: user_pass,
//     },
//   });

//   const encodedUrl = encodeURIComponent(authUrl);
//   const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

//   const mailOptions = {
//     from: user_mail,
//     to: calendarIdss.join(','),
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent,
//   };

//   await transporter.sendMail(mailOptions);
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     redirect_uri: 'http://localhost' // Update this with your actual redirect URI
//   });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Indicate that authorization is pending
//   return null;
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
//   if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//     console.log('Meeting can only be scheduled on Thursdays between 10AM to 6PM.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 3 pm to 6 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const endMinutes = endTime.getMinutes();
//   const endSeconds = endTime.getSeconds();

//   if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//     console.log('Meeting can only be scheduled between 10AM to 6PM.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     // Continue with scheduling the meeting using the obtained auth object
//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// // const { ServerClient } = require('postmark');

// // const app = express();
// // app.use(cors());
// // app.use(bodyParser.json());

// // // const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// // const SCOPES = [
// //   'https://www.googleapis.com/auth/calendar.readonly',
// //   'https://www.googleapis.com/auth/calendar.events'
// // ];

// // const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// // const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const credentials = JSON.parse(content);
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// // async function saveCredentials(client) {
// //   const content = await fs.readFile(CREDENTIALS_PATH);
// //   const keys = JSON.parse(content);
// //   const key = keys.installed || keys.web;
// //   const payload = JSON.stringify({
// //     type: 'authorized_user',
// //     client_id: key.client_id,
// //     client_secret: key.client_secret,
// //     refresh_token: client.credentials.refresh_token,
// //   });
// //   await fs.writeFile(TOKEN_PATH, payload);
// // }

// // async function authorize() {
// //   let client = await loadSavedCredentialsIfExist();
// //   if (client) {
// //     return client;
// //   }
// //   client = await authenticate({
// //     scopes: SCOPES,
// //     keyfilePath: CREDENTIALS_PATH,
// //   });
// //   if (client.credentials) {
// //     await saveCredentials(client);
// //   }
// //   return client;
// // }

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIdss, authUrl) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

//   const mailOptions = {
//     from: user_name,
//     to: calendarIdss.join(','),

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.response);
//     // saveCredentials();
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// // async function sendAuthorizationEmail(calendarIdss, authUrl) {
// //   const transporter = nodemailer.createTransport({
// //     service: 'gmail',
// //     auth: {
// //       user: user_name,
// //       pass: app_pass
// //     },
// //   });

// //   const mailOptions = {
// //     from: user_name,
// //     to: calendarIdss.join(','),
// //     subject: 'Authorize Google Calendar API',
// //     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
// //     text: `Click the following link to authorize the Google Calendar API:`
// //   };

// //   try {
// //     const info = await transporter.sendMail(mailOptions);
// //     console.log('Email sent:', info.response);
// //   } catch (error) {
// //     console.error('Error sending email:', error.message);
// //     throw error; // Rethrow the error to be caught in the calling function
// //   }
// // }

// // async function sendAuthorizationEmail(calendarIdss, authUrl) {
// //   const transporter = nodemailer.createTransport({
// //   //   service: 'outlook',
// //   //   auth: {
// //   //     // user: 'johnhunt5647@outlook.com', // Replace with your Gmail email
// //   //     // pass: 'Johnhunt1@', // Replace with your Gmail password
// //   //     user: 'ethanwich2767@outlook.com', // Replace with your Gmail email
// //   //     pass: 'Ethanwick1@', // Replace with your Gmail password
// //   //   },
// //   // });

// //   service: 'gmail',
// //   auth: {
// //     user: user_name, // Replace with your Gmail email
// //     pass: app_pass // Replace with your Gmail password
// //   },
// // });

// //   const mailOptions = {
// //     from: 'ethanwick7336@gmail.com', // Replace with your Gmail email
// //     to: calendarIdss.join(','),
// //     subject: 'Authorize Google Calendar API',
// //     text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
// //     // text: `Click the following link to authorize the Google Calendar API:`,
// //   };

// //   await transporter.sendMail(mailOptions);
// // }

// // async function sendAuthorizationEmail(calendarIdss, authUrl) {
// //   const postmarkClient = new ServerClient('0537cf9f-4de1-407c-9fcb-09a2fa1ae8c9'); // Replace with your Postmark API key

// //   const message = {
// //     From: 'shourabh.lodhi@isol.co.in', // Replace with your email address
// //     To: calendarIdss.join(','),
// //     Subject: 'Authorize Google Calendar API',
// //     TextBody: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
// //   };

// //   try {
// //     await postmarkClient.sendEmail(message);
// //     console.log('Authorization email sent successfully');
// //   } catch (error) {
// //     console.error('Error sending authorization email:', error.message);
// //   }
// // }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)
//   // await saveCredentials(client);
//   await saveCredentials(oAuth2Client);

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 3 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 3 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //     const { calendarIds, summary, description, startTime, endTime } = req.body;

// //     if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //       return res.status(400).json({ error: 'Missing required parameters' });
// //     }

// //     const auth = await authorize();
// //     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

// //     return res.json({ message: 'Meeting scheduled successfully' });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => {
// //   console.log(`Server is running on port ${PORT}`);
// // });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     // Continue with scheduling the meeting using the obtained auth object
//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIdss, authUrl) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

//   const mailOptions = {
//     from: user_name,
//     to: calendarIdss.join(','),

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 3 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 3 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     // Continue with scheduling the meeting using the obtained auth object
//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIdss, authUrl) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//   //   const htmlContent = `
//   //   <html>
//   //     <head>
//   //       <title>Authorization Link</title>
//   //     </head>
//   //     <body>
//   //       <p>Click the following link to authorize the Google Calendar API:</p>
//   //       <a href="${authUrl}" target="_blank">click here</a>
//   //     </body>
//   //   </html>
//   // `;

//   const htmlContent = `
//   <html>
//     <head>
//       <title>Authorization Link</title>
//     </head>
//     <body>
//       <p>Click the following link to authorize the Google Calendar API:</p>
//     </body>
//   </html>
// `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIdss.join(','),

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 3 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 3 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     // Continue with scheduling the meeting using the obtained auth object
//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIdss, authUrl) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

// //   const htmlContent = `
// //   <html>
// //     <head>
// //       <title>Authorization Link</title>
// //     </head>
// //     <body>
// //       <p>Click the following link to authorize the Google Calendar API:</p>
// //     </body>
// //   </html>
// // `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIdss.join(','),

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   // const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 3 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 3 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the tokens to token.json
//     await saveCredentials(oAuth2Client);

//     // Redirect or respond with a success message
//     // res.redirect('/oauth2callback'); // Redirect to your HTML page

//     // res.redirect('/oauth2callback'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     // Continue with scheduling the meeting using the obtained auth object
//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIdss, authUrl) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

// //   const htmlContent = `
// //   <html>
// //     <head>
// //       <title>Authorization Link</title>
// //     </head>
// //     <body>
// //       <p>Click the following link to authorize the Google Calendar API:</p>
// //     </body>
// //   </html>
// // `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIdss.join(','),

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   // const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 3 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 3 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.post('/send-auth-email', async (req, res) => {
//   try {
//     const { calendarIds } = req.body;

//     if (!calendarIds) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     return res.json({ message: 'Authentication email sent successfully.' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the tokens to token.json
//     await saveCredentials(oAuth2Client);

//     // Redirect or respond with a success message
//     // res.redirect('/oauth2callback'); // Redirect to your HTML page

//     // res.redirect('/oauth2callback'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     const auth = await authorize(calendarIds);

//     // If authorization is pending, return a response indicating that
//     if (!auth) {
//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//     }

//     // Continue with scheduling the meeting using the obtained auth object
//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

// //   const htmlContent = `
// //   <html>
// //     <head>
// //       <title>Authorization Link</title>
// //     </head>
// //     <body>
// //       <p>Click the following link to authorize the Google Calendar API:</p>
// //     </body>
// //   </html>
// // `

//   const mailOptions = {
//     from: user_name,
//     // to: calendarIdss.join(','),
//     // to: calendarIds.join(','),
//     to: calendarIds,
//     // to: calendarIds ? calendarIds.join(',') : '',

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   // const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
// console.log('calendarIds------')
// console.log(calendarIds)
//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// // async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
// //   // Check if the selected day is Thursday
// // if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
// //   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
// //   return false; // Indicate failure
// // }

// // // Check if the selected time is between 3 pm to 6 pm
// // const startHour = startTime.getHours();
// // const endHour = endTime.getHours();
// // const endMinutes = endTime.getMinutes();
// // const endSeconds = endTime.getSeconds();

// // if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
// //   console.log('Meeting can only be scheduled between 3 pm to 6 pm.');
// //   return false; // Indicate failure
// // }

// //   const calendar = google.calendar({ version: 'v3', auth });

// //   const freeBusyRequests = calendarIds.map((calendarId) => ({
// //     id: calendarId,
// //   }));

// //   const freeBusyResponse = await calendar.freebusy.query({
// //     auth: auth,
// //     requestBody: {
// //       timeMin: startTime.toISOString(),
// //       timeMax: endTime.toISOString(),
// //       items: freeBusyRequests,
// //     },
// //   });

// //   const busySlots = freeBusyResponse.data.calendars;

// //   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

// //   // Minimum duration required for the meeting
// //   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

// //   // Filter common free slots that are long enough for the meeting
// //   const suitableSlots = commonFreeSlots.filter(slot => {
// //     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
// //     return slotDuration >= minimumMeetingDuration;
// //   });

// //   if (suitableSlots.length > 0) {
// //     const firstSlot = suitableSlots[0];
// //     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
// //     const event = {
// //       summary,
// //       description,
// //       start: {
// //         dateTime: firstSlot.start,
// //         timeZone: 'Asia/Kolkata',
// //       },
// //       end: {
// //         dateTime: meetingEndTime.toISOString(),
// //         timeZone: 'Asia/Kolkata',
// //       },
// //     };

// //     for (const calendarId of calendarIds) {
// //       await calendar.events.insert({
// //         auth: auth,
// //         calendarId: calendarId,
// //         resource: event,
// //       });
// //     }

// //     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
// //     return true; // Indicate success
// //   } else {
// //     console.log('No suitable free slots found for the meeting.');
// //     return false; // Indicate failure
// //   }
// // }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// // app.post('/send-auth-email', async (req, res) => {
// //   try {
// //     const { calendarIds } = req.body;

// //     if (!calendarIds) {
// //       return res.status(400).json({ error: 'Missing required parameters' });
// //     }

// //     const auth = await authorize(calendarIds);

// //     // If authorization is pending, return a response indicating that
// //     if (!auth) {
// //       return res.json({ message: 'Authorization email sent. Please check your email.' });
// //     }

// //     return res.json({ message: 'Authentication email sent successfully.' });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // app.get('/', (req, res) => {
// //   res.send("Authentication Successfull.")
// // })

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the tokens to token.json
//     await saveCredentials(oAuth2Client);

//     // Redirect or respond with a success message
//     // res.redirect('/oauth2callback'); // Redirect to your HTML page

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //     const { calendarIds, summary, description, startTime, endTime } = req.body;

// //     if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //       return res.status(400).json({ error: 'Missing required parameters' });
// //     }

// //     const auth = await authorize(calendarIds);

// //     // If authorization is pending, return a response indicating that
// //     if (!auth) {
// //       return res.json({ message: 'Authorization email sent. Please check your email.' });
// //     }

// //     // Continue with scheduling the meeting using the obtained auth object
// //     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

// //     return res.json({ message: 'Meeting scheduled successfully' });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //     const { calendarIds, summary, description, startTime, endTime } = req.body;

// //     if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //       return res.status(400).json({ error: 'Missing required parameters' });
// //     }

// //     const auth = await authorize();
// //     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

// //     return res.json({ message: 'Meeting scheduled successfully' });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

// //   const htmlContent = `
// //   <html>
// //     <head>
// //       <title>Authorization Link</title>
// //     </head>
// //     <body>
// //       <p>Click the following link to authorize the Google Calendar API:</p>
// //     </body>
// //   </html>
// // `

//   const mailOptions = {
//     from: user_name,
//     // to: calendarIdss.join(','),
//     // to: calendarIds.join(','),
//     to: calendarIds,
//     // to: calendarIds ? calendarIds.join(',') : '',

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// // async function authorize(calendarIds) {
// //   let client = await loadSavedCredentialsIfExist();
// //   if (client) {
// //     return client;
// //   }

// //   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

// //   // const { client_secret, client_id, redirect_uris } = credentials.installed;
// //   const { client_secret, client_id, redirect_uris } = credentials.web;
// //   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
// //   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

// //   // Generate an authentication URL
// //   const authUrl = oAuth2Client.generateAuthUrl({
// //     access_type: 'offline',
// //     scope: SCOPES,
// //   });
// // console.log('calendarIds------')
// // console.log(calendarIds)
// //   // Send the authorization URL to the user via email
// //   await sendAuthorizationEmail(calendarIds, authUrl);

// //   // Perform any other actions as needed
// //   // (e.g., wait for user interaction, provide instructions)

// //   return null; // Indicate that authorization is pending
// // }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     // include_granted_scopes: true
//   });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Return the OAuth2 client to indicate that authorization is pending
//   return oAuth2Client;
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the tokens to token.json
//     await saveCredentials(oAuth2Client);

//     // Redirect or respond with a success message
//     // res.redirect('/oauth2callback'); // Redirect to your HTML page

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // const SCOPES = [
// //   'https://www.googleapis.com/auth/calendar.readonly',
// //   'https://www.googleapis.com/auth/calendar.events',
// // ];

// const SCOPES = 'https://www.googleapis.com/auth/calendar'

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   });

//   console.log(payload)
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

// //   const htmlContent = `
// //   <html>
// //     <head>
// //       <title>Authorization Link</title>
// //     </head>
// //     <body>
// //       <p>Click the following link to authorize the Google Calendar API:</p>
// //     </body>
// //   </html>
// // `

//   const mailOptions = {
//     from: user_name,
//     // to: calendarIdss.join(','),
//     // to: calendarIds.join(','),
//     to: calendarIds,
//     // to: calendarIds ? calendarIds.join(',') : '',

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// // async function authorize(calendarIds) {
// //   let client = await loadSavedCredentialsIfExist();
// //   if (client) {
// //     return client;
// //   }

// //   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

// //   // const { client_secret, client_id, redirect_uris } = credentials.installed;
// //   const { client_secret, client_id, redirect_uris } = credentials.web;
// //   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
// //   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

// //   // Generate an authentication URL
// //   const authUrl = oAuth2Client.generateAuthUrl({
// //     access_type: 'offline',
// //     scope: SCOPES,
// //   });
// // console.log('calendarIds------')
// // console.log(calendarIds)
// //   // Send the authorization URL to the user via email
// //   await sendAuthorizationEmail(calendarIds, authUrl);

// //   // Perform any other actions as needed
// //   // (e.g., wait for user interaction, provide instructions)

// //   return null; // Indicate that authorization is pending
// // }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     // include_granted_scopes: true
//   });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Return the OAuth2 client to indicate that authorization is pending
//   return oAuth2Client;
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the tokens to token.json
//     await saveCredentials(oAuth2Client);

//     // Redirect or respond with a success message
//     // res.redirect('/oauth2callback'); // Redirect to your HTML page

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // const SCOPES = [
// //   'https://www.googleapis.com/auth/calendar.readonly',
// //   'https://www.googleapis.com/auth/calendar.events',
// // ];

// const SCOPES = 'https://www.googleapis.com/auth/calendar'

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// // async function saveCredentials(client) {
// //   const content = await fs.readFile(CREDENTIALS_PATH);
// //   const keys = JSON.parse(content);
// //   const key = keys.installed || keys.web;
// //   const payload = JSON.stringify({
// //     type: 'authorized_user',
// //     client_id: key.client_id,
// //     client_secret: key.client_secret,
// //     refresh_token: client.credentials.refresh_token,
// //   });

// //   console.log(payload)
// //   await fs.writeFile(TOKEN_PATH, payload);
// // }

// async function saveCredentials(oAuth2Client) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: oAuth2Client.credentials.refresh_token,
//   });

//   console.log(payload)
//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `;

// //   const htmlContent = `
// //   <html>
// //     <head>
// //       <title>Authorization Link</title>
// //     </head>
// //     <body>
// //       <p>Click the following link to authorize the Google Calendar API:</p>
// //     </body>
// //   </html>
// // `

//   const mailOptions = {
//     from: user_name,
//     // to: calendarIdss.join(','),
//     // to: calendarIds.join(','),
//     to: calendarIds,
//     // to: calendarIds ? calendarIds.join(',') : '',

//     subject: 'Authorize Google Calendar API',
//     // text: `Click the following link to authorize the Google Calendar API: ${authUrl}`,
//     // text: `Click the following link to authorize the Google Calendar API:`
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// // async function authorize(calendarIds) {
// //   let client = await loadSavedCredentialsIfExist();
// //   if (client) {
// //     return client;
// //   }

// //   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

// //   // const { client_secret, client_id, redirect_uris } = credentials.installed;
// //   const { client_secret, client_id, redirect_uris } = credentials.web;
// //   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
// //   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

// //   // Generate an authentication URL
// //   const authUrl = oAuth2Client.generateAuthUrl({
// //     access_type: 'offline',
// //     scope: SCOPES,
// //   });
// // console.log('calendarIds------')
// // console.log(calendarIds)
// //   // Send the authorization URL to the user via email
// //   await sendAuthorizationEmail(calendarIds, authUrl);

// //   // Perform any other actions as needed
// //   // (e.g., wait for user interaction, provide instructions)

// //   return null; // Indicate that authorization is pending
// // }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     // include_granted_scopes: true
//   });

//   // oAuth2Client.on('tokens', (tokens) => {
//   //   if (tokens.refresh_token) {
//   //     // store the refresh_token in your secure persistent database
//   //     console.log(tokens.refresh_token);
//   //   }
//   //   console.log(tokens.access_token);
//   // });

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Return the OAuth2 client to indicate that authorization is pending
//   return oAuth2Client;
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;
//   console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//     const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     // const { tokens } = await oAuth2Client.getToken(code);
//     // oAuth2Client.setCredentials(tokens);
//     // const a = JSON.stringify(tokens)
//     // console.log("Tokens: " + a)

//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);
//     console.log("Tokens:--------- ")
//     console.log(tokens)

//     // oAuth2Client.on('tokens', (tokens) => {
//     //   if (tokens.refresh_token) {
//     //     // store the refresh_token in your secure persistent database
//     //     // console.log(tokens.refresh_token);
//     //     // console.log("tokens: ")
//     //     // console.log(tokens)
//     //   }

//     //   console.log("tokens:---------- ")
//     //   console.log(tokens)

//     // });

//     // Save the tokens to token.json
//     await saveCredentials(oAuth2Client);

//     // Redirect or respond with a success message
//     // res.redirect('/oauth2callback'); // Redirect to your HTML page

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // const SCOPES = [
// //   'https://www.googleapis.com/auth/calendar.readonly',
// //   'https://www.googleapis.com/auth/calendar.events',
// // ];

// const SCOPES = 'https://www.googleapis.com/auth/calendar'

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// // async function saveCredentials(oAuth2Client) {
// //   const content = await fs.readFile(CREDENTIALS_PATH);
// //   const keys = JSON.parse(content);
// //   const key = keys.installed || keys.web;
// //   const payload = JSON.stringify({
// //     type: 'authorized_user',
// //     client_id: key.client_id,
// //     client_secret: key.client_secret,
// //     refresh_token: oAuth2Client.credentials.refresh_token,
// //   });

// //   console.log(payload)
// //   await fs.writeFile(TOKEN_PATH, payload);
// // }

// // async function saveCredentials(oAuth2Client) {
// //   const content = await fs.readFile(CREDENTIALS_PATH);
// //   const keys = JSON.parse(content);
// //   const key = keys.installed || keys.web;
// //   const payload = JSON.stringify({
// //     type: 'authorized_user',
// //     client_id: key.client_id,
// //     client_secret: key.client_secret,
// //     refresh_token: oAuth2Client.refresh_token,
// //   });
// //   // console.log(refresh_token)

// //   console.log(payload)
// //   await fs.writeFile(TOKEN_PATH, payload);
// // }

// // async function saveCredentials(tokens) {
// //   const content = await fs.readFile(CREDENTIALS_PATH);
// //   const keys = JSON.parse(content);
// //   const key = keys.installed || keys.web;
// //   const payload = JSON.stringify({
// //     type: 'authorized_user',
// //     client_id: key.client_id,
// //     client_secret: key.client_secret,
// //     refresh_token: tokens.refresh_token,
// //   });
// //   // console.log(refresh_token)

// //   console.log(payload)
// //   await fs.writeFile(TOKEN_PATH, payload);
// // }

// async function saveCredentials(tokens) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   console.log("saveCredentials Token:----------")
//   console.log(tokens.tokens.refresh_token)
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token, // Use tokens.refresh_token here
//   });

//   console.log(payload);

//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

// //   const htmlContent = `
// //   <html>
// //     <head>
// //       <title>Authorization Link</title>
// //     </head>
// //     <body>
// //       <p>Click the following link to authorize the Google Calendar API:</p>
// //     </body>
// //   </html>
// // `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   // const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   // const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;
//   console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);
//     // console.log("Tokens:--------- ")
//     // console.log(tokens)

//     // Save the tokens to token.json
//     // await saveCredentials(oAuth2Client);

//     await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(tokens) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   console.log("saveCredentials Token:----------")
//   console.log(tokens.tokens.refresh_token)
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token,
//   });

//   console.log(payload);

//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;
//   console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// Send authentication email and saves the token.json file for the authenticated test user
// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(tokens) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   console.log("saveCredentials Token:----------")
//   console.log(tokens.tokens.refresh_token)
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token,
//   });

//   console.log(payload);

//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;
//   console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const credentials = JSON.parse(content);
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content) || [];
// //     return savedCredentials.map(cred => google.auth.fromJSON(cred));
// //   } catch (err) {
// //     console.error('Error loading saved credentials:', err.message);
// //     return null;
// //   }
// // }

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content) || [];

//     if (savedCredentials.length === 0) {
//       console.log('No saved credentials found.');
//       return null;
//     }

//     const clients = savedCredentials.map(credentials => {
//       try {
//         const authClient = google.auth.fromJSON(credentials);
//         // Log the loaded credentials for debugging
//         console.log('Loaded credentials:', credentials);
//         return authClient;
//       } catch (error) {
//         console.error('Error creating auth client from saved credentials:', error.message);
//         return null;
//       }
//     });

//     // Filter out any null values from the array
//     const validClients = clients.filter(client => client !== null);

//     return validClients.length > 0 ? validClients : null;
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     return null;
//   }
// }

// // async function saveCredentials(tokens) {
// //   const content = await fs.readFile(CREDENTIALS_PATH);
// //   const keys = JSON.parse(content);
// //   const key = keys.installed || keys.web;
// //   console.log("saveCredentials Token:----------")
// //   console.log(tokens.tokens.refresh_token)
// //   const payload = JSON.stringify({
// //     type: 'authorized_user',
// //     client_id: key.client_id,
// //     client_secret: key.client_secret,
// //     refresh_token: tokens.tokens.refresh_token,
// //   });

// //   console.log(payload);

// //   await fs.writeFile(TOKEN_PATH, payload);
// // }

// // async function saveCredentials(tokens, userEmail) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content) || [];

// //     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
// //     const key = keys.installed || keys.web;

// //     const newCredentials = {
// //       type: 'authorized_user',
// //       client_id: key.client_id,
// //       client_secret: key.client_secret,
// //       refresh_token: tokens.tokens.refresh_token,
// //       user_email: userEmail,
// //     };

// //     // Check if credentials for the user already exist, update if so, otherwise add new credentials
// //     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

// //     if (index !== -1) {
// //       savedCredentials[index] = newCredentials;
// //     } else {
// //       savedCredentials.push(newCredentials);
// //     }

// //     const payload = JSON.stringify(savedCredentials);

// //     await fs.writeFile(TOKEN_PATH, payload);

// //     console.log(`Credentials saved for ${userEmail}`);
// //   } catch (err) {
// //     console.error('Error saving credentials:', err.message);
// //     throw err;
// //   }
// // }

// // async function saveCredentials(tokens) {
// //   try {
// //     // Read existing credentials from the token.json file
// //     const content = await fs.readFile(TOKEN_PATH);

// //     // Parse the existing content or initialize an empty array if it's not valid JSON
// //     let existingCredentials;
// //     try {
// //       existingCredentials = JSON.parse(content);
// //       if (!Array.isArray(existingCredentials)) {
// //         existingCredentials = [];
// //       }
// //     } catch (parseError) {
// //       existingCredentials = [];
// //     }

// //     // Extract client_id and client_secret from the credentials.json file
// //     const credentialsContent = await fs.readFile(CREDENTIALS_PATH);
// //     const keys = JSON.parse(credentialsContent);
// //     const key = keys.installed || keys.web;

// //     // Create new credentials object
// //     const newCredentials = {
// //       type: 'authorized_user',
// //       client_id: key.client_id,
// //       client_secret: key.client_secret,
// //       refresh_token: tokens.tokens.refresh_token,
// //     };

// //     // Append new credentials to the existing array
// //     existingCredentials.push(newCredentials);

// //     // Write the updated credentials array back to the token.json file
// //     await fs.writeFile(TOKEN_PATH, JSON.stringify(existingCredentials, null, 2));
// //   } catch (err) {
// //     console.error('Error saving credentials:', err);
// //     throw err;
// //   }
// // }

// // async function saveCredentials(tokens, userEmail) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content) || [];

// //     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
// //     const key = keys.installed || keys.web;

// //     const newCredentials = {
// //       type: 'authorized_user',
// //       client_id: key.client_id,
// //       client_secret: key.client_secret,
// //       refresh_token: tokens.tokens.refresh_token,
// //       user_email: userEmail,
// //     };

// //     // Check if credentials for the user already exist, update if so, otherwise add new credentials
// //     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

// //     if (index !== -1) {
// //       savedCredentials[index] = newCredentials;
// //     } else {
// //       savedCredentials.push(newCredentials);
// //     }

// //     const payload = JSON.stringify(savedCredentials);

// //     await fs.writeFile(TOKEN_PATH, payload);

// //     console.log(`Credentials saved for ${userEmail}`);
// //   } catch (err) {
// //     console.error('Error saving credentials:', err.message);
// //     throw err;
// //   }
// // }

// // async function saveCredentials(tokens, userEmail) {
// //   try {
// //     let content;

// //     try {
// //       content = await fs.readFile(TOKEN_PATH, 'utf-8');
// //     } catch (readError) {
// //       // Handle the case when the file doesn't exist or cannot be read
// //       content = '';
// //     }

// //     const savedCredentials = JSON.parse(content) || [];

// //     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
// //     const key = keys.installed || keys.web;

// //     const newCredentials = {
// //       type: 'authorized_user',
// //       client_id: key.client_id,
// //       client_secret: key.client_secret,
// //       refresh_token: tokens.tokens.refresh_token,
// //       user_email: userEmail,
// //     };

// //     // Check if credentials for the user already exist, update if so, otherwise add new credentials
// //     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

// //     if (index !== -1) {
// //       savedCredentials[index] = newCredentials;
// //     } else {
// //       savedCredentials.push(newCredentials);
// //     }

// //     const payload = JSON.stringify(savedCredentials);

// //     await fs.writeFile(TOKEN_PATH, payload);

// //     console.log(`Credentials saved for ${userEmail}`);
// //   } catch (err) {
// //     console.error('Error saving credentials:', err.message);
// //     throw err;
// //   }
// // }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     console.log("content:----------")
// //     console.log(content)
// //     const credentials = JSON.parse(content);
// //     console.log("credentials:-----------")
// //     console.log(credentials)
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:----------------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {
//       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));
//       // console.log("clients:-----------------")
//       // console.log(clients)
//       return clients;
//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //       const { calendarIds, summary, description, startTime, endTime } = req.body;

// //       if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //           return res.status(400).json({ error: 'Missing required parameters' });
// //       }

// //       // Call the scheduleMeeting function to schedule the meeting
// //       const auth = await loadSavedCredentialsIfExist();
// //       if (!auth) {
// //           return res.status(400).json({ error: 'Please authorize first' });
// //       }

// //       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

// //       return res.json({ message: 'Meeting scheduled successfully' });
// //   } catch (error) {
// //       console.error(error);
// //       return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     console.log("content:----------")
// //     console.log(content)
// //     const credentials = JSON.parse(content);
// //     console.log("credentials:-----------")
// //     console.log(credentials)
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:----------------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {
//       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));
//       // console.log("clients:-----------------")
//       // console.log(clients)
//       return clients;
//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //       const { calendarIds, summary, description, startTime, endTime } = req.body;

// //       if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //           return res.status(400).json({ error: 'Missing required parameters' });
// //       }

// //       // Call the scheduleMeeting function to schedule the meeting
// //       const auth = await loadSavedCredentialsIfExist();
// //       if (!auth) {
// //           return res.status(400).json({ error: 'Please authorize first' });
// //       }

// //       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

// //       return res.json({ message: 'Meeting scheduled successfully' });
// //   } catch (error) {
// //       console.error(error);
// //       return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     console.log("content:----------")
// //     console.log(content)
// //     const credentials = JSON.parse(content);
// //     console.log("credentials:-----------")
// //     console.log(credentials)
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:----------------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {
//       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));
//       // console.log("clients:-----------------")
//       // console.log(clients)
//       return clients;
//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //       const { calendarIds, summary, description, startTime, endTime } = req.body;

// //       if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //           return res.status(400).json({ error: 'Missing required parameters' });
// //       }

// //       // Call the scheduleMeeting function to schedule the meeting
// //       const auth = await loadSavedCredentialsIfExist();
// //       if (!auth) {
// //           return res.status(400).json({ error: 'Please authorize first' });
// //       }

// //       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

// //       return res.json({ message: 'Meeting scheduled successfully' });
// //   } catch (error) {
// //       console.error(error);
// //       return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// MAIN CODE WHICH WORKS ---START---
// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     console.log("content:----------")
// //     console.log(content)
// //     const credentials = JSON.parse(content);
// //     console.log("credentials:-----------")
// //     console.log(credentials)
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:----------------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {
//       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));
//       // console.log("clients:-----------------")
//       // console.log(clients)
//       return clients;
//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// // if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
// //   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
// //   return false; // Indicate failure
// // }

// // // Check if the selected time is between 10 pm to 6 pm
// // const startHour = startTime.getHours();
// // const endHour = endTime.getHours();
// // const endMinutes = endTime.getMinutes();
// // const endSeconds = endTime.getSeconds();

// // if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
// //   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
// //   return false; // Indicate failure
// // }

//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //       const { calendarIds, summary, description, startTime, endTime } = req.body;

// //       if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //           return res.status(400).json({ error: 'Missing required parameters' });
// //       }

// //       // Call the scheduleMeeting function to schedule the meeting
// //       const auth = await loadSavedCredentialsIfExist();
// //       if (!auth) {
// //           return res.status(400).json({ error: 'Please authorize first' });
// //       }

// //       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

// //       return res.json({ message: 'Meeting scheduled successfully' });
// //   } catch (error) {
// //       console.error(error);
// //       return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
// MAIN CODE WHICH WORKS ---END---

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));

//     if (filteredCredentials.length > 0) {
//       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));
//       return clients;
//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { log } = require('console');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     console.log("content:----------")
// //     console.log(content)
// //     const credentials = JSON.parse(content);
// //     console.log("credentials:-----------")
// //     console.log(credentials)
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);
//     // console.log("savedCredentials:--------");
//     // console.log(savedCredentials);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:-----------")
//     // console.log(filteredCredentials)

//     const clients = [];

//     // Loop through the provided calendarIds
//     for (const calendarId of filteredCredentials) {
//       // for (const calendarId of filteredCredentials) {
//       // Find the credentials for the current calendarId
//       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);
//       // console.log("credentials:--------")
//       // console.log(credentials)

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
//         console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//         return clients;
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//       }
//     }

//     // return clients;
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content);
// //     console.log("savedCredentials:--------");
// //     console.log(savedCredentials);

// //     // Filter credentials based on provided calendarIds
// //     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
// //     console.log("filteredCredentials:-----------")
// //     console.log(filteredCredentials)

// //     if (filteredCredentials.length > 0) {
// //       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));

// //       console.log("clients:----------")
// //       console.log(clients)
// //       return clients;
// //     } else {
// //       console.log('No credentials found for the provided calendarIds.');
// //       return null;
// //     }
// //   } catch (err) {
// //     console.error('Error loading saved credentials:', err.message);
// //     throw err;
// //   }
// // }

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content);

// //     const clients = [];

// //     // Loop through the provided calendarIds
// //     for (const calendarId of calendarIds) {
// //       // Find the credentials for the current calendarId
// //       const credentials = savedCredentials.find(cred => cred.user_email === calendarId);

// //       if (credentials) {
// //         // Log the retrieved credentials for debugging
// //         console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);

// //         // Create a client using the found credentials
// //         const client = google.auth.fromJSON(credentials);
// //         clients.push(client);
// //       } else {
// //         console.log(`No credentials found for calendar ID: ${calendarId}`);
// //         clients.push(null); // Push null for calendar IDs with no credentials
// //       }
// //     }

// //     return clients;
// //   } catch (err) {
// //     console.error('Error loading saved credentials:', err.message);
// //     throw err;
// //   }
// // }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { log } = require('console');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     console.log("content:----------")
// //     console.log(content)
// //     const credentials = JSON.parse(content);
// //     console.log("credentials:-----------")
// //     console.log(credentials)
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content);
// //     // console.log("savedCredentials:--------");
// //     // console.log(savedCredentials);

// //     // Filter credentials based on provided calendarIds
// //     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
// //     // console.log("filteredCredentials:-----------")
// //     // console.log(filteredCredentials)

// //     const clients = [];

// //     // Loop through the provided calendarIds
// //     for (const calendarId of filteredCredentials) {
// //       // for (const calendarId of filteredCredentials) {
// //       // Find the credentials for the current calendarId
// //       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);
// //       // console.log("credentials:--------")
// //       // console.log(credentials)

// //       if (credentials) {
// //         // Log the retrieved credentials for debugging
// //         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
// //         console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);

// //         // Create a client using the found credentials
// //         const client = google.auth.fromJSON(credentials);
// //         clients.push(client);
// //         return clients;
// //       } else {
// //         console.log(`No credentials found for calendar ID: ${calendarId}`);
// //         clients.push(null); // Push null for calendar IDs with no credentials
// //       }
// //     }

// //     // return clients;
// //   } catch (err) {
// //     console.error('Error loading saved credentials:', err.message);
// //     throw err;
// //   }
// // }

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content);
// //     console.log("savedCredentials:--------");
// //     console.log(savedCredentials);

// //     // Filter credentials based on provided calendarIds
// //     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
// //     console.log("filteredCredentials:-----------")
// //     console.log(filteredCredentials)

// //     if (filteredCredentials.length > 0) {
// //       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));

// //       console.log("clients:----------")
// //       console.log(clients)
// //       return clients;
// //     } else {
// //       console.log('No credentials found for the provided calendarIds.');
// //       return null;
// //     }
// //   } catch (err) {
// //     console.error('Error loading saved credentials:', err.message);
// //     throw err;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);
//     // console.log("savedCredentials:--------");
//     // console.log(savedCredentials);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     console.log("filteredCredentials:-----------")
//     console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {

//       const clients = [];
//           for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       // const credentials = savedCredentials.find(cred => cred.user_email === calendarId);
//       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//         // return clients;
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//         // return clients;
//       }
//     }

//     return clients;

//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content);

// //     const clients = [];

// //     // Loop through the provided calendarIds
// //     for (const calendarId of calendarIds) {
// //       // Find the credentials for the current calendarId
// //       const credentials = savedCredentials.find(cred => cred.user_email === calendarId);

// //       if (credentials) {
// //         // Log the retrieved credentials for debugging
// //         console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);

// //         // Create a client using the found credentials
// //         const client = google.auth.fromJSON(credentials);
// //         clients.push(client);
// //         return clients;
// //       } else {
// //         console.log(`No credentials found for calendar ID: ${calendarId}`);
// //         clients.push(null); // Push null for calendar IDs with no credentials
// //         return clients;
// //       }
// //     }

// //     // return clients;
// //   } catch (err) {
// //     console.error('Error loading saved credentials:', err.message);
// //     throw err;
// //   }
// // }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { log } = require('console');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);
//     // console.log("savedCredentials:--------");
//     // console.log(savedCredentials);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:-----------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {

//       const clients = [];
//           for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       // const credentials = savedCredentials.find(cred => cred.user_email === calendarId);
//       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
//         console.log(`Credentials found for calendar ID ${calendarId}:`);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//         // return clients;
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//         // return clients;
//       }
//     }

//     return clients;

//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// // console.log('calendarIds------')
// // console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   // console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { log } = require('console');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);
//     // console.log("savedCredentials:--------");
//     // console.log(savedCredentials);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:-----------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {

//       const clients = [];
//           for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       // const credentials = savedCredentials.find(cred => cred.user_email === calendarId);
//       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
//         console.log(`Credentials found for calendar ID ${calendarId}:`);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//         // return clients;
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//         // return clients;
//       }
//     }

//     return clients;

//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// // console.log('calendarIds------')
// // console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   // console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { log } = require('console');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);
//     // console.log("savedCredentials:--------");
//     // console.log(savedCredentials);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:-----------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {

//       const clients = [];
//           for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       // const credentials = savedCredentials.find(cred => cred.user_email === calendarId);
//       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
//         console.log(`Credentials found for calendar ID ${calendarId}:`);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//         // return clients;
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//         // return clients;
//       }
//     }

//     return clients;

//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// // console.log('calendarIds------')
// // console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   // console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);
//     // console.log("savedCredentials:--------");
//     // console.log(savedCredentials);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:-----------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {

//       const clients = [];
//           for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       // const credentials = savedCredentials.find(cred => cred.user_email === calendarId);
//       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
//         console.log(`Credentials found for calendar ID ${calendarId}:`);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//         // return clients;
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//         // return clients;
//       }
//     }

//     return clients;

//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// // console.log('calendarIds------')
// // console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );
//   console.log(busyPeriods)

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   // console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);
//     // console.log("savedCredentials:--------");
//     // console.log(savedCredentials);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:-----------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {

//       const clients = [];
//           for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       // const credentials = savedCredentials.find(cred => cred.user_email === calendarId);
//       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
//         console.log(`Credentials found for calendar ID ${calendarId}:`);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//         // return clients;
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//         // return clients;
//       }
//     }

//     return clients;

//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// // console.log('calendarIds------')
// // console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });
// //   console.log("suitableSlots:---------")
// //   console.log(suitableSlots)

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );
//   console.log("busyPeriods:-------")
//   console.log(busyPeriods)

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   // console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//     try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//         return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Load saved credentials for provided calendarIds
//       const authClients = await loadSavedCredentialsIfExist(calendarIds);

//       if (!authClients || authClients.length !== calendarIds.length) {
//         return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//       }

//       // Schedule meetings for each user
//       for (let i = 0; i < authClients.length; i++) {
//         const auth = authClients[i];

//         const userEmail = calendarIds[i];

//         const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//         if (!success) {
//           return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//         }
//       }

//       return res.json({ message: 'Meetings scheduled successfully' });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //     const { calendarIds, summary, description, startTime, endTime } = req.body;

// //     if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //       return res.status(400).json({ error: 'Missing required parameters' });
// //     }

// //     // Load saved credentials for provided calendarIds
// //     const authClients = await loadSavedCredentialsIfExist(calendarIds);

// //     if (!authClients || authClients.length !== calendarIds.length) {
// //       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
// //     }

// //     // Schedule meetings for each user
// //     for (let i = 0; i < authClients.length; i++) {
// //       const auth = authClients[i];
// //       const userEmail = calendarIds[i];
// //       console.log("userEmail:----------")
// //       console.log(userEmail)

// //       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

// //       if (!success) {
// //         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
// //       }
// //     }

// //     return res.json({ message: 'Meetings scheduled successfully' });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });




























const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");


const app = express();
app.use(cors());
app.use(bodyParser.json());


const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];


const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");


async function loadSavedCredentialsIfExist(calendarIds) {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const savedCredentials = JSON.parse(content);
    // console.log("savedCredentials:--------");
    // console.log(savedCredentials);

    // Filter credentials based on provided calendarIds
    const filteredCredentials = savedCredentials.filter((cred) =>
      calendarIds.includes(cred.user_email)
    );
    // console.log("filteredCredentials:-----------")
    // console.log(filteredCredentials)

    if (filteredCredentials.length > 0) {
      const clients = [];
      for (const calendarId of calendarIds) {
        // Find the credentials for the current calendarId
        // const credentials = savedCredentials.find(cred => cred.user_email === calendarId);
        const credentials = filteredCredentials.find(
          (cred) => cred.user_email === calendarId
        );

        if (credentials) {
          // Log the retrieved credentials for debugging
          // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
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


const user_name = "ethanwick7336@gmail.com";
const app_pass = "mvaw dnpz tlbf xvqq";

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
  // console.log('calendarIds------')
  // console.log(calendarIds)

  // Send the authorization URL to the user via email
  await sendAuthorizationEmail(calendarIds, authUrl);

  // Perform any other actions as needed
  // (e.g., wait for user interaction, provide instructions)

  return null; // Indicate that authorization is pending
}


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


app.get("/", (req, res) => {
  res.send("Authentication Successfull.");
  // res.sendFile(__dirname + "/index.html")
});


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


app.get("/oauth2callback", async (req, res) => {
  // const { code } = req.query;
  const { code, state } = req.query;

  const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
  const a = JSON.stringify(credentials);
  const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const tokens = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    await saveCredentials(tokens, state);
    // await saveCredentials(tokens);

    // Redirect or respond with a success message

    res.redirect("/"); // Redirect to your HTML page
    console.log("authentication successfull");
  } catch (error) {
    console.error("Error retrieving access token", error);
    // Redirect or respond with an error message
    res.redirect("/error");
  }
});


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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
































// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { log } = require('console');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);
//     // console.log("savedCredentials:--------");
//     // console.log(savedCredentials);

//     // Filter credentials based on provided calendarIds
//     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
//     // console.log("filteredCredentials:-----------")
//     // console.log(filteredCredentials)

//     if (filteredCredentials.length > 0) {

//       const clients = [];
//           for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       // const credentials = savedCredentials.find(cred => cred.user_email === calendarId);
//       const credentials = filteredCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);
//         console.log(`Credentials found for calendar ID ${calendarId}:`);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//         // return clients;
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//         // return clients;
//       }
//     }

//     return clients;

//     } else {
//       console.log('No credentials found for the provided calendarIds.');
//       return null;
//     }
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// // console.log('calendarIds------')
// // console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );
//   console.log(busyPeriods)

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// async function findCommonFreeSlotsForAllUsers(authClients, startTime, endTime) {
//     try {
//       const busyPeriodsPromises = authClients.map(auth => getBusyPeriods(auth, startTime, endTime));
//       const busyPeriods = await Promise.all(busyPeriodsPromises);
//       const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busyPeriods);
//       return commonFreeSlots;
//     } catch (error) {
//       console.error('Error finding common free slots:', error);
//       throw error;
//     }
//   }

//   async function getBusyPeriods(auth, startTime, endTime) {
//     try {
//       // Ensure startTime and endTime are valid Date objects
//       startTime = new Date(startTime);
//       endTime = new Date(endTime);

//       const calendar = google.calendar({ version: 'v3', auth });
//       const freeBusyRequest = {
//         timeMin: startTime.toISOString(),
//         timeMax: endTime.toISOString(),
//         items: [{ id: 'primary' }], // Assuming 'primary' calendar for each user
//       };
//       const response = await calendar.freebusy.query({ requestBody: freeBusyRequest });
//       const busyPeriods = response.data.calendars.primary.busy;

//       console.log('Busy Periods:');
//       console.log(busyPeriods);

//       return busyPeriods;
//     } catch (error) {
//       console.error('Error fetching busy periods:', error);
//       throw error;
//     }
//   }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   // console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//     try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//         return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Load saved credentials for provided calendarIds
//       const authClients = await loadSavedCredentialsIfExist(calendarIds);

//       if (!authClients || authClients.length !== calendarIds.length) {
//         return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//       }

//       // Retrieve common free slots for all users
//       const commonFreeSlots = await findCommonFreeSlotsForAllUsers(authClients, startTime, endTime);

//       // Schedule meetings based on common free slots
//       if (commonFreeSlots.length > 0) {
//         for (const slot of commonFreeSlots) {
//           const success = await scheduleMeeting(authClients, calendarIds, summary, description, slot.start, slot.end);

//           if (!success) {
//             return res.status(400).json({ error: `Failed to schedule meeting for common slot ${slot.start} to ${slot.end}` });
//           }
//         }

//         return res.json({ message: 'Meetings scheduled successfully' });
//       } else {
//         return res.status(400).json({ error: 'No common free slots found for the provided users' });
//       }
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //     const { calendarIds, summary, description, startTime, endTime } = req.body;

// //     if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //       return res.status(400).json({ error: 'Missing required parameters' });
// //     }

// //     // Load saved credentials for provided calendarIds
// //     const authClients = await loadSavedCredentialsIfExist(calendarIds);
// //     // console.log("authClients:--------")
// //     // console.log(authClients)

// //     if (!authClients || authClients.length !== calendarIds.length) {
// //       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
// //     }

// //     // Schedule meetings for each user
// //     for (let i = 0; i < authClients.length; i++) {
// //       const auth = authClients[i];
// //       console.log("auth:-------")
// //       console.log(auth)
// //       const userEmail = calendarIds[i];
// //       console.log("userEmail:-------")
// //       console.log(userEmail)

// //       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

// //       if (!success) {
// //         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
// //       }
// //     }

// //     return res.json({ message: 'Meetings scheduled successfully' });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content);

// //     // Filter credentials based on provided calendarIds
// //     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));

// //     if (filteredCredentials.length > 0) {
// //       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));
// //       return clients;
// //     } else {
// //       console.log('No credentials found for the provided calendarIds.');
// //       return null;
// //     }
// //   } catch (err) {
// //     console.error('Error loading saved credentials:', err.message);
// //     throw err;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     const clients = [];

//     // Loop through the provided calendarIds
//     for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       const credentials = savedCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//       }
//     }

//     return clients;
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30 am to 6:30 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30 am to 6:30 pm.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//     const { calendarId } = req.body;

//     if (!calendarId) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Always call the authorize function to handle the case where credentials are not found
//     await authorize([calendarId]);

//     return res.json({ message: 'Authorization email sent. Please check your email.', credentialsExist: false });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// async function credentialsExistForCalendarId(calendarId) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     return savedCredentials.some(cred => cred.user_email === calendarId);
//   } catch (err) {
//     console.error('Error checking if credentials exist:', err.message);
//     throw err;
//   }
// }

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     console.log("content:----------")
// //     console.log(content)
// //     const credentials = JSON.parse(content);
// //     console.log("credentials:-----------")
// //     console.log(credentials)
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const savedCredentials = JSON.parse(content);

// //     // Filter credentials based on provided calendarIds
// //     const filteredCredentials = savedCredentials.filter((cred) => calendarIds.includes(cred.user_email));
// //     // console.log("filteredCredentials:----------------")
// //     // console.log(filteredCredentials)

// //     if (filteredCredentials.length > 0) {
// //       const clients = filteredCredentials.map((cred) => google.auth.fromJSON(cred));
// //       // console.log("clients:-----------------")
// //       // console.log(clients)
// //       return clients;
// //     } else {
// //       console.log('No credentials found for the provided calendarIds.');
// //       return null;
// //     }
// //   } catch (err) {
// //     console.error('Error loading saved credentials:', err.message);
// //     throw err;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     const clients = [];

//     // Loop through the provided calendarIds
//     for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       const credentials = savedCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//       }
//     }

//     return clients;
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   // let client = await loadSavedCredentialsIfExist();
//   // if (client) {
//   //   return client;
//   // }

//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between monday to fridat
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30AM to 6:30AM
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30AM to 6:30PM.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// // app.post('/schedule-meeting', async (req, res) => {
// //   try {
// //       const { calendarIds, summary, description, startTime, endTime } = req.body;

// //       if (!calendarIds || !summary || !description || !startTime || !endTime) {
// //           return res.status(400).json({ error: 'Missing required parameters' });
// //       }

// //       // Call the scheduleMeeting function to schedule the meeting
// //       const auth = await loadSavedCredentialsIfExist();
// //       if (!auth) {
// //           return res.status(400).json({ error: 'Please authorize first' });
// //       }

// //       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

// //       return res.json({ message: 'Meeting scheduled successfully' });
// //   } catch (error) {
// //       console.error(error);
// //       return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content) || [];

//     if (savedCredentials.length === 0) {
//       console.log('No saved credentials found.');
//       return null;
//     }

//     const clients = savedCredentials.map(credentials => {
//       try {
//         const authClient = google.auth.fromJSON(credentials);
//         // Log the loaded credentials for debugging
//         console.log('Loaded credentials:', credentials);
//         return authClient;
//       } catch (error) {
//         console.error('Error creating auth client from saved credentials:', error.message);
//         return null;
//       }
//     });

//     // Filter out any null values from the array
//     const validClients = clients.filter(client => client !== null);

//     return validClients.length > 0 ? validClients : null;
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     return null;
//   }
// }

// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// // async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
// //   // Check if the selected day is Thursday
// // if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
// //   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
// //   return false; // Indicate failure
// // }

// // // Check if the selected time is between 10 pm to 6 pm
// // const startHour = startTime.getHours();
// // const endHour = endTime.getHours();
// // const endMinutes = endTime.getMinutes();
// // const endSeconds = endTime.getSeconds();

// // if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
// //   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
// //   return false; // Indicate failure
// // }

// //   const calendar = google.calendar({ version: 'v3', auth });

// //   const freeBusyRequests = calendarIds.map((calendarId) => ({
// //     id: calendarId,
// //   }));

// //   const freeBusyResponse = await calendar.freebusy.query({
// //     auth: auth,
// //     requestBody: {
// //       timeMin: startTime.toISOString(),
// //       timeMax: endTime.toISOString(),
// //       items: freeBusyRequests,
// //     },
// //   });

// //   const busySlots = freeBusyResponse.data.calendars;

// //   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

// //   // Minimum duration required for the meeting
// //   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

// //   // Filter common free slots that are long enough for the meeting
// //   const suitableSlots = commonFreeSlots.filter(slot => {
// //     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
// //     return slotDuration >= minimumMeetingDuration;
// //   });

// //   if (suitableSlots.length > 0) {
// //     const firstSlot = suitableSlots[0];
// //     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
// //     const event = {
// //       summary,
// //       description,
// //       start: {
// //         dateTime: firstSlot.start,
// //         timeZone: 'Asia/Kolkata',
// //       },
// //       end: {
// //         dateTime: meetingEndTime.toISOString(),
// //         timeZone: 'Asia/Kolkata',
// //       },
// //     };

// //     for (const calendarId of calendarIds) {
// //       await calendar.events.insert({
// //         auth: auth,
// //         calendarId: calendarId,
// //         resource: event,
// //       });
// //     }

// //     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
// //     return true; // Indicate success
// //   } else {
// //     console.log('No suitable free slots found for the meeting.');
// //     return false; // Indicate failure
// //   }
// // }

// async function scheduleMeeting(authClients, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());
// app.use('/static', express.static('public'))

// // Scopes to define the access of calendar API ---START---
// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];
// // Scopes to define the access of calendar API ---END---

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // Function to check the token.json file if the credentials are available for authenticated users ---START---
// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const savedCredentials = JSON.parse(content);

//     const clients = [];

//     // Loop through the provided calendarIds
//     for (const calendarId of calendarIds) {
//       // Find the credentials for the current calendarId
//       const credentials = savedCredentials.find(cred => cred.user_email === calendarId);

//       if (credentials) {
//         // Log the retrieved credentials for debugging
//         // console.log(`Credentials found for calendar ID ${calendarId}:`, credentials);

//         // Create a client using the found credentials
//         const client = google.auth.fromJSON(credentials);
//         clients.push(client);
//       } else {
//         console.log(`No credentials found for calendar ID: ${calendarId}`);
//         clients.push(null); // Push null for calendar IDs with no credentials
//       }
//     }

//     return clients;
//   } catch (err) {
//     console.error('Error loading saved credentials:', err.message);
//     throw err;
//   }
// }
// // Function to check the token.json file if the credentials are available for authenticated users ---END---

// // Function to save the credentials for the authenticated users ---START---
// async function saveCredentials(tokens, userEmail) {
//   try {
//     // Check if TOKEN_PATH file exists, if not, create an empty array
//     let savedCredentials = [];
//     try {
//       const content = await fs.readFile(TOKEN_PATH);
//       savedCredentials = JSON.parse(content);
//     } catch (error) {
//       // If file does not exist or cannot be parsed, continue with an empty array
//       console.error('Error reading TOKEN_PATH:', error.message);
//     }

//     const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//     const key = keys.installed || keys.web;

//     const newCredentials = {
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//       user_email: userEmail,
//     };

//     // Check if credentials for the user already exist, update if so, otherwise add new credentials
//     const index = savedCredentials.findIndex(cred => cred.user_email === userEmail);

//     if (index !== -1) {
//       savedCredentials[index] = newCredentials;
//     } else {
//       savedCredentials.push(newCredentials);
//     }

//     const payload = JSON.stringify(savedCredentials);

//     await fs.writeFile(TOKEN_PATH, payload);

//     console.log(`Credentials saved for ${userEmail}`);
//   } catch (err) {
//     console.error('Error saving credentials:', err.message);
//     throw err;
//   }
// }
// // Function to save the credentials for the authenticated users ---END---

// // Gmail address and app password for for the email which sends
// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// // Function to send the authentication emails to the users --- START---
// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }
// // Function to send the authentication emails to the users --- END---

// // Function to authorized the users ---START---
// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//     console.log("User Already Authorized")
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     state: calendarIds, // Pass calendarIds as state

//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }
// // Function to authorized the users ---END---

// // Function to filter the events and schedule the meeting between authenticated accounts if common free slot(s) is available ---START---
// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is between Monday to Friday
//   const startDay = startTime.getDay();
//   const endDay = endTime.getDay();
//   const isWeekday = startDay >= 1 && startDay <= 5 && endDay >= 1 && endDay <= 5;

//   if (!isWeekday) {
//     console.log('Meeting can only be scheduled from Monday to Friday.');
//     return false; // Indicate failure
//   }

//   // Check if the selected time is between 9:30AM to 6:30AM
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const startMinutes = startTime.getMinutes();
//   const endMinutes = endTime.getMinutes();

//   if (startHour < 9 || (startHour === 9 && startMinutes < 30) || endHour > 18 || (endHour === 18 && endMinutes > 30)) {
//     console.log('Meeting can only be scheduled between 9:30AM to 6:30PM.');
//     return false; // Indicate failure
//   }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// // Function to filter the events and schedule the meeting between authenticated accounts if common free slot(s) is available ---START---

// // Function to calculate the common free slots in the authenticated user accounts ---START---
// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }
// // Function to calculate the common free slots in the authenticated user accounts ---END---

// // Function to find the common free slots in the authenticated user accounts ---START---
// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }
// // Function to find the common free slots in the authenticated user accounts ---START---

// // Root Route hits when the user is successfully authenticated ---START---
// app.get('/', (req, res) => {
//   // res.send("Authentication Successfull.")
//   res.sendFile(__dirname + "/index.html")
// })
// // Root Route hits when the user is successfully authenticated ---END---

// // Route to send the authentication email to the users ---START---
// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });
// // Route to send the authentication email to the users ---END---

// // Route to authenticate the user when they provide the access of their calendar events ---START---
// app.get('/oauth2callback', async (req, res) => {
//   // const { code } = req.query;
//   const { code, state } = req.query;
//   console.log(state)

//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens, state);
//     // await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });
// // Route to authenticate the user when they provide the access of their calendar events ---END---

// // Route to schedule the meeting between authenticated users on their common free slot(s) if available ---START---
// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Load saved credentials for provided calendarIds
//     const authClients = await loadSavedCredentialsIfExist(calendarIds);

//     if (!authClients || authClients.length !== calendarIds.length) {
//       return res.status(400).json({ error: 'Credentials not found for all provided calendarIds' });
//     }

//     // Schedule meetings for each user
//     for (let i = 0; i < authClients.length; i++) {
//       const auth = authClients[i];
//       const userEmail = calendarIds[i];

//       const success = await scheduleMeeting(auth, [userEmail], summary, description, new Date(startTime), new Date(endTime));

//       if (!success) {
//         return res.status(400).json({ error: `Failed to schedule meeting for ${userEmail}` });
//       }
//     }

//     return res.json({ message: 'Meetings scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });
// // Route to schedule the meeting between authenticated users on their common free slot(s) if available ---END---

// // Localhost port on which the server is running ---START---
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
// // Localhost port on which the server is running ---END---

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//       const content = await fs.readFile(path.join(process.cwd(), `${calendarIds}_token.json`));
//       const credentials = JSON.parse(content);
//       return google.auth.fromJSON(credentials);
//   } catch (err) {
//       return null;
//   }
// }

// async function saveCredentials(tokens, calendarIds) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   console.log("saveCredentials Token:----------");
//   console.log(tokens.tokens.refresh_token);
//   const payload = JSON.stringify({
//       type: 'authorized_user',
//       client_id: key.client_id,
//       client_secret: key.client_secret,
//       refresh_token: tokens.tokens.refresh_token,
//   });

//   console.log(payload);

//   await fs.writeFile(path.join(process.cwd(), `${calendarIds}_token.json`), payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//           user: user_name,
//           pass: app_pass,
//       },
//   });

//   const htmlContent = `
//   <html>
//       <head>
//           <title>Authorization Link</title>
//       </head>
//       <body>
//           <p>Click the following link to authorize the Google Calendar API:</p>
//           <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//   </html>
//   `;

//   const mailOptions = {
//       from: user_name,
//       to: calendarIds,
//       subject: 'Authorize Google Calendar API',
//       html: htmlContent,
//   };

//   try {
//       const info = await transporter.sendMail(mailOptions);
//       console.log("Authentication Email Sent Successfully")
//       console.log('Email sent:', info.response);
//   } catch (error) {
//       console.error('Error sending email:', error.message);
//       throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds, calendarIds) {
//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//       return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   const authUrl = oAuth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: SCOPES,
//       state: calendarIds, // Pass calendarIds as state
//   });

//   await sendAuthorizationEmail([calendarIds], authUrl); // Pass calendarIds as an array

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds || !Array.isArray(calendarIds) || calendarIds.length === 0) {
//           return res.status(400).json({ error: 'Invalid or missing calendarIds' });
//       }

//       for (const calendarIds of calendarIds) {
//           await authorize(calendarIds, calendarIds);
//       }

//       return res.json({ message: 'Authorization emails sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code, state } = req.query; // Retrieve state instead of calendarIds
//   console.log("Code: " + code);

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//       const tokens = await oAuth2Client.getToken(code);
//       oAuth2Client.setCredentials(tokens);

//       await saveCredentials(tokens, state); // Save tokens with the state (calendarIds)

//       res.redirect('/'); // Redirect to your HTML page
//       console.log("Authentication successful");
//   } catch (error) {
//       console.error('Error retrieving access token', error);
//       res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKENS_FOLDER = path.join(process.cwd(), 'tokens');
// const TOKEN_PATH = (calendarIds) => path.join(TOKENS_FOLDER, `${calendarIds}_token.json`);
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     console.log("calendarIds:------")
//     console.log(calendarIds)
//     const tokenPath = TOKEN_PATH(calendarIds); // Add this line
//     console.log("Token Path:", tokenPath); // Add this line
//     const content = await fs.readFile(tokenPath);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// // Update saveCredentials function
// async function saveCredentials(tokens, calendarIds) {
//   console.log("savecalendarIds:--------")
//   console.log(calendarIds)
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;

//   // Extract the username part of the email before the '@' symbol
//   const username = calendarIds.split('@')[0];

//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token,
//   });

//   // Save the file with the extracted username
//   await fs.writeFile(path.join(TOKENS_FOLDER, `${username}_token.json`), payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//           user: user_name,
//           pass: app_pass,
//       },
//   });

//   const htmlContent = `
//   <html>
//       <head>
//           <title>Authorization Link</title>
//       </head>
//       <body>
//           <p>Click the following link to authorize the Google Calendar API:</p>
//           <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//   </html>
//   `;

//   const mailOptions = {
//       from: user_name,
//       to: calendarIds,
//       subject: 'Authorize Google Calendar API',
//       html: htmlContent,
//   };

//   try {
//       const info = await transporter.sendMail(mailOptions);
//       console.log("Authentication Email Sent Successfully")
//       console.log('Email sent:', info.response);
//   } catch (error) {
//       console.error('Error sending email:', error.message);
//       throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds, calendarIds) {
//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//       return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   const authUrl = oAuth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: SCOPES,
//       state: calendarIds, // Pass calendarIds as state
//   });

//   await sendAuthorizationEmail([calendarIds], authUrl); // Pass calendarIds as an array

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds || !Array.isArray(calendarIds) || calendarIds.length === 0) {
//           return res.status(400).json({ error: 'Invalid or missing calendarIds' });
//       }

//       for (const calendarIds of calendarIds) {
//           await authorize(calendarIds, calendarIds);
//       }

//       return res.json({ message: 'Authorization emails sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code, state } = req.query; // Retrieve state instead of calendarIds
//   console.log("Code: " + code);

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//       const tokens = await oAuth2Client.getToken(code);
//       oAuth2Client.setCredentials(tokens);

//       await saveCredentials(tokens, state); // Save tokens with the state (calendarIds)

//       res.redirect('/'); // Redirect to your HTML page
//       console.log("Authentication successful");
//   } catch (error) {
//       console.error('Error retrieving access token', error);
//       res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Assuming the user's email is provided in the request body as `calendarIds`

//     // Call the scheduleMeeting function to schedule the meeting
//     const auth = await loadSavedCredentialsIfExist(calendarIds); // Pass calendarIds to the function
//     if (!auth) {
//       return res.status(400).json({ error: 'Please authorize first' });
//     }

//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKENS_FOLDER = path.join(process.cwd(), 'tokens');
// const TOKEN_PATH = (calendarIds) => path.join(TOKENS_FOLDER, `${calendarIds}_token.json`);
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     console.log("calendarIds:------")
// //     console.log(calendarIds)
// //     const tokenPath = TOKEN_PATH(calendarIds); // Add this line
// //     console.log("Token Path:", tokenPath); // Add this line
// //     const content = await fs.readFile(tokenPath);
// //     const credentials = JSON.parse(content);
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     console.log("calendarIds:------")
// //     console.log(calendarIds)
// //     const verifiedEmails = calendarIds.map((claendarID) => {claendarID})
// //     console.log(verifiedEmails)
// //     const tokenPath = TOKEN_PATH(calendarIds); // Add this line
// //     console.log("Token Path:", tokenPath); // Add this line
// //     const content = await fs.readFile(tokenPath);
// //     const credentials = JSON.parse(content);
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// // async function loadSavedCredentialsIfExist(calendarIds) {
// //   try {
// //     console.log("calendarIds:------");
// //     console.log(calendarIds);

// //     // Map calendarIds to an array of token paths
// //     const tokenPaths = calendarIds.map((calendarID) => TOKEN_PATH(calendarID));
// //     console.log("Token Paths:", tokenPaths);

// //     // Iterate over each token path and try to read the file
// //     for (const tokenPath of tokenPaths) {
// //       try {
// //         const content = await fs.readFile(tokenPath);
// //         const credentials = JSON.parse(content);
// //         return google.auth.fromJSON(credentials);
// //       } catch (err) {
// //         // If file not found or any other error, continue to the next iteration
// //         continue;
// //       }
// //     }

// //     // If none of the token paths are successful, return null
// //     return null;
// //   } catch (err) {
// //     console.log(err)
// //     return null;
// //   }
// // }

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     const credentialsPromises = calendarIds.map(async (calendarId) => {
//       const tokenPath = path.join('tokens', `${calendarId}_token.json`);
//       try {
//         const content = await fs.readFile(tokenPath);
//         const credentials = JSON.parse(content);
//         return { calendarId, credentials };
//       } catch (err) {
//         // If file not found or any other error, return null for this calendarId
//         console.error(`Error loading credentials for ${calendarId}:`, err);
//         return null;
//       }
//     });

//     const credentialsArray = await Promise.all(credentialsPromises);

//     // Filter out null values (where credentials couldn't be loaded)
//     const validCredentials = credentialsArray.filter((item) => item !== null);
//     // console.log(validCredentials);

//     return google.auth.fromJSON(validCredentials);
//   } catch (err) {
//     console.error('Error loading credentials:', err);
//     return null;
//   }
// }

// // Update saveCredentials function
// async function saveCredentials(tokens, calendarIds) {
//   console.log("saveCalendarIds:--------")
//   console.log(calendarIds)
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;

//   // Extract the username part of the email before the '@' symbol
//   // const username = calendarIds.split('@')[0];

//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token,
//   });

//   // Save the file with the extracted username
//   await fs.writeFile(path.join(TOKENS_FOLDER, `${calendarIds}_token.json`), payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//           user: user_name,
//           pass: app_pass,
//       },
//   });

//   const htmlContent = `
//   <html>
//       <head>
//           <title>Authorization Link</title>
//       </head>
//       <body>
//           <p>Click the following link to authorize the Google Calendar API:</p>
//           <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//   </html>
//   `;

//   const mailOptions = {
//       from: user_name,
//       to: calendarIds,
//       subject: 'Authorize Google Calendar API',
//       html: htmlContent,
//   };

//   try {
//       const info = await transporter.sendMail(mailOptions);
//       console.log("Authentication Email Sent Successfully")
//       console.log('Email sent:', info.response);
//   } catch (error) {
//       console.error('Error sending email:', error.message);
//       throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds, calendarIds) {
//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//       return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   const authUrl = oAuth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: SCOPES,
//       state: calendarIds, // Pass calendarIds as state
//   });

//   await sendAuthorizationEmail([calendarIds], authUrl); // Pass calendarIds as an array

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds || !Array.isArray(calendarIds) || calendarIds.length === 0) {
//           return res.status(400).json({ error: 'Invalid or missing calendarIds' });
//       }

//       for (const calendarIds of calendarIds) {
//           await authorize(calendarIds, calendarIds);
//       }

//       return res.json({ message: 'Authorization emails sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code, state } = req.query; // Retrieve state instead of calendarIds
//   console.log("Code: " + code);

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//       const tokens = await oAuth2Client.getToken(code);
//       oAuth2Client.setCredentials(tokens);

//       await saveCredentials(tokens, state); // Save tokens with the state (calendarIds)

//       res.redirect('/'); // Redirect to your HTML page
//       console.log("Authentication successful");
//   } catch (error) {
//       console.error('Error retrieving access token', error);
//       res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Assuming the user's email is provided in the request body as `calendarIds`

//     // Call the scheduleMeeting function to schedule the meeting
//     const auth = await loadSavedCredentialsIfExist(calendarIds); // Pass calendarIds to the function
//     if (!auth) {
//       return res.status(400).json({ error: 'Please authorize first' });
//     }

//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { calendar } = require('googleapis/build/src/apis/calendar');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKENS_FOLDER = path.join(process.cwd(), 'tokens');
// const TOKEN_PATH = (calendarIds) => path.join(TOKENS_FOLDER, `${calendarIds}_token.json`);
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(calendarIds) {
//   try {
//     console.log("loadSavedCredentialsIfExist--------")
//     // const savedFileName = calendarIds.split('@')[0];
//     console.log("calendarIds:------")
//     console.log(calendarIds)
//     const tokenPath = TOKEN_PATH(calendarIds); // Add this line
//     console.log("Token Path:", tokenPath); // Add this line
//     const content = await fs.readFile(tokenPath);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     console.log(err)
//     // return null;
//   }
// }

// // Update saveCredentials function
// async function saveCredentials(tokens, calendarIds) {
//   console.log("savecalendarIds:--------")
//   console.log(calendarIds)
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;

//   // Extract the username part of the email before the '@' symbol
//   // const username = calendarIds.split('@')[0];

//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token,
//   });

//   // Save the file with the extracted username
//   await fs.writeFile(path.join(TOKENS_FOLDER, `${calendarIds}_token.json`), payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//           user: user_name,
//           pass: app_pass,
//       },
//   });

//   const htmlContent = `
//   <html>
//       <head>
//           <title>Authorization Link</title>
//       </head>
//       <body>
//           <p>Click the following link to authorize the Google Calendar API:</p>
//           <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//   </html>
//   `;

//   const mailOptions = {
//       from: user_name,
//       to: calendarIds,
//       subject: 'Authorize Google Calendar API',
//       html: htmlContent,
//   };

//   try {
//       const info = await transporter.sendMail(mailOptions);
//       console.log("Authentication Email Sent Successfully")
//       console.log('Email sent:', info.response);
//   } catch (error) {
//       console.error('Error sending email:', error.message);
//       throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist(calendarIds);
//   if (client) {
//       return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   const authUrl = oAuth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: SCOPES,
//       state: calendarIds, // Pass calendarIds as state
//   });

//   await sendAuthorizationEmail([calendarIds], authUrl); // Pass calendarIds as an array

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds || !Array.isArray(calendarIds) || calendarIds.length === 0) {
//           return res.status(400).json({ error: 'Invalid or missing calendarIds' });
//       }

//       for (const calendarIds of calendarIds) {
//           await authorize(calendarIds, calendarIds);
//       }

//       return res.json({ message: 'Authorization emails sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code, state } = req.query; // Retrieve state instead of calendarIds
//   console.log("Code: " + code);

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   try {
//       const tokens = await oAuth2Client.getToken(code);
//       oAuth2Client.setCredentials(tokens);

//       await saveCredentials(tokens, state); // Save tokens with the state (calendarIds)

//       res.redirect('/'); // Redirect to your HTML page
//       console.log("Authentication successful");
//   } catch (error) {
//       console.error('Error retrieving access token', error);
//       res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     const { calendarIds, summary, description, startTime, endTime } = req.body;

//     if (!calendarIds || !summary || !description || !startTime || !endTime) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Assuming the user's email is provided in the request body as `calendarIds`
//     // const { calendarIds } = req.body;

//     // Call the scheduleMeeting function to schedule the meeting
//     const auth = await loadSavedCredentialsIfExist(calendarIds); // Pass calendarIds to the function
//     if (!auth) {
//       return res.status(400).json({ error: 'Please authorize first' });
//     }

//     await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//     return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials = JSON.parse(content);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(tokens) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;
//   console.log("saveCredentials Token:----------")
//   console.log(tokens.tokens.refresh_token)
//   const payload = JSON.stringify({
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token,
//   });

//   console.log(payload);

//   await fs.writeFile(TOKEN_PATH, payload);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;
//   console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens  = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     await saveCredentials(tokens);

//     // Redirect or respond with a success message

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("authentication successfull")
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const session = require('express-session');
// const FileStore = require('session-file-store')(session);
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// app.use(session({
//   store: new FileStore({
//     path: path.join(process.cwd(), 'sessions'), // Choose a suitable path for your session files
//   }),
//   secret: 'your-secret-key', // Change this to a secure secret
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }, // Adjust this based on your deployment environment
// }));

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// // async function loadSavedCredentialsIfExist() {
// //   try {
// //     const content = await fs.readFile(TOKEN_PATH);
// //     const credentials = JSON.parse(content);
// //     return google.auth.fromJSON(credentials);
// //   } catch (err) {
// //     return null;
// //   }
// // }

// async function loadSavedCredentialsIfExist(req) {
//   try {
//     // Use the session to store and retrieve the authenticated user's credentials
//     const credentials = req.session.credentials;
//     console.log("loadSavedCredentialsIfExist HIT---------------")
//     console.log(credentials)
//     if (credentials) {
//       return google.auth.fromJSON(credentials);
//     }
//     return null;
//   } catch (err) {
//     return null;
//   }
// }

// // async function saveCredentials(tokens) {
// //   const content = await fs.readFile(CREDENTIALS_PATH);
// //   const keys = JSON.parse(content);
// //   const key = keys.installed || keys.web;
// //   console.log("saveCredentials Token:----------")
// //   console.log(tokens.tokens.refresh_token)
// //   const payload = JSON.stringify({
// //     type: 'authorized_user',
// //     client_id: key.client_id,
// //     client_secret: key.client_secret,
// //     refresh_token: tokens.tokens.refresh_token,
// //   });

// //   console.log(payload);

// //   await fs.writeFile(TOKEN_PATH, payload);
// // }

// async function saveCredentials(req, tokens) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;

//   // Save the tokens to the session
//   req.session.credentials = {
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token,
//   };

//   // console.log("Token saved to session:", req.session.credentials);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;
//       // console.log(calendarIds)

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds, req);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // app.post('/send-auth-email', async (req, res) => {
// //   try {
// //     const { calendarIds } = req.body;
// //     console.log(calendarids)

// //     if (!calendarIds) {
// //       return res.status(400).json({ error: 'Missing required parameters' });
// //     }

// //     // Call the authorize function to send the authentication email
// //     await authorize(req, calendarIds);

// //     return res.json({ message: 'Authorization email sent. Please check your email.' });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({ error: 'Internal server error' });
// //   }
// // });

// // app.get('/oauth2callback', async (req, res) => {
// //   const { code } = req.query;
// //   // console.log("Code: " + code)

// //   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
// //   const a = JSON.stringify(credentials)
// //   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
// //   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
// //   // console.log("oAuth2Client: " + oAuth2Client)

// //   try {
// //     const tokens  = await oAuth2Client.getToken(code);
// //     oAuth2Client.setCredentials(tokens);

// //     await saveCredentials(tokens);

// //     // Redirect or respond with a success message

// //     res.redirect('/'); // Redirect to your HTML page
// //     console.log("authentication successfull")
// //   } catch (error) {
// //     console.error('Error retrieving access token', error);
// //     // Redirect or respond with an error message
// //     res.redirect('/error');
// //   }
// // });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;
//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the tokens to the session
//     await saveCredentials(req, tokens);

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("Authentication successful");
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const session = require('express-session');
// const FileStore = require('session-file-store')(session);
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// app.use(session({
//   store: new FileStore({
//     path: path.join(process.cwd(), 'sessions'), // Choose a suitable path for your session files
//   }),
//   secret: 'your-secret-key', // Change this to a secure secret
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }, // Adjust this based on your deployment environment
// }));

// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar.readonly',
//   'https://www.googleapis.com/auth/calendar.events',
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist(req) {
//   try {
//     // Use the session to store and retrieve the authenticated user's credentials
//     const credentials = req.session.credentials;
//     console.log("loadSavedCredentialsIfExist HIT---------------")
//     console.log(credentials)
//     if (credentials) {
//       return google.auth.fromJSON(credentials);
//     }
//     return null;
//   } catch (err) {
//     return null;
//   }
// }

// async function saveCredentials(req, tokens) {
//   const content = await fs.readFile(CREDENTIALS_PATH);
//   const keys = JSON.parse(content);
//   const key = keys.installed || keys.web;

//   // Save the tokens to the session
//   req.session.credentials = {
//     type: 'authorized_user',
//     client_id: key.client_id,
//     client_secret: key.client_secret,
//     refresh_token: tokens.tokens.refresh_token,
//   };

//   // console.log("Token saved to session:", req.session.credentials);
// }

// const user_name = 'ethanwick7336@gmail.com';
// const app_pass = 'mvaw dnpz tlbf xvqq';

// async function sendAuthorizationEmail(calendarIds, authUrl) {
//   console.log('sendAuthorizationEmail hit--------')
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user_name,
//       pass: app_pass
//     },
//   });

//     const htmlContent = `
//     <html>
//       <head>
//         <title>Authorization Link</title>
//       </head>
//       <body>
//         <p>Click the following link to authorize the Google Calendar API:</p>
//         <a href="${authUrl}" target="_blank">click here</a>
//       </body>
//     </html>
//   `

//   const mailOptions = {
//     from: user_name,
//     to: calendarIds,
//     subject: 'Authorize Google Calendar API',
//     html: htmlContent
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Authentication Email Send Successfully")
//     console.log('Email sent:', info.response);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error; // Rethrow the error to be caught in the calling function
//   }
// }

// async function authorize(calendarIds) {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

//   const { client_secret, client_id, redirect_uris } = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

//   // Generate an authentication URL
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
// console.log('calendarIds------')
// console.log(calendarIds)

//   // Send the authorization URL to the user via email
//   await sendAuthorizationEmail(calendarIds, authUrl);

//   // Perform any other actions as needed
//   // (e.g., wait for user interaction, provide instructions)

//   return null; // Indicate that authorization is pending
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
// if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
//   console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
//   return false; // Indicate failure
// }

// // Check if the selected time is between 10 pm to 6 pm
// const startHour = startTime.getHours();
// const endHour = endTime.getHours();
// const endMinutes = endTime.getMinutes();
// const endSeconds = endTime.getSeconds();

// if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
//   console.log('Meeting can only be scheduled between 10 pm to 6 pm.');
//   return false; // Indicate failure
// }

//   const calendar = google.calendar({ version: 'v3', auth });

//   const freeBusyRequests = calendarIds.map((calendarId) => ({
//     id: calendarId,
//   }));

//   const freeBusyResponse = await calendar.freebusy.query({
//     auth: auth,
//     requestBody: {
//       timeMin: startTime.toISOString(),
//       timeMax: endTime.toISOString(),
//       items: freeBusyRequests,
//     },
//   });

//   const busySlots = freeBusyResponse.data.calendars;

//   const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

//   // Minimum duration required for the meeting
//   const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

//   // Filter common free slots that are long enough for the meeting
//   const suitableSlots = commonFreeSlots.filter(slot => {
//     const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
//     return slotDuration >= minimumMeetingDuration;
//   });

//   if (suitableSlots.length > 0) {
//     const firstSlot = suitableSlots[0];
//     const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
//     const event = {
//       summary,
//       description,
//       start: {
//         dateTime: firstSlot.start,
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: meetingEndTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//     };

//     for (const calendarId of calendarIds) {
//       await calendar.events.insert({
//         auth: auth,
//         calendarId: calendarId,
//         resource: event,
//       });
//     }

//     console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
//     return true; // Indicate success
//   } else {
//     console.log('No suitable free slots found for the meeting.');
//     return false; // Indicate failure
//   }
// }

// function calculateCommonFreeSlots(startTime, endTime, busySlots) {
//   const busyPeriods = Object.values(busySlots).map((userBusy) =>
//     userBusy.busy.map((busySlot) => ({
//       start: new Date(busySlot.start).toISOString(),
//       end: new Date(busySlot.end).toISOString(),
//     }))
//   );

//   const commonFreeSlots = findCommonFreeSlots(startTime, endTime, busyPeriods);

//   return commonFreeSlots;
// }

// function findCommonFreeSlots(startTime, endTime, busyPeriods) {
//   const mergedBusyPeriods = [].concat(...busyPeriods);
//   mergedBusyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));

//   const commonFreeSlots = [];
//   let currentStartTime = new Date(startTime);

//   for (const busyPeriod of mergedBusyPeriods) {
//     const busyStartTime = new Date(busyPeriod.start);
//     const busyEndTime = new Date(busyPeriod.end);

//     if (currentStartTime < busyStartTime) {
//       if (busyStartTime <= endTime) {
//         commonFreeSlots.push({
//           start: currentStartTime.toISOString(),
//           end: busyStartTime.toISOString(),
//         });
//         currentStartTime = new Date(busyEndTime);
//       }
//     } else {
//       currentStartTime = new Date(Math.max(currentStartTime, busyEndTime));
//     }
//   }

//   if (currentStartTime < endTime) {
//     commonFreeSlots.push({
//       start: currentStartTime.toISOString(),
//       end: endTime.toISOString(),
//     });
//   }

//   return commonFreeSlots;
// }

// app.get('/', (req, res) => {
//   res.send("Authentication Successfull.")
// })

// app.post('/send-auth-email', async (req, res) => {
//   try {
//       const { calendarIds } = req.body;
//       // console.log(calendarIds)

//       if (!calendarIds) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the authorize function to send the authentication email
//       await authorize(calendarIds, req);

//       return res.json({ message: 'Authorization email sent. Please check your email.' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;
//   // console.log("Code: " + code)

//   const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
//   const a = JSON.stringify(credentials)
//   const { client_secret, client_id, redirect_uris } = credentials.web; // Update to use 'web' instead of 'installed'
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
//   // console.log("oAuth2Client: " + oAuth2Client)

//   try {
//     const tokens = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the tokens to the session
//     await saveCredentials(req, tokens);

//     res.redirect('/'); // Redirect to your HTML page
//     console.log("Authentication successful");
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     // Redirect or respond with an error message
//     res.redirect('/error');
//   }
// });

// app.post('/schedule-meeting', async (req, res) => {
//   try {
//       const { calendarIds, summary, description, startTime, endTime } = req.body;

//       if (!calendarIds || !summary || !description || !startTime || !endTime) {
//           return res.status(400).json({ error: 'Missing required parameters' });
//       }

//       // Call the scheduleMeeting function to schedule the meeting
//       const auth = await loadSavedCredentialsIfExist();
//       if (!auth) {
//           return res.status(400).json({ error: 'Please authorize first' });
//       }

//       await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

//       return res.json({ message: 'Meeting scheduled successfully' });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
