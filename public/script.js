// async function scheduleMeeting() {
//     const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());
//     const summary = document.getElementById('summary').value;
//     const description = document.getElementById('description').value;
//     const startTime = document.getElementById('startTime').value;
//     const endTime = document.getElementById('endTime').value;

//     try {
//       const response = await fetch('http://localhost:3000/schedule-meeting', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           calendarIds,
//           summary,
//           description,
//           startTime,
//           endTime,
//         }),
//       });
  
//       const result = await response.json();
//       document.getElementById('result').innerHTML = `<p>${result.message}</p>`;
//     } catch (error) {
//       console.error(error);
//       document.getElementById('result').innerHTML = '<p>Error scheduling the meeting</p>';
//     }
// }



// function addCalendarIdsField() {
//   const container = document.getElementById('calendarIdsContainer');
//   const newInputContainer = document.createElement('div');
//   newInputContainer.classList.add('input-container');

//   const newInput = document.createElement('input');
//   newInput.type = 'text';
//   newInput.name = 'calendarIds';

//   const removeButton = document.createElement('i');
//   // removeButton.type = 'button';
//   // removeButton.className='remove-btn fa-regular fa-circle-xmark';
//   removeButton.className='remove-btn fa-solid fa-circle-xmark';
//   removeButton.onclick = function() {
//     container.removeChild(newInputContainer);
//   };

//   newInputContainer.appendChild(newInput);
//   newInputContainer.appendChild(removeButton);
//   newInput.addEventListener("focus", (event) => {
//     event.target.style.background = ""
//   })

//   container.appendChild(newInputContainer);
// }




























// async function sendAuthEmail() {
//   const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());

//   try {
//     const response = await fetch('http://localhost:3000/send-auth-email', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         calendarIds,
//       }),
//     });

//     const result = await response.json();
//     document.getElementById('result').innerHTML = `<p>${result.message}</p>`;
//   } catch (error) {
//     console.error(error);
//     document.getElementById('result').innerHTML = '<p>Error sending authentication email</p>';
//   }
// }


// async function scheduleMeeting() {
//   console.log("Schedule Meeting Hit---------")
//   const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());
//   const summary = document.getElementById('summary').value;
//   const description = document.getElementById('description').value;
//   const startTime = document.getElementById('startTime').value;
//   const endTime = document.getElementById('endTime').value;

//   console.log(calendarIds)
//   console.log(summary)
//   console.log(description)
//   console.log(startTime)
//   console.log(endTime)

//   try {
//     const response = await fetch('http://localhost:3000/schedule-meeting', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         calendarIds,
//         summary,
//         description,
//         startTime,
//         endTime,
//       }),
//     });

//     const result = await response.json();
//     document.getElementById('result').innerHTML = `<p>${result.message}</p>`;

//     console.log('Server Response:', result);
//   } catch (error) {
//     console.error(error);
//     document.getElementById('result').innerHTML = '<p>Error scheduling the meeting</p>';
//   }
// }



// function addCalendarIdsField() {
// const container = document.getElementById('calendarIdsContainer');
// const newInputContainer = document.createElement('div');
// newInputContainer.classList.add('input-container');

// const newInput = document.createElement('input');
// newInput.type = 'text';
// newInput.name = 'calendarIds';

// const removeButton = document.createElement('i');
// // removeButton.type = 'button';
// // removeButton.className='remove-btn fa-regular fa-circle-xmark';
// removeButton.className='remove-btn fa-solid fa-circle-xmark';
// removeButton.onclick = function() {
//   container.removeChild(newInputContainer);
// };

// newInputContainer.appendChild(newInput);
// newInputContainer.appendChild(removeButton);
// newInput.addEventListener("focus", (event) => {
//   event.target.style.background = ""
// })

// container.appendChild(newInputContainer);
// }














async function sendAuthEmail() {
  const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());

  try {
      for (const userEmail of calendarIds) {
          await fetch('http://localhost:3000/send-auth-email', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  calendarIds: [userEmail], // Pass userEmail as an array
              }),
          });
      }

      document.getElementById('result').innerHTML = 'Authorization emails sent. Please check your email.';
  } catch (error) {
      console.error(error);
      document.getElementById('result').innerHTML = '<p>Error sending authentication email</p>';
  }
}


async function scheduleMeeting() {
  console.log("Schedule Meeting Hit---------")
  const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());
  const summary = document.getElementById('summary').value;
  const description = document.getElementById('description').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  console.log(calendarIds)
  console.log(summary)
  console.log(description)
  console.log(startTime)
  console.log(endTime)

  try {
    const response = await fetch('http://localhost:3000/schedule-meeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendarIds,
        summary,
        description,
        startTime,
        endTime,
      }),
    });

    const result = await response.json();
    document.getElementById('result').innerHTML = `<p>${result.message}</p>`;

    console.log('Server Response:', result);
  } catch (error) {
    console.error(error);
    document.getElementById('result').innerHTML = '<p>Error scheduling the meeting</p>';
  }
}


