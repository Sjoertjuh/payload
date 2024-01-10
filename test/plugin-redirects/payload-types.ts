/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  collections: {
    users: User
    pages: Page
    redirects: Redirect
    'payload-preferences': PayloadPreference
    'payload-migrations': PayloadMigration
  }
  globals: {}
}
export interface User {
  id: string
  updatedAt: string
  createdAt: string
  email: string
  resetPasswordToken?: string | null
  resetPasswordExpiration?: string | null
  salt?: string | null
  hash?: string | null
  loginAttempts?: number | null
  lockUntil?: string | null
  password: string | null
}
export interface Page {
  id: string
  title: string
  excerpt?: string | null
  updatedAt: string
  createdAt: string
  _status?: ('draft' | 'published') | null
}
export interface Redirect {
  id: string
  from: string
  to?: {
    type?: ('reference' | 'custom') | null
    reference?: {
      relationTo: 'pages'
      value: string | Page
    } | null
    url?: string | null
  }
  updatedAt: string
  createdAt: string
}
export interface PayloadPreference {
  id: string
  user: {
    relationTo: 'users'
    value: string | User
  }
  key?: string | null
  value?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  updatedAt: string
  createdAt: string
}
export interface PayloadMigration {
  id: string
  name?: string | null
  batch?: number | null
  updatedAt: string
  createdAt: string
}

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}
