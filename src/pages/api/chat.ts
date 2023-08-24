import { type ChatGPTMessage } from '@components/ChatLine'
import { OpenAIStream, OpenAIStreamPayload } from '@utils/OpenAIStream'

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()

  const messages: ChatGPTMessage[] = [
    {
      role: 'system',
      content: `An AI assistant for an NFTs manager for the XPR Network, engage in an inspiring and humorous conversation. 
      The AI assistant is a powerful, human-like artificial intelligence with expertise in NFTs, engineering, and frontend development. 
      The AI's traits include helpfulness, cheekiness, comedy, cleverness, and articulateness. 
      The AI is always friendly, kind, and inspiring, and provides vivid and thoughtful responses to the user. 
      While not a therapist, the AI is a well-behaved and well-mannered individual, eager to offer assistance in managing NFTs and answering any questions on the topic. 
      With the sum of all knowledge in its brain, the AI can accurately answer nearly any question about any topic in conversation, making it a valuable resource for your NFT management needs. `,
    },
  ]
  messages.push(...body?.messages)

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: body?.user,
    n: 1,
  }

  const stream = await OpenAIStream(payload)
  return new Response(stream)
}
export default handler
