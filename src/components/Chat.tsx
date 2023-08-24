import { useEffect, useState } from 'react'
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from './ChatLine'
import { useCookies } from 'react-cookie'
import { useAutoResizeTextarea } from '@utils/useAutoResizeTextarea';
import { withUAL } from 'ual-reactjs-renderer'

const COOKIE_NAME = 'ABSTRA-ai-chat'

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: 'assistant',
    content: 'Hi! I am a friendly AI assistant for your NFTs. Ask me anything!',
  },
]

const InputMessage = ({ input, setInput, sendMessage, walletConnected, authorized }: any) => {
  const textareaRef = useAutoResizeTextarea(2, 20); // Adjust minRows and maxRows as needed

  if (!walletConnected || !authorized) {
    return null;
  }

  return (
    <div className="mt-6 flex clear-both">
      <textarea
        ref={textareaRef}
        aria-label="chat input"
        required
        className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm text-zinc-900 resize-none"
        value={input}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
            setInput('');
          }
        }}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <button
        type="submit"
        className="btn w-fit whitespace-nowrap ml-6"
        onClick={() => {
          sendMessage(input);
          setInput('');
        }}
      >
        Say
      </button>
    </div>
  );
};


export const Chat = withUAL(function ({ ual, walletConnected, authorized }) {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])
  const accountName = ual?.activeUser?.accountName

  useEffect(() => {
    if (walletConnected && authorized) {
      if (!cookie[COOKIE_NAME]) {
        const randomId = Math.random().toString(36).substring(7);
        setCookie(COOKIE_NAME, randomId);
      }
    }
  }, [cookie, setCookie, walletConnected, authorized]);

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true)
    const newMessages = [
      ...messages,
      { role: 'user', content: message } as ChatGPTMessage,
    ]
    setMessages(newMessages)
    const last10messages = newMessages.slice(-10) // remember last 10 messages

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: last10messages,
        user: cookie[COOKIE_NAME],
      }),
    })

    console.log('Edge function returned.')

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    // This data is a ReadableStream
    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    let lastMessage = ''

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)

      lastMessage = lastMessage + chunkValue

      setMessages([
        ...newMessages,
        { role: 'assistant', content: lastMessage } as ChatGPTMessage,
      ])

      setLoading(false)
    }
  }


  return (
    <div className="rounded-2xl border-zinc-100  lg:border lg:p-6">
      {messages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} accountName={accountName} />
      ))}

      {loading && <LoadingChatLine />}

      {messages.length < 2 && (
        <span className="mx-auto flex flex-grow text-gray-600 clear-both">
          {!walletConnected ? (
            "Connect your wallet first"
          ) : !authorized ? (
            "You need to transfer the required amount to unlock the AI Chatbot feature"
          ) : (
            "Type a message to start the conversation"
          )}
        </span>
      )}

      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        walletConnected={walletConnected}
        authorized={authorized}
      />
    </div>
  )

})