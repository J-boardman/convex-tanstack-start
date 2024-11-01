import { useState } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { PaperPlaneIcon } from '@radix-ui/react-icons'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { Skeleton } from './ui/skeleton'
import CodeSample from '~/components/CodeSample'

const Message = ({
  user,
  body,
  _creationTime,
}: {
  user: string
  body: string
  _creationTime: number
}) => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-slate-600 text-slate-300 text-primary-foreground flex items-center justify-center font-black">
      {user.toLowerCase().startsWith('user ') ? user[5] : user[0].toUpperCase()}
    </div>
    <div className="flex-1">
      <div className="flex text-sm items-baseline">
        <span className="mr-2 font-semibold text-white">{user}</span>
        <span className="text-slate-400">
          {new Date(_creationTime).toLocaleDateString()}
        </span>
      </div>
      <p className="text-base m-0">{body}</p>
    </div>
  </div>
)

const MessageSkeleton = () => (
  <div className="flex items-start space-x-2 mb-4">
    <Skeleton className="w-8 h-8 rounded-full" />
    <div className="flex-1">
      <div className="flex items-baseline">
        <Skeleton className="h-4 w-20 mr-2" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-4 w-full mt-1" />
    </div>
  </div>
)

export default function Component({
  useSuspense,
  codeToShow,
  channel = 'chatty',
  gcTime = 10000,
  cacheBust,
}: {
  useSuspense: boolean
  codeToShow?: string
  channel?: string
  gcTime?: number
  cacheBust?: any
}) {
  const useWhicheverQuery: typeof useQuery = useSuspense
    ? (useSuspenseQuery as typeof useQuery)
    : useQuery

  const { data, isPending, error } = useWhicheverQuery({
    ...convexQuery(api.messages.listMessages, {
      channel,
      ...(cacheBust ? { cacheBust } : {}),
    }),
    gcTime,
  })

  const [name] = useState(() => 'User ' + Math.floor(Math.random() * 10000))
  const [newMessage, setNewMessage] = useState('')
  const sendMessage = useConvexMutation(api.messages.sendMessage)

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage({ user: name, body: newMessage, channel })
      setNewMessage('')
    }
  }

  const code = codeToShow && <CodeSample code={codeToShow} />

  const input = (
    <div className="flex w-full items-center space-x-2 pt-6">
      <Input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
      />
      <Button size="icon" onClick={handleSendMessage}>
        <PaperPlaneIcon className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <>
      <Card className="w-full">
        <CardHeader className="h-[250px] overflow-y-auto">
          {isPending || error ? (
            <>
              <MessageSkeleton />
              <MessageSkeleton />
              <MessageSkeleton />
            </>
          ) : (
            data.map((msg) => (
              <Message
                key={msg._id}
                user={msg.user}
                body={msg.body}
                _creationTime={msg._creationTime}
              />
            ))
          )}
        </CardHeader>
        {code ? <CardContent>{input}</CardContent> : null}
        <CardFooter>{code ? code : input}</CardFooter>
      </Card>
    </>
  )
}
