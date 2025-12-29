# Welcome to your Convex functions directory!

Write your Convex functions here.
See https://docs.convex.dev/functions for more.

A query function that takes two arguments looks like:

```ts
// convex/myFunctions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query("tablename").collect();

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second);

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents;
  },
});
```

Using this query function in a React component looks like:

```ts
const data = useQuery(api.myFunctions.myQueryFunction, {
  first: 10,
  second: "hello",
});
```

A mutation function looks like:

```ts
// convex/myFunctions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);

    // Optionally, return a value from your mutation.
    return await ctx.db.get("messages", id);
  },
});
```

Using this mutation function in a React component looks like:

```ts
const mutation = useMutation(api.myFunctions.myMutationFunction);
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: "Hello!", second: "me" });
  // OR
  // use the result once the mutation has completed
  mutation({ first: "Hello!", second: "me" }).then((result) =>
    console.log(result),
  );
}
```

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running `npx convex -h` in your project root
directory. To learn more, launch the docs with `npx convex docs`.

---

## Frontend Hooks Guide

This project uses **TanStack Query** with Convex for better loading/error states.

### Which Hook to Use?

| Use Case | Hook | Import From |
|----------|------|-------------|
| Query with loading/error states | `useConvexQuery` | `@/integrations/convex/hooks` |
| Query requiring auth | `useAuthenticatedConvexQuery` | `@/integrations/convex/hooks` |
| Mutation with status | `useConvexMutationQuery` | `@/integrations/convex/hooks` |
| Simple query (no loading state) | `useQuery` | `convex/react` |
| Simple mutation | `useMutation` | `convex/react` |

### Queries with Loading/Error States

```ts
import { useConvexQuery } from "@/integrations/convex/hooks";
import { api } from "@convex/_generated/api";

function MyComponent() {
  const { data, isPending, error, isError } = useConvexQuery(
    api.messages.list,
    { channelId: "123" }
  );

  if (isPending) return <Spinner />;
  if (isError) return <Error message={error.message} />;
  return <MessageList messages={data} />;
}
```

### Authenticated Queries

Use when the query requires a logged-in user. Automatically skips when not authenticated:

```ts
import { useAuthenticatedConvexQuery } from "@/integrations/convex/hooks";

function UserProfile() {
  const { data: user, isPending } = useAuthenticatedConvexQuery(
    api.users.getCurrent,
    {}
  );

  if (isPending) return <Spinner />;
  if (!user) return <SignInPrompt />;
  return <Profile user={user} />;
}
```

### Mutations

```ts
import { useConvexMutationQuery } from "@/integrations/convex/hooks";

function SendButton() {
  const { mutate, isPending, error } = useConvexMutationQuery(api.messages.send);

  return (
    <button 
      onClick={() => mutate({ content: "Hello!" })} 
      disabled={isPending}
    >
      {isPending ? "Sending..." : "Send"}
    </button>
  );
}
```

---

## Backend Auth Functions

For protected backend functions, use the auth wrappers in `convex/lib/customFunctions.ts`:

| Instead of | Use | Effect |
|------------|-----|--------|
| `query` | `authQuery` | Throws if not authenticated |
| `mutation` | `authMutation` | Throws if not authenticated |
| `action` | `authAction` | Throws if not authenticated |

```ts
import { authQuery } from "./lib/customFunctions";

export const getMyData = authQuery({
  args: {},
  handler: async (ctx) => {
    // ctx.auth is guaranteed to exist here
    const userId = ctx.auth.getUserId();
    return await ctx.db.query("userData").filter(...).first();
  },
});
```
