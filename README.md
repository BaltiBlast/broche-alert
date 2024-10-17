# broche-alert

Just a kebab pin that sends you a notification for the streams you want.

## Initialization

1. Creating an application on the Twitch developer portal
   All the steps are available here:
   https://dev.twitch.tv/docs/api/#step-1-register-an-application

2. Create a webhook on the Discord channel of your choice and retrieve the URL.

   > Right-click on the Discord channel -> Integration -> New webhook -> Copy webhook URL

3. Fill in the .env.example with the information you have gathered

4. Use routes for testing.

## Routes for testing

🔴 To try this out locally, you'll need a service like ngrok. Twitch only accepts HTTPS URLs 🔴

replace `USERNAME` by the username of the twitch user

- ADD USER TO LIVE EVENT
  `curl -X POST http://localhost:3000/subscribe-to-live/USERNAME`

- DELETE USER FROM LIVE EVENT
  `curl -X DELETE http://localhost:3000/unsubscribe/USERNAME`

- VERIFY IF WEBHOKK SUBSCRIPTION IS ENABLED
  `curl -X GET http://localhost:3000/check-subscriptions`

It's free and it'll stay free!

In Kebab We trust - Made By Balti
🟣 TWITCH : balti_blast 🟣
