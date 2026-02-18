import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'

import { authRoutes } from './api/auth/auth.routes.js'
import { complaintRoutes } from './api/complaints/complaints.routes.js'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const app = express()
const server = http.createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: [   'http://127.0.0.1:3000',
                    'http://localhost:3000',
                    'http://127.0.0.1:5173',
                    'http://localhost:5173',
                    'http://127.0.0.1:5175',
                    'http://localhost:5175'
                ],
        credentials: true
    }  
    app.use(cors(corsOptions))
}
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)
 

import { logger } from './services/logger.service.js'
const port = process.env.PORT || 3033

server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})