function addCalendarIdsField() {
const container = document.getElementById('calendarIdsContainer');
const newInputContainer = document.createElement('div');
newInputContainer.classList.add('input-container');

const newInput = document.createElement('input');
newInput.type = 'text';
newInput.name = 'calendarIds';

const removeButton = document.createElement('i');
// removeButton.type = 'button';
// removeButton.className='remove-btn fa-regular fa-circle-xmark';
removeButton.className='remove-btn fa-solid fa-circle-xmark';
removeButton.onclick = function() {
  container.removeChild(newInputContainer);
};

newInputContainer.appendChild(newInput);
newInputContainer.appendChild(removeButton);
newInput.addEventListener("focus", (event) => {
  event.target.style.background = ""
})

container.appendChild(newInputContainer);
}














// async function sendAuthEmail() {
//   const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());

//   try {
//       for (const userEmail of calendarIds) {
//           await fetch('http://localhost:3000/send-auth-email', {
//               method: 'POST',
//               headers: {
//                   'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({
//                   calendarIds: [userEmail], // Pass userEmail as an array
//               }),
//           });
//       }

//       document.getElementById('result').innerHTML = 'Authorization emails sent. Please check your email.';
//   } catch (error) {
//       console.error(error);
//       document.getElementById('result').innerHTML = '<p>Error sending authentication email</p>';
//   }
// }


// async function scheduleMeeting() {
//   console.log("Schedule Meeting Hit---------")
//   const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());
//   const summary = document.getElementById('summary').value;
//   const description = document.getElementById('description').value;
//   const startTime = document.getElementById('startTime').value;
//   const endTime = document.getElementById('endTime').value;

//   console.log(calendarIds)
//   console.log(summary)
//   console.log(description)
//   console.log(startTime)
//   console.log(endTime)

//   try {
//     const response = await fetch('http://localhost:3000/schedule-meeting', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         calendarIds,
//         summary,
//         description,
//         startTime,
//         endTime,
//       }),
//     });

//     const result = await response.json();
//     document.getElementById('result').innerHTML = `<p>${result.message}</p>`;

//     console.log('Server Response:', result);
//   } catch (error) {
//     console.error(error);
//     document.getElementById('result').innerHTML = '<p>Error scheduling the meeting</p>';
//   }
// }


// function addCalendarIdsField() {
// const container = document.getElementById('calendarIdsContainer');
// const newInputContainer = document.createElement('div');
// newInputContainer.classList.add('input-container');

// const newInput = document.createElement('input');
// newInput.type = 'text';
// newInput.name = 'calendarIds';

// const removeButton = document.createElement('i');
// // removeButton.type = 'button';
// // removeButton.className='remove-btn fa-regular fa-circle-xmark';
// removeButton.className='remove-btn fa-solid fa-circle-xmark';
// removeButton.onclick = function() {
//   container.removeChild(newInputContainer);
// };

// newInputContainer.appendChild(newInput);
// newInputContainer.appendChild(removeButton);
// newInput.addEventListener("focus", (event) => {
//   event.target.style.background = ""
// })

// container.appendChild(newInputContainer);
// }

















// async function sendAuthEmail() {
//   const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());

//   try {
//     for (const userEmail of calendarIds) {
//       const response = await fetch('http://localhost:3000/send-auth-email', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           calendarId: userEmail,
//         }),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log(result.message);

//         if (!result.credentialsExist) {
//           console.log(`Authentication email sent to ${userEmail}`);
//         }
//       } else {
//         const errorData = await response.json();
//         console.error(`Error sending authentication email to ${userEmail}:`, errorData.error);
//       }
//     }

//     document.getElementById('result').innerHTML = 'Authorization emails sent. Please check your email.';
//   } catch (error) {
//     console.error('Error sending authentication email:', error);
//     document.getElementById('result').innerHTML = '<p>Error sending authentication email</p>';
//   }
// }




// async function scheduleMeeting() {
//   console.log("Schedule Meeting Hit---------")
//   const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());
//   const summary = document.getElementById('summary').value;
//   const description = document.getElementById('description').value;
//   const startTime = document.getElementById('startTime').value;
//   const endTime = document.getElementById('endTime').value;

//   console.log(calendarIds)
//   console.log(summary)
//   console.log(description)
//   console.log(startTime)
//   console.log(endTime)

//   try {
//     const response = await fetch('http://localhost:3000/schedule-meeting', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         calendarIds,
//         summary,
//         description,
//         startTime,
//         endTime,
//       }),
//     });

//     const result = await response.json();
//     document.getElementById('result').innerHTML = `<p>${result.message}</p>`;

//     console.log('Server Response:', result);
//   } catch (error) {
//     console.error(error);
//     document.getElementById('result').innerHTML = '<p>Error scheduling the meeting</p>';
//   }
// }


// function addCalendarIdsField() {
// const container = document.getElementById('calendarIdsContainer');
// const newInputContainer = document.createElement('div');
// newInputContainer.classList.add('input-container');

