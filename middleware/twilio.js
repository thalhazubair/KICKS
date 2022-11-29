require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports = {

  sendOtp:(number,otp)=>{
  client.messages
    .create({
       body: `your otp is ${otp}`,
       from: process.env.TWILIO_PHONE_NUMBER,
       to: number
     })
    .then((message) => {
      console.log(message.sid);
})
.catch((error)=>{
  console.log(error);
});

}
}
