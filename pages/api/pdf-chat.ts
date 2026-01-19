import type { NextApiRequest, NextApiResponse } from 'next';
import { askAboutDocument } from '@/ai/flows/pdf-chat-flow';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Allow larger PDFs
        },
    },
};

type ResponseData = {
    answer?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { documentDataUri, question } = req.body;

        if (!documentDataUri || !question) {
            return res.status(400).json({
                error: 'Missing required fields: documentDataUri and question'
            });
        }

        const result = await askAboutDocument({
            documentDataUri,
            question,
        });

        return res.status(200).json({ answer: result.answer });
    } catch (error: any) {
        console.error('PDF Chat API Error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to process your request'
        });
    }
}
