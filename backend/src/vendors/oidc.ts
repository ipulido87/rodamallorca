export interface TokenSet {
  access_token: string
}
export interface UserInfo {
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
}
export type CodeChallengeMethod = 'S256'
export interface AuthorizationUrlParams {
  scope: string
  code_challenge: string
  code_challenge_method: CodeChallengeMethod
  state: string
}
export interface CallbackParams {
  code: string
  state: string
}
export interface CallbackChecks {
  code_verifier: string
}
export interface ClientOptions {
  client_id: string
  client_secret: string
  redirect_uris: string[]
  response_types: string[]
}
export interface OIDCClient {
  authorizationUrl(params: AuthorizationUrlParams): string
  callback(
    redirectUri: string,
    params: CallbackParams,
    checks: CallbackChecks
  ): Promise<TokenSet>
  userinfo(accessToken: string): Promise<UserInfo>
}
export interface IssuerInstance {
  Client: new (opts: ClientOptions) => OIDCClient
}
export interface IssuerStatic {
  discover(issuer: string): Promise<IssuerInstance>
}
export interface Generators {
  codeVerifier(): string
  codeChallenge(verifier: string): string
}
export interface OIDCModule {
  Issuer: IssuerStatic
  generators: Generators
}