// const newInput = document.createElement('input');
// newInput.type = 'text';
// newInput.name = 'calendarIds';

// const removeButton = document.createElement('i');
// // removeButton.type = 'button';
// // removeButton.className='remove-btn fa-regular fa-circle-xmark';
// removeButton.className='remove-btn fa-solid fa-circle-xmark';
// removeButton.onclick = function() {
//   container.removeChild(newInputContainer);
// };

// newInputContainer.appendChild(newInput);
// newInputContainer.appendChild(removeButton);
// newInput.addEventListener("focus", (event) => {
//   event.target.style.background = ""
// })

// container.appendChild(newInputContainer);
// }






















// async function sendAuthEmail() {
//   const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());

//   try {
//     const response = await fetch('http://localhost:3000/send-auth-email', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         calendarIds,
//       }),
//     });

//     const result = await response.json();
//     document.getElementById('result').innerHTML = `<p>${result.message}</p>`;
//   } catch (error) {
//     console.error(error);
//     document.getElementById('result').innerHTML = '<p>Error sending authentication email</p>';
//   }
// }

// async function scheduleMeeting() {
//   const calendarIds = Array.from(document.getElementsByName('calendarIds')).map(input => input.value.trim());
//   const summary = document.getElementById('summary').value;
//   const description = document.getElementById('description').value;
//   const startTime = document.getElementById('startTime').value;
//   const endTime = document.getElementById('endTime').value;

//   try {
//     const response = await fetch('http://localhost:3000/schedule-meeting', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         calendarIds,
//         summary,
//         description,
//         startTime,
//         endTime,
//       }),
//     });

//     const result = await response.json();
//     document.getElementById('result').innerHTML = `<p>${result.message}</p>`;
//   } catch (error) {
//     console.error(error);
//     document.getElementById('result').innerHTML = '<p>Error scheduling the meeting</p>';
//   }
// }

// function addCalendarIdsField() {
//   const container = document.getElementById('calendarIdsContainer');
//   const newInputContainer = document.createElement('div');
//   newInputContainer.classList.add('input-container');

//   const newInput = document.createElement('input');
//   newInput.type = 'text';
//   newInput.name = 'calendarIds';

//   const removeButton = document.createElement('i');
//   removeButton.className = 'remove-btn fa-solid fa-circle-xmark';
//   removeButton.onclick = function () {
//     container.removeChild(newInputContainer);
//   };

//   newInputContainer.appendChild(newInput);
//   newInputContainer.appendChild(removeButton);
//   newInput.addEventListener("focus", (event) => {
//     event.target.style.background = ""
//   })

//   container.appendChild(newInputContainer);
// }

// document.getElementById('sendAuthEmailButton').addEventListener('click', sendAuthEmail);
// document.getElementById('scheduleMeetingButton').addEventListener('click', scheduleMeeting);




















// async function sendAuthEmail() {
//   const calendarIds = getCalendarIds();

//   try {
//     const response = await fetch('http://localhost:3000/send-auth-email', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         calendarIds,
//       }),
//     });

//     const result = await response.json();
//     document.getElementById('result').innerHTML = `<p>${result.message}</p>`;
//   } catch (error) {
//     console.error(error);
//     document.getElementById('result').innerHTML = '<p>Error sending authentication email</p>';
//   }
// }

// async function scheduleMeeting() {
//   const calendarIds = getCalendarIds();
//   const summary = document.getElementById('summary').value;
//   const description = document.getElementById('description').value;
//   const startTime = document.getElementById('startTime').value;
//   const endTime = document.getElementById('endTime').value;

//   try {
//     const response = await fetch('http://localhost:3000/schedule-meeting', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         calendarIds,
//         summary,
//         description,
//         startTime,
//         endTime,
//       }),
//     });

//     const result = await response.json();
//     document.getElementById('result').innerHTML = `<p>${result.message}</p>`;
//   } catch (error) {
//     console.error(error);
//     document.getElementById('result').innerHTML = '<p>Error scheduling the meeting</p>';
//   }
// }

// function getCalendarIds() {
//   const calendarIds = Array.from(document.getElementsByName('calendarIds'))
//     .map(input => input.value.trim())
//     .filter(value => value !== ''); // Remove empty values

//   return calendarIds;
// }

// function addCalendarIdsField() {
//   const container = document.getElementById('calendarIdsContainer');
//   const newInputContainer = document.createElement('div');
//   newInputContainer.classList.add('input-container');

//   const newInput = document.createElement('input');
//   newInput.type = 'text';
//   newInput.name = 'calendarIds';

//   const removeButton = document.createElement('i');
//   removeButton.className = 'remove-btn fa-solid fa-circle-xmark';
//   removeButton.onclick = function() {
//     container.removeChild(newInputContainer);
//   };

//   newInputContainer.appendChild(newInput);
//   newInputContainer.appendChild(removeButton);
//   newInput.addEventListener("focus", (event) => {
//     event.target.style.background = ""
//   });

//   container.appendChild(newInputContainer);
// }
