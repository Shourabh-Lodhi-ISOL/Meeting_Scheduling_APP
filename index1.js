// const express = require('express');
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const fs = require('fs').promises;
// const path = require('path');
// const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// const SCOPES = [
//     'https://www.googleapis.com/auth/calendar.readonly',
//     'https://www.googleapis.com/auth/calendar.events'
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

// async function authorize() {
//   let client = await loadSavedCredentialsIfExist();
//   if (client) {
//     return client;
//   }
//   client = await authenticate({
//     scopes: SCOPES,
//     keyfilePath: CREDENTIALS_PATH,
//   });
//   if (client.credentials) {
//     await saveCredentials(client);
//   }
//   return client;
// }

// async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
//   // Check if the selected day is Thursday
//   if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
// console.log('Meeting can only be scheduled on Thursdays between 3 PM to 6 PM.');
// return false; // Indicate failure
// }

//   // Check if the selected time is between 3 pm to 6 pm
//   const startHour = startTime.getHours();
//   const endHour = endTime.getHours();
//   const endMinutes = endTime.getMinutes();

//   // Adjust the condition to allow scheduling up to 6 PM but not after 
//   if (startHour < 15 || (endHour > 18 || (endHour === 18 && endMinutes !== 0))) {
//     console.log('Meeting can only be scheduled between 3 pm to 6 pm.');
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

//     const auth = await authorize();
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











const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function sendAuthorizationEmail(userEmails, authUrl) {
  const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'johnhunt5647@outlook.com',
      pass: 'Johnhunt1@',
    },
  });

  const encodedUrl = encodeURIComponent(authUrl);
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
    from: 'johnhunt5647@outlook.com',
    to: userEmails.join(','),
    subject: 'Authorize Google Calendar API',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}

async function authorize(calendarIds) {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Generate an authentication URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  // Send the authorization URL to the user via email
  await sendAuthorizationEmail(calendarIds, authUrl);

  // Perform any other actions as needed
  // (e.g., wait for user interaction, provide instructions)

  return null; // Indicate that authorization is pending
}




async function scheduleMeeting(auth, calendarIds, summary, description, startTime, endTime) {
  // Check if the selected day is Thursday
if (startTime.getDay() !== 4 || endTime.getDay() !== 4) { // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  console.log('Meeting can only be scheduled on Thursdays between 10AM to 6PM.');
  return false; // Indicate failure
}

// Check if the selected time is between 3 pm to 6 pm
const startHour = startTime.getHours();
const endHour = endTime.getHours();
const endMinutes = endTime.getMinutes();
const endSeconds = endTime.getSeconds();


if (startHour < 10 || (endHour > 18 || (endHour === 18 && (endMinutes > 0 || endSeconds > 0)))) {
  console.log('Meeting can only be scheduled between 10AM to 6PM.');
  return false; // Indicate failure
}

  const calendar = google.calendar({ version: 'v3', auth });

  const freeBusyRequests = calendarIds.map((calendarId) => ({
    id: calendarId,
  }));

  const freeBusyResponse = await calendar.freebusy.query({
    auth: auth,
    requestBody: {
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      items: freeBusyRequests,
    },
  });

  const busySlots = freeBusyResponse.data.calendars;

  const commonFreeSlots = calculateCommonFreeSlots(startTime, endTime, busySlots);

  // Minimum duration required for the meeting
  const minimumMeetingDuration = 60 * 60 * 1000; // 1 hour in milliseconds

  // Filter common free slots that are long enough for the meeting
  const suitableSlots = commonFreeSlots.filter(slot => {
    const slotDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
    return slotDuration >= minimumMeetingDuration;
  });

  if (suitableSlots.length > 0) {
    const firstSlot = suitableSlots[0];
    const meetingEndTime = new Date(new Date(firstSlot.start).getTime() + minimumMeetingDuration);
    const event = {
      summary,
      description,
      start: {
        dateTime: firstSlot.start,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: meetingEndTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
    };

    for (const calendarId of calendarIds) {
      await calendar.events.insert({
        auth: auth,
        calendarId: calendarId,
        resource: event,
      });
    }

    console.log(`Meeting scheduled for ${firstSlot.start} to ${meetingEndTime.toISOString()}`);
    return true; // Indicate success
  } else {
    console.log('No suitable free slots found for the meeting.');
    return false; // Indicate failure
  }
}

function calculateCommonFreeSlots(startTime, endTime, busySlots) {
  const busyPeriods = Object.values(busySlots).map((userBusy) =>
    userBusy.busy.map((busySlot) => ({
      start: new Date(busySlot.start).toISOString(),
      end: new Date(busySlot.end).toISOString(),
    }))
  );

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

app.post('/schedule-meeting', async (req, res) => {
  try {
    const { calendarIds, summary, description, startTime, endTime } = req.body;

    if (!calendarIds || !summary || !description || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const auth = await authorize(calendarIds);

    // If authorization is pending, return a response indicating that
    if (!auth) {
      return res.json({ message: 'Authorization email sent. Please check your email.' });
    }

    // Continue with scheduling the meeting using the obtained auth object
    await scheduleMeeting(auth, calendarIds, summary, description, new Date(startTime), new Date(endTime));

    return res.json({ message: 'Meeting scheduled successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
