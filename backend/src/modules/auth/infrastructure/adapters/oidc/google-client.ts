import { Client, Issuer, generators } from 'openid-client'

let client: Client | null = null
const codeVerifierStore = new Map<string, string>()

export async function getGoogleClient(): Promise<Client> {
  if (client) return client
  const google = await Issuer.discover('https://accounts.google.com')
  client = new google.Client({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.Google_CLIENT_SECRET!, // <- ojo al nombre; debe ser GOOGLE_CLIENT_SECRET
    redirect_uris: [process.env.GOOGLE_REDIRECT_URI!],
    response_types: ['code'],
  })
  return client
}

export async function buildAuthUrl(state: string): Promise<string> {
  const c = await getGoogleClient()
  const codeVerifier = generators.codeVerifier()
  const codeChallenge = generators.codeChallenge(codeVerifier)
  codeVerifierStore.set(state, codeVerifier)

  const url = c.authorizationUrl({
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
  })

  const u = new URL(url)
  console.log('AUTH URL =>', url)
  console.log('redirect_uri enviado =>', u.searchParams.get('redirect_uri'))

  return url
}

export async function handleCallback(state: string, code: string) {
  const c = await getGoogleClient()
  const codeVerifier = codeVerifierStore.get(state)
  if (!codeVerifier) throw new Error('Invalid state')

  const tokenSet = await c.callback(
    process.env.GOOGLE_REDIRECT_URI!,
    { code, state }, // 👈 params con state
    { state, code_verifier: codeVerifier } // 👈 checks incluye state + PKCE
  )

  codeVerifierStore.delete(state)

  const access = tokenSet.access_token
  if (!access) throw new Error('No access token from provider')

  return c.userinfo(access)
}
