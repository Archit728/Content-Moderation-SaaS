import { Client } from "@gradio/client";

export interface ModerationResult {
  probabilities: Record<string, number>;
  flagged: boolean;
  maxLabel: string;
  maxScore: number;
}

export const LABELS = [
  "toxic",
  "severe_toxic",
  "obscene",
  "threat",
  "insult",
  "identity_hate",
];

/**
 * Generate mock moderation probabilities
 * In production, this would call the real BERT model via HuggingFace API
 */
export function generateMockProbabilities(): Record<string, number> {
  const probs: Record<string, number> = {};
  LABELS.forEach((label) => {
    probs[label] = Math.random() * 0.9;
  });
  return probs;
}

/**
 * Check if content is flagged based on thresholds
 */
export function checkIfFlagged(
  probabilities: Record<string, number>,
  thresholds: Record<string, number>
): boolean {
  return Object.entries(probabilities).some(
    ([label, score]) => score >= (thresholds[label] ?? 0.5)
  );
}

/**
 * Get the max scoring label
 */
export function getMaxLabel(probabilities: Record<string, number>): {
  label: string;
  score: number;
} {
  let maxLabel = "";
  let maxScore = 0;

  Object.entries(probabilities).forEach(([label, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxLabel = label;
    }
  });

  return { label: maxLabel, score: maxScore };
}

/**
 * Moderate a single text
 */
// export async function moderateText(
//   text: string,
//   thresholds: Record<string, number>
// ): Promise<ModerationResult> {
//   const probabilities = generateMockProbabilities()
//   const { label: maxLabel, score: maxScore } = getMaxLabel(probabilities)
//   const flagged = checkIfFlagged(probabilities, thresholds)

//   return {
//     probabilities,
//     flagged,
//     maxLabel,
//     maxScore
//   }
// }

// export async function moderateText(
//   text: string,
//   thresholds: Record<string, number>
// ): Promise<ModerationResult> {
//   // Call Hugging Face API
//   // const response = await fetch(
//   //   "https://router.huggingface.co/models/Archit31/toxicity-bert",
//   //   {
//   //     method: "POST",
//   //     headers: {
//   //       Authorization: `Bearer ${process.env.HF_TOKEN}`,
//   //       "Content-Type": "application/json",
//   //     },
//   //     body: JSON.stringify({
//   //       inputs: text,
//   //       parameters: {
//   //         function_to_apply: "sigmoid", // important for multi-label
//   //       },
//   //     }),
//   //   }
//   // );

//   const response = await fetch(
//     "https://archit31-content-moderation-saas.hf.space/run/predict",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.HF_TOKEN}`, // your HF user token
//       },
//       body: JSON.stringify({
//         data: [text], // Space expects inputs as a list
//       }),
//     }
//   );
//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`HF API error: ${errorText}`);
//   }

//   const data = await response.json();

//   // Transform response into probabilities record
//   const probabilities: Record<string, number> = {};
//   if (Array.isArray(data.data[0])) {
//     // Some Spaces wrap outputs in an extra array
//     data.data[0].forEach((item: any) => {
//       probabilities[item.label] = item.score;
//     });
//   } else if (Array.isArray(data.data)) {
//     data.data.forEach((item: any) => {
//       probabilities[item.label] = item.score;
//     });
//   }

//   // Ensure all labels exist
//   LABELS.forEach((label) => {
//     if (!(label in probabilities)) probabilities[label] = 0;
//   });

//   // Determine flagged status
//   let flagged = false;
//   let maxLabel = "";
//   let maxScore = 0;

//   for (const label of LABELS) {
//     const score = probabilities[label];
//     if (score >= (thresholds[label] ?? 0.5)) flagged = true;

//     if (score > maxScore) {
//       maxScore = score;
//       maxLabel = label;
//     }
//   }

//   return {
//     probabilities,
//     flagged,
//     maxLabel,
//     maxScore,
//   };
// }

export interface ModerationResult {
  probabilities: Record<string, number>;
  flagged: boolean;
  maxLabel: string;
  maxScore: number;
}

let hfClient: Client | null = null;

async function getClient() {
  if (!hfClient) {
    hfClient = await Client.connect("Archit31/Content-Moderation-SaaS");
  }
  return hfClient;
}

export async function moderateText(
  text: string,
  thresholds: Record<string, number>
): Promise<ModerationResult> {
  // const client = await Client.connect("Archit31/Content-Moderation-SaaS");
  const client = await getClient();
  const result = await client.predict("/moderate_text", {
    text,
  });

  // Gradio wraps outputs in an array → unwrap first element
  if (!Array.isArray(result.data) || result.data.length === 0) {
    throw new Error("Invalid response from HuggingFace Space");
  }
  // console.log("Raw HF Response:", result);
  const hfOutput = result.data[0];
  // console.log("HF Moderation Output:", hfOutput);
  if (typeof hfOutput !== "object" || hfOutput === null) {
    throw new Error("Unexpected moderation output format");
  }

  const probabilities: Record<string, number> = {};

  // Ensure all expected labels exist
  LABELS.forEach((label) => {
    const value = (hfOutput as Record<string, number>)[label];
    probabilities[label] = typeof value === "number" ? value : 0;
  });

  let flagged = false;
  let maxLabel = "";
  let maxScore = 0;

  for (const label of LABELS) {
    const score = probabilities[label];

    if (score >= (thresholds[label] ?? 0.5)) {
      flagged = true;
    }

    if (score > maxScore) {
      maxScore = score;
      maxLabel = label;
    }
  }

  return {
    probabilities,
    flagged,
    maxLabel,
    maxScore,
  };
}
/**
 * Rate limiting helper
 */
export function isRateLimited(count: number, limit: number): boolean {
  return count >= limit;
}
