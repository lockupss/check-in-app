import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getPrisma } from '@/lib/prisma'
import { authConfig } from '@/auth.config'

// Minimal credentials provider that checks the database when available,
// otherwise falls back to a demo admin account.
const providers = [
	CredentialsProvider({
		name: 'Credentials',
		credentials: {
			email: { label: 'Email', type: 'email' },
			password: { label: 'Password', type: 'password' },
		},
		async authorize(credentials) {
			if (!credentials) return null

			const prisma = getPrisma()
			try {
				if (prisma) {
					const user = await prisma.user.findUnique({ where: { email: credentials.email } })
					if (user && credentials.password === user.password) {
						// Remove password before returning
						const { password, ...safeUser } = user
						return safeUser
					}
				}
			} catch (err) {
				console.warn('Prisma lookup failed, falling back to demo user', err)
			}

			// Fallback demo user for local testing
			const demoEmail = 'admin@example.com'
			const demoPassword = 'password123'
			if (credentials.email === demoEmail && credentials.password === demoPassword) {
				return { id: 1, name: 'Admin', email: demoEmail, role: 'ADMIN' }
			}

			return null
		},
	}),
]

// Export NextAuth handler compatible with the App Router
const handler = NextAuth({
	...authConfig,
	providers,
} as any)

export { handler as GET, handler as POST }