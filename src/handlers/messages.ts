import { FastifyRequest, FastifyReply } from "fastify";
import { twiml } from "twilio";
import { FlowiseClient } from "../clients";
import CRSession from "../CRSession";

export default async function messageHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const body = req.body as Record<string, string>;
  const flowiseClient = req.diScope.resolve<FlowiseClient>("flowiseClient");
  const session: CRSession = await (
    req.diScope.cradle as any
  ).getActiveSession();
  if (!session) {
    const response = new twiml.MessagingResponse();
    response.message("Sorry there is no active session to process.");

    reply.type("text/xml").send(response.toString());
    return;
  }
}
