import { UserRepository } from '../domain/repositories/user-repository'

// login-with-google-verify.ts - NUEVO ARCHIVO
export async function verifyGoogleUserUseCase(
  email: string,
  deps: { repo: UserRepository }
) {
  const { repo } = deps

  console.log('🔍 [VERIFY_USE_CASE] Verificando usuario:', email)

  // Solo verificar si existe, NO crear
  const existingUser = await repo.findByEmail(email)

  if (!existingUser) {
    throw new Error('USER_NOT_REGISTERED')
  }

  // Verificar que fue registrado con Google
  if (!existingUser.googleId) {
    throw new Error(
      'User exists but was not registered with Google. Please use email login.'
    )
  }

  console.log('✅ [VERIFY_USE_CASE] Usuario verificado:', {
    id: existingUser.id,
    email: existingUser.email,
    role: existingUser.role,
  })

  return { user: existingUser }
}
