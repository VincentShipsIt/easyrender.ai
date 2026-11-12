import { llmsFullTxt, textResponse } from '@/lib/seo/llms';

// https://easyrender.ai/llms-full.txt: llms.txt plus the home FAQ and every published guide.
export const revalidate = 600;

export const GET = () => textResponse(llmsFullTxt());
