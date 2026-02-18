import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {
	const { password } = req.body
	try {
		const isValid = await authService.login(password)
		if (!isValid) return res.status(401).send('not autorize')
		const loginToken = authService.getLoginToken(password)
        
		logger.info('User login: ', password)
        
		res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
		res.json('signin successfully')
	} catch (err) {
		logger.error('Failed to Login ' + err)
		res.status(401).send({ err: 'Failed to Login' })
	}
}
