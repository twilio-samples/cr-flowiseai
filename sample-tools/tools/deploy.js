#!/usr/bin/env node

require("dotenv").config({ path: "../.env" });

const { TWILIO_FUNCTIONS_URL, FLOWISE_API_KEY } = process.env;

if (!TWILIO_FUNCTIONS_URL) {
  console.error("Error: TWILIO_FUNCTIONS_URL is not defined in the .env file.");
  process.exit(1);
}

if (!FLOWISE_API_KEY) {
  console.error("Error: FLOWISE_API_KEY is not defined in the .env file.");
  process.exit(1);
}

const tools = [
  {
    name: "Tools_BookAClass",
    description: "Use this tool to book a class for the customer.",
    color: "linear-gradient(rgb(195,11,57), rgb(30,7,66))",
    iconSrc:
      "https://img.freepik.com/premium-vector/booking-icon-vector-image-can-be-used-contact-us_120816-340953.jpg",
    schema: JSON.stringify([
      {
        id: 0,
        property: "phoneNumber",
        description: "The phone number of the customer",
        type: "string",
        required: true,
      },
      {
        id: 1,
        property: "className",
        description:
          "The name of the class the customer is booking. This should be the exact name of the class.",
        type: "string",
        required: true,
      },
    ]),
    func: `
      const fetch = require('node-fetch');
      const url = '${TWILIO_FUNCTIONS_URL}/book';
      const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: $phoneNumber, className: $className })
      };
      try {
          const response = await fetch(url, options);
          const json = await response.json();
          return json;
      } catch (error) {
          console.error(error);
          return '';
      }
    `,
  },
  {
    name: "Tool_CancelBooking",
    description: "Use this endpoint to cancel a booking for the customer.",
    color: "linear-gradient(rgb(16,195,95), rgb(49,73,76))",
    iconSrc: "https://static.thenounproject.com/png/3734238-200.png",
    schema: JSON.stringify([
      {
        id: 0,
        property: "phoneNumber",
        description: "The phone number of the customer",
        type: "string",
        required: true,
      },
      {
        id: 1,
        property: "className",
        description: "The name of the class to cancel",
        type: "string",
        required: true,
      },
    ]),
    func: `
      const fetch = require('node-fetch');
      const url = '${TWILIO_FUNCTIONS_URL}/cancel';
      const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: $phoneNumber, className: $className })
      };
      try {
          const response = await fetch(url, options);
          const json = await response.json();
          return json;
      } catch (error) {
          console.error(error);
          return '';
      }
    `,
  },
  {
    name: "Tools_ListBookings",
    description: "Use this endpoint to list the customer bookings",
    color: "linear-gradient(rgb(137,83,163), rgb(50,33,137))",
    iconSrc:
      "https://icons.veryicon.com/png/o/education-technology/online-education-background-management/my-class.png",
    schema: JSON.stringify([
      {
        id: 0,
        property: "phoneNumber",
        description: "The phone number of the customer",
        type: "string",
        required: true,
      },
    ]),
    func: `
      const fetch = require('node-fetch');
      const url = '${TWILIO_FUNCTIONS_URL}/bookings';
      const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: $phoneNumber })
      };
      try {
          const response = await fetch(url, options);
          const json = await response.json();
          return json;
      } catch (error) {
          console.error(error);
          return '';
      }
    `,
  },
  {
    name: "Tool_ListAvailableClasses",
    description: "Use this tool to get list of available classes.",
    color: "linear-gradient(rgb(20,135,145), rgb(101,215,193))",
    iconSrc: "https://static.thenounproject.com/png/823038-200.png",
    schema: JSON.stringify([]),
    func: `
      const fetch = require('node-fetch');
      const url = '${TWILIO_FUNCTIONS_URL}/classes';
      const options = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
      };
      try {
          const response = await fetch(url, options);
          const json = await response.json();
          return json;
      } catch (error) {
          console.error(error);
          return '';
      }
    `,
  },
];

// Function to create tools
async function createTool(tool) {
  const response = await fetch("https://cloud.flowiseai.com/api/v1/tools", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLOWISE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tool),
  });

  const result = await response.json();
  if (response.ok) {
    console.log(`Successfully created tool: ${result.name}`);
  } else {
    throw new Error(
      `Failed to create tool: ${result.error || JSON.stringify(result)}`,
    );
  }
}

Promise.all(tools.map(createTool))
  .then(() => console.log("All tools created!"))
  .catch(console.error);
