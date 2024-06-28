import OpenAI from "openai";

const openai = new OpenAI();

export const getGPT4Response = async (messages: any[]) => {
  return await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages,
    response_format: {
      type: "json_object",
    },
  });
};

export const getGPT4VisionResponse = async (messages: any[]) => {
  return await openai.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    messages,
  });
};
