import bot from './assets/bot.svg'
import user from './assets/user.svg'


const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

//repeats 300 ms, displays dots adding up to 3, 
//and once it reaches 4 it will reset to empty string. 

//element is the message div
//set text content to empty string
function loader(element) {
  element.textContent = '';

  //set text content to increment by 1 every 300 ms
  loadInterval = setInterval(() => {
    element.textContent += '.'; 

    //if text content is 4 dots, set text content to empty string
    if (element.textContent === '....') {
      element.textContent = '';
    }
}, 300);
}

//loads answers from the bot, types them out one letter at a time, every 20 ms
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}


//makes unique id for each message
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random()
  const hexidecimalString = randomNumber.toString(16)
 
  return `id-${timestamp}-${hexidecimalString}`
}


//creates the chat stripe visual and icon 
function chatStripe (isAi, value, uniqueID) {
  
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
    <div class="chat">
    <div class ="profile">
    <img
    src="${isAi ? bot : user}"
    alt="${ isAi ? 'bot' : 'user'}"
    />
    </div>
    <div class="message" id="${uniqueID}"> ${value} </div>
    </div>
    </div>
    `
  )
  
}

const handleSubmit = async (e) => {
  e.preventDefault();

 const data = new FormData(form); // get the data from the form

 chatContainer.innerHTML += chatStripe(false, data.get('prompt')) // add the user's message to the chat container

 form.reset(); // reset the form

 const uniqueID = generateUniqueId(); // generate a unique id for the message
 chatContainer.innerHTML+= chatStripe(true, " ", uniqueID); // add the bot's message to the chat container

 chatContainer.scrollTop = chatContainer.scrollHeight; // scroll to the bottom of the chat container

 const messageDiv = document.getElementById(uniqueID); // get the message div

 loader(messageDiv) // start the loader

 const response = await fetch('http://localhost:3001', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
  },
  body: JSON.stringify({
      prompt: data.get('prompt')
  })
})

clearInterval(loadInterval)
messageDiv.innerHTML = " "

if (response.ok) {
  const data = await response.json();
  const parsedData = data.bot.trim() 

  typeText(messageDiv, parsedData)
} else {
  const err = await response.text()

  messageDiv.innerHTML = "Something went wrong"
  alert(err)
}
}

 
form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {  //for enter key press. not curently wokring somehow
  if (e.key === `'Enter'`) {
    handleSubmit(e)
  }
})




