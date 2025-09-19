# sample-tools

Functions to serve as sample tools for the Flowise NightOwl Fitness demo.

## Creating new environment

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)

Recommended method, homebrew:
```shell
brew tap twilio/brew && brew install twilio
twilio login
```

2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```shell
twilio serverless:init example --template=nightowl-fitness && cd nightowl-fitness
```

## Deploying

Deploy your functions with the following command. Note: you must run this command from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```shell
twilio serverless:deploy
```

Add the URL to `.env` as `TWILIO_FUNCTIONS_URL`. Then

```shel
./tools/deploy.js
```

to deploy them as Tools to Flowise.
