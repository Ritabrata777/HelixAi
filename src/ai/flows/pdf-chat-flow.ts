/**
 * @fileOverview A flow for answering questions about a PDF document.
 *
 * - askAboutDocument - A function that answers a user's question based on a PDF.
 * - AskAboutDocumentInput - The input type for the askAboutDocument function.
 * - AskAboutDocumentOutput - The return type for the askAboutDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AskAboutDocumentInputSchema = z.object({
    documentDataUri: z
        .string()
        .describe(
            "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
        ),
    question: z.string().describe("The user's question about the document."),
});
export type AskAboutDocumentInput = z.infer<typeof AskAboutDocumentInputSchema>;

const AskAboutDocumentOutputSchema = z.object({
    answer: z.string().describe("The answer to the user's question."),
});
export type AskAboutDocumentOutput = z.infer<typeof AskAboutDocumentOutputSchema>;

export async function askAboutDocument(input: AskAboutDocumentInput): Promise<AskAboutDocumentOutput> {
    return pdfChatFlow(input);
}

const prompt = ai.definePrompt({
    name: 'pdfChatPrompt',
    input: { schema: AskAboutDocumentInputSchema },
    output: { schema: AskAboutDocumentOutputSchema },
    prompt: `You are a helpful AI assistant. Your task is to answer the user's question based *only* on the content of the provided PDF document. If the answer cannot be found in the document, you must state that clearly. Do not use any external knowledge.

Document:
{{media url=documentDataUri}}

Question:
"{{{question}}}"`,
});

const pdfChatFlow = ai.defineFlow(
    {
        name: 'pdfChatFlow',
        inputSchema: AskAboutDocumentInputSchema,
        outputSchema: AskAboutDocumentOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
