import {
  ConversationRelaySessionArgs,
  ConversationRelaySession,
  PromptMessage,
  DTMFMessage,
  ErrorMessage,
} from "@twilio-forward/conversationrelay-bridge";
import { FlowiseClient } from "./clients";
import { diContainer } from "@twilio-forward/conversationrelay-bridge";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_RESPONSE_LENGTH = 3000;

export default class CRSession extends ConversationRelaySession {
  private readonly flowiseClient: FlowiseClient;
  private readonly history: Message[];

  constructor(args: ConversationRelaySessionArgs) {
    super(args);

    this.flowiseClient = diContainer.resolve("flowiseClient");
    this.history = [];
  }

  async handlePrompt(event: PromptMessage): Promise<void> {
    const prompt = event.voicePrompt;
    this.logger.info(`User prompt received: ${prompt}`);

    if (!this.session) {
      this.logger.error("Session not found for prompt");
      return;
    }

    this.history.push({ role: "user", content: prompt });

    try {
      await this.flowiseClient.streamMessage(
        { prompt, sessionId: this.session.sessionId, from: this.session.from },
        (last: boolean, answer?: string) => {
          this.logger.info(
            `Streaming partial response: ${answer}, lastToken: ${last}`,
          );

          if (!last && answer) {
            this.history.push({ role: "assistant", content: answer });
          }

          this.sendToken(answer ?? "", last);

          if (last) {
            this.logger.info("Streaming complete");
          }
        },
      );
    } catch (error) {
      this.logger.error(
        { error: (error as Error).message },
        "Error calling Flowise",
      );

      this.sendToken(
        "I apologize, but I'm having trouble processing your request right now. Please try again.",
        true,
      );
    }
  }

  async handleDTMF(event: DTMFMessage): Promise<void> {
    this.logger.info("DTMF received");

    if (event.digit === "0") {
      this.sendToken("connecting you to a human agent. Please hold.", true);
    }
  }

  async handleError(message: ErrorMessage): Promise<void> {
    this.logger.error("Error received");
  }

  async handleClose(): Promise<void> {
    this.logger.info("WebSocket connection closed");
    const duration =
      (new Date().getTime() - this.session.startTime.getTime()) / 1000;
    this.logger.info(
      {
        duration: `${duration}s`,
        messageCount: this.history.length,
      },
      "Call summary",
    );
  }
}
