
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const StreamChat = require('stream-chat').StreamChat;
const dialogflow = require('dialogflow').v2beta1;
const uuid = require('uuid');

require('dotenv').config({path:  "../.env"})

const app = express();
const port = process.env.VUE_APP_PORT || 3000

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Getstream chat SDK
const serverSideClient = new StreamChat(
    process.env.VUE_APP_KEY, 
    process.env.APP_SECRET
);

app.get("/", async (req, res) => {
    res.send({ hello: "World!" });
});

app.post('/login', async (req, res) => {
    const userId = req.body.userId

    if (!userId) {
        return res.status(400).send({
            status: "error",
            message: "username and name is required"
        })
    } 

    return res.status(200).send({
        status: "success",
        token: serverSideClient.createToken(userId)
    })
});


async function getAnswer (question) {
    const sessionId = uuid.v4();

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(
        process.env.DIALOGFLOW_PROJECT_ID, 
        sessionId
    );

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: question,
          // The language used by the client (en-US)
          languageCode: 'en-US',
        },
      },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);

    return responses[0].queryResult.fulfillmentText;
}

app.post('/webhook', async (req, res) => {
    const { cid, type, message, user } = req.body
    const [org, chan] = cid.split(':')

    res.status(200).send({
        status: "success"
    })

    if (type === "message.new" && user.id !== 'bendit') {
        const channel = serverSideClient.channel(org, chan);

        const messagePayload = {
            text: await getAnswer(message.text),
            user: {id: 'bendit'},
        }

        try {
            await channel.sendMessage(messagePayload);
        } catch(e) {
            console.log(e.message)
        }
    }
});

app.listen(port, () => {
    console.log(`Node app listening on port ${port}!`)
});