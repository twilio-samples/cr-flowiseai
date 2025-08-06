import { JSONSchemaType } from "env-schema";

export interface Config {
  FLOWISE_API_KEY: string;
  FLOWISE_CHATFLOW_ID: string;
  PORT: number;
  DOMAIN: string;
  LOG_LEVEL: string;
}

const envSchema: JSONSchemaType<Config> = {
  type: "object",
  required: ["FLOWISE_API_KEY", "FLOWISE_CHATFLOW_ID"],
  properties: {
    FLOWISE_API_KEY: {
      type: "string",
    },
    FLOWISE_CHATFLOW_ID: {
      type: "string",
    },
    PORT: {
      type: "integer",
      default: 8080,
    },
    DOMAIN: {
      type: "string",
    },
    LOG_LEVEL: {
      type: "string",
      default: "info",
    },
  },
} as const;

export default envSchema;
