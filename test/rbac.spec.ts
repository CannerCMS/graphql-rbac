import * as chai from 'chai';
import { graphql } from 'graphql';
import { applyMiddleware } from 'graphql-middleware'
import { makeExecutableSchema } from 'graphql-tools'
import { RBAC } from '../src/index';

const expect = chai.expect;

describe('GraphQL RBAC Query', function() {
  it('access fieldName by ADMIN', async() => {
    const typeDefs = `
      type Query {
        test: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => 'pass',
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Query: {
        test: ['ADMIN']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test
      }
    `;
    const res = await graphql(schemaWithPermissions, query, {}, { user: { role: 'ADMIN' } });

    expect(res.data).to.be.eql({
      test: 'pass'
    });
  });

  it('access fieldName by multiple role', async() => {
    const typeDefs = `
      type Query {
        test: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => 'pass',
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Query: {
        test: ['ADMIN', 'DEVELOPER']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test
      }
    `;
    const adminRes = await graphql(schemaWithPermissions, query, {}, { user: { role: 'ADMIN' } });
    const developerRes = await graphql(schemaWithPermissions, query, {}, { user: { role: 'DEVELOPER' } });

    expect(adminRes.data).to.be.eql({
      test: 'pass'
    });
    expect(developerRes.data).to.be.eql({
      test: 'pass'
    });
  });

  it('deny fieldName for DEVELOPER', async() => {
    const typeDefs = `
      type Query {
        test: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => 'deny',
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Query: {
        test: ['ADMIN']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test
      }
    `;
    const res = await graphql(schemaWithPermissions, query, {}, { user: { role: 'DEVELOPER' } });

    expect(res.data).to.be.null;
    expect(res.errors).to.not.be.null;
  });
});

describe('GraphQL RBAC Mutation', function() {
  it('access fieldName by ADMIN', async() => {
    const typeDefs = `
      type Query {
        test: String!
      }

      type Mutation {
        test: String!
      }
    `;
    const resolvers = {
      Mutation: {
        test: () => 'pass',
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Mutation: {
        test: ['ADMIN']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const mutation = `
      mutation {
        test
      }
    `;
    const res = await graphql(schemaWithPermissions, mutation, {}, { user: { role: 'ADMIN' } });

    expect(res.data).to.be.eql({
      test: 'pass'
    });
  });

  it('access fieldName by multiple role', async() => {
    const typeDefs = `
      type Query {
        test: String!
      }
      type Mutation {
        test: String!
      }
    `;
    const resolvers = {
      Mutation: {
        test: () => 'pass',
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Mutation: {
        test: ['ADMIN', 'DEVELOPER']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const mutation = `
      mutation {
        test
      }
    `;
    const adminRes = await graphql(schemaWithPermissions, mutation, {}, { user: { role: 'ADMIN' } });
    const developerRes = await graphql(schemaWithPermissions, mutation, {}, { user: { role: 'DEVELOPER' } });

    expect(adminRes.data).to.be.eql({
      test: 'pass'
    });
    expect(developerRes.data).to.be.eql({
      test: 'pass'
    });
  });

  it('deny fieldName for DEVELOPER', async() => {
    const typeDefs = `
      type Query {
        test: String!
      }

      type Mutation {
        test: String!
      }
    `;
    const resolvers = {
      Mutation: {
        test: () => 'deny',
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Mutation: {
        test: ['ADMIN']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const mutation = `
      mutation {
        test
      }
    `;
    const res = await graphql(schemaWithPermissions, mutation, {}, { user: { role: 'DEVELOPER' } });

    expect(res.data).to.be.null;
    expect(res.errors).to.not.be.null;
  });
})

describe('GraphQL RBAC Return Type', function() {
  it('access by ADMIN', async() => {
    const typeDefs = `
      type Query {
        test: Obj!
      }

      type Obj {
        name: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => ({ name: 'pass' }),
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Obj: ['ADMIN']
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test {
          name
        }
      }
    `;
    const res = await graphql(schemaWithPermissions, query, {}, { user: { role: 'ADMIN' } });

    expect(res.data).to.be.eql({
      test: { name: 'pass' }
    });
  });

  it('access by multiple role', async() => {
    const typeDefs = `
      type Query {
        test: Obj!
      }

      type Obj {
        name: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => ({ name: 'pass' }),
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Obj: ['ADMIN', 'DEVELOPER']
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test {
          name
        }
      }
    `;
    const adminRes = await graphql(schemaWithPermissions, query, {}, { user: { role: 'ADMIN' } });
    const developerRes = await graphql(schemaWithPermissions, query, {}, { user: { role: 'DEVELOPER' } });

    expect(adminRes.data).to.be.eql({
      test: { name: 'pass' }
    });
    expect(developerRes.data).to.be.eql({
      test: { name: 'pass' }
    });
  });

  it('deny for DEVELOPER', async() => {
    const typeDefs = `
      type Query {
        test: Obj!
      }

      type Obj {
        name: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => ({ name: 'deny' }),
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Obj: ['ADMIN']
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test {
          name
        }
      }
    `;
    const res = await graphql(schemaWithPermissions, query, {}, { user: { role: 'DEVELOPER' } });

    expect(res.data).to.be.null;
    expect(res.errors).to.not.be.null;
  });
});

describe('GraphQL RBAC Return Type column', function() {
  it('access by ADMIN', async() => {
    const typeDefs = `
      type Query {
        test: Obj!
      }

      type Obj {
        name: String!
        secret: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => ({ name: 'pass', secret: 'pass' }),
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Obj: {
        secret: ['ADMIN']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test {
          name
          secret
        }
      }
    `;
    const res = await graphql(schemaWithPermissions, query, {}, { user: { role: 'ADMIN' } });

    expect(res.data).to.be.eql({
      test: { name: 'pass', secret: 'pass' }
    });
  });

  it('access by multiple role', async() => {
    const typeDefs = `
      type Query {
        test: Obj!
      }

      type Obj {
        name: String!
        secret: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => ({ name: 'pass', secret: 'pass' }),
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Obj: {
        secret: ['ADMIN', 'DEVELOPER']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test {
          name
          secret
        }
      }
    `;
    const adminRes = await graphql(schemaWithPermissions, query, {}, { user: { role: 'ADMIN' } });
    const developerRes = await graphql(schemaWithPermissions, query, {}, { user: { role: 'DEVELOPER' } });

    expect(adminRes.data).to.be.eql({
      test: { name: 'pass', secret: 'pass' }
    });
    expect(developerRes.data).to.be.eql({
      test: { name: 'pass', secret: 'pass' }
    });
  });

  it('deny for DEVELOPER', async() => {
    const typeDefs = `
      type Query {
        test: Obj!
      }

      type Obj {
        name: String!
        secret: String!
      }
    `;
    const resolvers = {
      Query: {
        test: () => ({ name: 'pass', secret: 'deny' }),
      },
    };
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const roles = ['ADMIN', 'DEVELOPER'];
    const roleSchema = {
      Obj: {
        secret: ['ADMIN']
      }
    };
    const getUser = () => ({ role: 'ADMIN' });

    const rbac = new RBAC({roles, schema: roleSchema, getUser});

    const schemaWithPermissions = applyMiddleware(schema, rbac.middleware());
    // Execution
    const query = `
      query {
        test {
          name
          secret
        }
      }
    `;
    const res = await graphql(schemaWithPermissions, query, {}, { user: { role: 'DEVELOPER' } });

    expect(res.data).to.be.null;
    expect(res.errors).to.not.be.null;
  });
});
