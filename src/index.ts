import {
  createServer,
  diContainer,
} from "@twilio-forward/conversationrelay-bridge";
import { asClass, asValue } from "awilix";
import * as handlers from "./handlers";
import CRSession from "./CRSession";
import * as clients from "./clients";
import envSchema from "./config";

const start = async (): Promise<void> => {
  const server = await createServer({
    port: parseInt(process.env.PORT || "3000", 10),
    twiml: handlers.twiml,
    crSession: CRSession,
    envSchema: envSchema,
  });

  diContainer.register({
    flowiseApiKey: asValue(server.config.FLOWISE_API_KEY),
    domain: asValue(server.config.DOMAIN),
    flowiseChatflowId: asValue(server.config.FLOWISE_CHATFLOW_ID),
    flowiseClient: asClass(clients.FlowiseClient).singleton(),
  });

  try {
    await server.listen({ port: server.config.PORT, host: "0.0.0.0" });

    const welcomeMessage = [
      "\n🚀 Twilio - FlowiseAI Bridge Server Started!",
      "====================================",
      `Port: ${server.config.PORT}`,
      `Localhost: http://localhost:${server.config.PORT}`,
      "",
      `WebSocket Endpoint: wss://${server.config.DOMAIN}/ws`,
      `TwiML Endpoint: https://${server.config.DOMAIN}/twiml`,
      `Messages Endpoint: https://${server.config.DOMAIN}/messages`,
      `Health Check: https://${server.config.DOMAIN}/health`,
      "",
      "Ready to receive calls! 📞",
    ];

    server.log.info(welcomeMessage.join("\n"));
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
