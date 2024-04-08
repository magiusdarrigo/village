import { getGPT4Response, getGPT4VisionResponse } from "./clients/openaiClient";
import { NewPostWebhookEvent } from "./types/custom";

const systemMessageForCheckingAbuse = {
  role: "system",
  content: `You are a content moderator for an anonymous social media app "Village". Please always allow posts if they are on the fence or edgy, for the community will manually content moderate too. Please review the following post and decide whether it violates any of the following guidelines:
    * Unsolicited sexual advances or unsolicited outreach for sex
    * Sexual content that includes an individual who is under 18 years old.
    * Content that depicts death, violence, or physical injury in graphic detail.
    * Non-joking Racism
    * Any variation of the N-word
    * Non-joking homophobia
    * Praise for Hitler/Nazis
    * Real terroristic threats. Jokes are okay
    * Doxxing people that are not public figures.
    * Real suicide threats. Jokes are okay
    
    The next message will be the post. ONLY answer in JSON format with the SINGLE key "ban" and the value either being true or false.`,
} as any;

type AbuseAnswer = {
  ban: boolean;
};

function isAbuseAnswer(obj: any): obj is AbuseAnswer {
  return (
    typeof obj === "object" && obj !== null && typeof obj.ban === "boolean"
  );
}

export const checkAbuse = async (event: NewPostWebhookEvent) => {
  try {
    const { text_content, image_url } = event.record;

    let response;
    if (image_url) {
      response = await getGPT4VisionResponse([
        systemMessageForCheckingAbuse,
        {
          role: "user",
          content: [
            { type: "text", text_content },
            {
              type: "image_url",
              image_url: {
                url: image_url,
              },
            },
          ],
        },
      ]);
    } else {
      response = await getGPT4Response([
        systemMessageForCheckingAbuse,
        {
          role: "user",
          content: text_content,
        },
      ]);
    }
    if (response.choices.length == 0) {
      throw Error("Response choices has length of 0");
    }
    const answer = response.choices[0].message;
    if (!isAbuseAnswer(answer)) {
      throw Error(
        "Invalid response from OpenAI, response: " + JSON.stringify(answer)
      );
    }
    return answer.ban;
  } catch (err: any) {
    console.error("Error in getPostWithImageAbuseDecision:", err);
    // default to false
    return false;
  }
};
