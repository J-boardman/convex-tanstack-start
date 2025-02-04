import { convexQuery } from '@convex-dev/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import Chat from '~/components/Chat'
import CodeSample from '../../components/CodeSample'

export const Route = createFileRoute('/loaders/ensure')({
  component: Messages,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      cacheBust: typeof search.cacheBust === 'string' ? search.cacheBust : '',
    }
  },
  loaderDeps: ({ search: { cacheBust } }) => ({ cacheBust }),
  loader: async ({ deps: { cacheBust }, context }) => {
    await context.queryClient.ensureQueryData({
      ...convexQuery(api.messages.listMessages, { channel: 'sf', cacheBust }),
      gcTime: 10000,
    })
  },
})

function Messages() {
  const { cacheBust } = Route.useSearch()
  return (
    <div>
      <Chat
        channel="sf"
        cacheBust={cacheBust}
        gcTime={2000}
        useSuspense={false}
      />
      <div className="mt-4">
        <CodeSample
          code={`export const Route = createFileRoute('/loaders/ensure')({
  loader: async (opts) => {
    await opts.context.queryClient.ensureQueryData(
      convexQuery(api.messages.list, {}),
    );
  },
  component: () => {
    const { data } = useSuspenseQuery(
      convexQuery(api.messages.list, {})
    );
  },
})`}
        />
      </div>
    </div>
  )
}
