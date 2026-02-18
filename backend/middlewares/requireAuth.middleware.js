import { asyncLocalStorage } from '../services/als.service.js'

export function requireAuth(req, res, next) {
	const { loggedinUser } = asyncLocalStorage.getStore()
	if (!loggedinUser) return res.status(401).send('Not Authenticated')
	next()
}
