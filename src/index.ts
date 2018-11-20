import { reduce } from 'lodash';
import { IMiddlewareGenerator } from 'graphql-middleware';
import { IRule, or, rule, shield } from 'graphql-shield';

declare class IRBAC {
  constructor({
    roles,
    schema,
    getUser
  }: {
    roles: string[],
    schema: ISchema,
    getUser: IGetUserFunc
  })

  middleware(): IMiddlewareGenerator<TSource, TContext, TArgs>;
  context(): IContext;
}

type TSource = any;
type TContext = any;
type TArgs = any;

interface ISchema {
  [key: string]: string[] | Record<string, string[]>;
}

interface IContext {
  user: IGetUserFunc;
}

type IGetUserFunc = (ctx) => IUser | Promise<IUser>;

interface IUser {
  role: string;
}

export class RBAC implements IRBAC {
  private roles: string[];
  private schema: ISchema;
  private getUser: IGetUserFunc;

  constructor({
    roles,
    schema,
    getUser
  }: {
    roles: string[],
    schema: ISchema,
    getUser: IGetUserFunc
  }) {
    this.roles = roles;
    this.schema = schema;
    this.getUser = getUser;
  }

  middleware(): IMiddlewareGenerator<TSource, TContext, TArgs> {
    // roleRuleMap
    // {
    //   [role: string]: IRule
    // }
    const roleRuleMap: Record<string, IRule> = reduce(
      this.roles,
      (result, role) => {
        result[role] = rule()(async (parent, args, ctx, info) => {
          return ctx.user.role === role;
        })
        return result;
      },
      {}
    );

    // shieldPermissions
    // {
    //   Query: Record<string, LogicRule>,
    //   Mutation: Record<string, LogicRule>,
    //   [key: string]: LogicRule | Record<string, LogicRule>,
    // }
    const shieldPermissions = {};

    for (const queryType of Object.keys(this.schema)) {
      if (Array.isArray(this.schema[queryType])) {
        const ruleFuncs: IRule[] = (this.schema[queryType] as string[])
          .map((role) => roleRuleMap[role]);
        shieldPermissions[queryType] = or(...ruleFuncs);
      } else {
        shieldPermissions[queryType] = {};
        for (const fieldName of Object.keys(this.schema[queryType])) {
          const ruleFuncs: IRule[] = this.schema[queryType][fieldName]
            .map((role) => roleRuleMap[role]);
          shieldPermissions[queryType][fieldName] = or(...ruleFuncs);
        }
      }
    }

    return shield(shieldPermissions);
  }

  context(): IContext {
    return {
      user: this.getUser
    };
  }
}