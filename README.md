# ConversationRelay - Flowise AI Sample

Using https://flowiseai.com/ as the Agent Builder with ConversationRelay. This code-sample uses [conversationrelay-bridge npmjs package](https://www.npmjs.com/package/@twilio-forward/conversationrelay-bridge).

## Getting Started

For local development, make sure you have Node and [ngrok](https://ngrok.com/downloads/mac-os) installed.

### Setting up local environment

1) Clone this repo
2) Run `npm install`. Then `cp .env.example .env` and set up the variables. We will get the Flowise values from the next step
3) Modify `handlers/twiml.ts` to change the default greeting message or any other changes you want to ConversationRelay. All available attributes can be found on [TwiML™ Voice: <ConversationRelay>](https://www.twilio.com/docs/voice/twiml/connect/conversationrelay)
4) Run `npm run dev` to start the dev server. Expose your local server to the internet using `ngrok http 8080`
5) Visit Twilio Console page to purchase a number. Then configure the Incoming Webhook to point to `ngrokDomain/twiml`

## Getting Started (Flowise)

1) Visit [https://flowiseai.com/](https://flowiseai.com/) and sign up for an account
2) Go to the Credentials tab and create a new credential for LLM model of choice
3) Go to Agentflows and create a new Flow - call it VoiceAgent.
4) Create your flow as you see fit.
5) Click the `</>` icon on the top right corner and make sure the `default` API key is selected.
6) Grab the `FLOWISE_CHATFLOW_ID` (from the URL) and update your local `.env`
7) Visit the `API Keys` on the homepage to grab the `FLOWISE_API_KEY`

You are now ready to call your number!

### Optional

There are a few Twilio Functions code samples that can be used, found in `./sample-tools`. This will create a 4 tools to mimic a fitness class for listing classes, booking, cancelling, and finding your upcoming classes. Visit this directory for more information.

## Deployment

We suggest using [Fly.IO](https://fly.io/) to host your application. It supports long-running WebSocket connections and is free (when you signup, you have to add your credit card, but you can deploy free servers for testing purposes).

This repo includes the cofiguration for easily deploying the application to Fly.IO. All the configurations are located in the `fly.toml` file.

1) Sign up for [Fly.IO](https://fly.io/) and install/setup the [CLI](https://fly.io/docs/flyctl/).
2) Create a new Fly App: `fly apps create cr-flowiseai`
3) Grab the domain name of your newly created Fly app and update your local `.env` with the `DOMAIN` value.
3) Setup the secrets: `fly secrets import < .env`
4) Deploy the application: `fly deploy`
5) View the logs: `fly logs`

You can now set the Incoming Webhook of your Twilio number to point to `DOMAIN/twiml`.
