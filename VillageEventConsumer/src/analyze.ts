import { getGPT4Response, getGPT4VisionResponse } from "./clients/openaiClient";
import { NewPostWebhookEvent } from "./types/custom";

const systemMessageForCheckingAbuseForTextOnlyModel = {
  role: "system",
  content: `You're a content moderator for the anonymous neighborhoods social app "Village". Please review the following post and decide whether it includes any of the violations:
    * Unsolicited sexual talk, overly horny content, sexual content involving minors
    * Overly political content
    * Cries for help that are not funny
    * Obvious scam content
    * Content that depicts death, violence, or physical injury in graphic detail.
    * Real racism or homophobia
    * Any variation of the N-word
    * Praise for any hate group
    * Real terroristic, suicidal, or criminal threats
    * Revealing people's names that are not public figures.
    
    Remember you should almost always allow funny or entertaining content. The next message will be the post. ONLY answer in JSON format with the SINGLE key "ban" and the value either being true or false.`,
} as any;

const systemMessageForCheckingAbuseForImageModel = {
  // gpt-4-1106-vision-preview model does not support json response for some fucking reason
  role: "system",
  content: `You're a content moderator for the anonymous neighborhoods social app "Village". Please review the following post and decide whether it includes any of the violations:
    * Unsolicited sexual talk, overly horny content, sexual content involving minors
    * Overly political content
    * Cries for help that are not funny
    * Obvious scam content
    * Content that depicts death, violence, or physical injury in graphic detail.
    * Real racism or homophobia
    * Any variation of the N-word
    * Praise for any hate group
    * Real terroristic, suicidal, or criminal threats
    * Revealing people's names that are not public figures.
    
    Remember you should almost always allow funny or entertaining content. The next message will be the post. ONLY answer with the single word- YES or NO`,
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
    let { text_content, image_url } = event.record;
    text_content = text_content ?? "";

    let isAbuse;
    if (image_url) {
      isAbuse = await isImagePostAbuse(text_content, image_url);
    } else {
      isAbuse = await isTextPostAbuse(text_content);
    }
    return isAbuse;
  } catch (err: any) {
    console.error("Error in getPostWithImageAbuseDecision:", err);
    return false;
  }
};

const isTextPostAbuse = async (text_content: string) => {
  try {
    const response = await getGPT4Response([
      systemMessageForCheckingAbuseForTextOnlyModel,
      {
        role: "user",
        content: text_content,
      },
    ]);

    if (response.choices.length == 0) {
      throw Error("Response choices has length of 0");
    }
    const answerString = response.choices[0].message.content as string;
    const answer = JSON.parse(answerString);
    if (!isAbuseAnswer(answer)) {
      throw Error(
        "Invalid response from OpenAI, response: " + JSON.stringify(response)
      );
    }
    return answer.ban;
  } catch (err: any) {
    console.error("Error in isTextPostAbuse:", err);
    return false;
  }
};

const isImagePostAbuse = async (text_content: string, image_url: string) => {
  try {
    const response = await getGPT4VisionResponse([
      systemMessageForCheckingAbuseForImageModel,
      {
        role: "user",
        content: [
          { type: "text", text: text_content },
          {
            type: "image_url",
            image_url: {
              url: image_url,
            },
          },
        ],
      },
    ]);

    if (response.choices.length == 0) {
      throw Error("Response choices has length of 0");
    }

    const answer = response.choices[0].message.content as string;

    if (answer.toLowerCase() === "yes") {
      return true;
    } else if (answer.toLowerCase() === "no") {
      return false;
    } else {
      throw Error(
        "Invalid response from OpenAI, response: " + JSON.stringify(response)
      );
    }
  } catch (err: any) {
    console.error("Error in isImagePostAbuse:", err);
    return false;
  }
};
