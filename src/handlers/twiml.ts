import { FastifyRequest, FastifyReply } from "fastify";

export default function twimlHandler(req: FastifyRequest, reply: FastifyReply) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Connect>
      <ConversationRelay
        url="wss://${req.server.config.DOMAIN}/ws"
        welcomeGreeting="Hello and welcome to NightOwl Fitness! How can I be of service to you today?"
      />
    </Connect>
  </Response>`;

  req.log.info("TwiML requested, returning ConversationRelay configuration");
  reply.type("text/xml").send(twiml);
}
