import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getComplaints, getComplaintById, addComplaint, updateComplaint, removeComplaint, addComplaintMsg, removeComplaintMsg } from './complaints.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, requireAuth, getComplaints)
router.get('/:id', log, getComplaintById)
router.post('/', log, addComplaint)
router.put('/:id', requireAuth, updateComplaint)
router.delete('/:id', requireAuth, removeComplaint)
// router.delete('/:id', requireAuth, requireAdmin, removeComplaint)

router.post('/:id/msg', requireAuth, addComplaintMsg)
router.delete('/:id/msg/:msgId', requireAuth, removeComplaintMsg)

export const complaintRoutes = router