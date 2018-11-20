# GraphQL Role-based access control (RBAC) middleware

[![CircleCI](https://circleci.com/gh/Canner/graphql-rbac/tree/master.svg?style=shield)](https://circleci.com/gh/Canner/graphql-rbac/tree/master)
[![npm version](https://badge.fury.io/js/graphql-rbac.svg)](https://badge.fury.io/js/graphql-rbac)


graphql-rbac provides you a simple way to use Role-based access control in GraphQL. This package integrates with [graphql-shield](https://github.com/maticzav/graphql-shield) which helps you create a permission layer for your application. Using a schema with array of role, graphql-rbac can help you generate rule functions in graphql-shield. So you can easily use RBAC in your application by providing a schema.

## Installation

```bash
yarn add graphql-shield
```

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
