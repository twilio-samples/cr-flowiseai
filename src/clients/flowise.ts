import { FastifyBaseLogger } from "fastify";
import { EventSourceParserStream } from "eventsource-parser/stream";
import { FlowiseClient as Flowise } from "flowise-sdk";

export type FlowiseMessage = {
  text: string;
  question: string;
  chatId: string;
  chatMessageId: string;
  sessionId: string;
  memoryType?: string;
  agentReasoning?: string[];
  sourceDocuments?: any[];
  usedTools?: any[];
  fileAnnotations?: any[];
  artifacts?: any[];
};

type Config = {
  flowiseApiKey?: string;
  flowiseChatflowId: string;
  logger: FastifyBaseLogger;
};

type RequestOptions = {
  sessionId?: string;
  overrideConfig?: {
    vars?: Record<string, unknown>;
  };
};

type FlowiseRequest = {
  prompt: string;
  sessionId: string;
  from: string;
};

export default class FlowiseClient {
  private readonly client: Flowise;
  private readonly apiKey?: string;
  private readonly chatflowId: string;
  private readonly apiUrl: string;
  private readonly logger: FastifyBaseLogger;

  constructor(config: Config) {
    this.client = new Flowise({
      baseUrl: "https://cloud.flowiseai.com",
      apiKey: config.flowiseApiKey,
    });
    this.apiKey = config.flowiseApiKey;
    this.chatflowId = config.flowiseChatflowId;
    this.apiUrl = "https://cloud.flowiseai.com";
    this.logger = config.logger;
  }

  async streamMessage(
    { prompt, sessionId, from }: FlowiseRequest,
    onStream: (last: boolean, answer?: string) => void,
  ): Promise<void> {
    const start = Date.now();
    let firstTime = true;

    const prediction = await this.client.createPrediction({
      chatflowId: this.chatflowId,
      question: prompt,
      streaming: true,
      overrideConfig: {
        sessionId,
        vars: {
          customerPhoneNumber: from,
        },
      },
    });

    for await (const chunk of prediction) {
      if (chunk.event === "error") {
        this.logger.error(chunk);
        onStream(
          true,
          "I'm sorry, there was an error processing your request.",
        );
      }
      if (chunk.event === "token") {
        if (firstTime) {
          firstTime = false;
          this.logger.info(`First token latency: ${Date.now() - start}ms`);
        }
        onStream(false, chunk.data);
      }
      if (chunk.event === "end") {
        onStream(true);
      }
    }
  }

  async sendMessage({
    prompt,
    sessionId,
    from,
  }: FlowiseRequest): Promise<string> {
    const prediction = await this.client.createPrediction({
      chatflowId: this.chatflowId,
      question: prompt,
      streaming: false,
      overrideConfig: {
        sessionId,
        vars: {
          customerPhoneNumber: from,
        },
      },
    });

    return prediction.text;
  }
}
