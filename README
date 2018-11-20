# GraphQL RBAC

## How to use

```js
import { RBAC } from 'graphql-rbac'

const roles = ['ADMIN', 'DEVELOPER']

const schema = {
  Query: {
    user: ["ADMIN", "DEVELOPER"]
  },
  Mutation: {
    createUser: ["ADMIN", "DEVELOPER"],
    updateUser: ["ADMIN", "DEVELOPER"],
    deleteUser: ["ADMIN"]
  },
  User: {
    secretKey: ["ADMIN"]
  }
}

const getUser = async (ctx) => {
  // get user
  // ...
  return {
    role: user.role // must require
  }
}

const rbac = new RBAC({roles, schema, getUser})

const server = new GraphQLServer({
  // typeDefs,
  // resolvers,
  middlewares: [rbac.middleware()],
  context: req => ({
    ...rbac.context(req)
  }),
})
```

## Run test

```
npm run test
```
