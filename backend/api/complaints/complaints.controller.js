import { logger } from '../../services/logger.service.js'
import { complaintService } from './complaints.service.js'

export async function getComplaints(req, res) {
	try {
		const filterBy = {
			txt: req.query.txt || '',
			minSpeed: +req.query.minSpeed || 0,
            sortField: req.query.sortField || '',
            sortDir: req.query.sortDir || 1,
			pageIdx: req.query.pageIdx,
		}
		const complaints = await complaintService.query(filterBy)
		res.json(complaints)
	} catch (err) {
		logger.error('Failed to get complaints', err)
		res.status(400).send({ err: 'Failed to get complaints' })
	}
}

export async function getComplaintById(req, res) {
	try {
		const complaintId = req.params.id
		const complaint = await complaintService.getById(complaintId)
		res.json(complaint)
	} catch (err) {
		logger.error('Failed to get complaint', err)
		res.status(400).send({ err: 'Failed to get complaint' })
	}
}

export async function addComplaint(req, res) {
	const { category, txt } = req.body
	const complaint = {
		category,
		txt,
	} 

	try {
		const addedComplaint = await complaintService.add(complaint)
		res.json(addedComplaint)
	} catch (err) {
		logger.error('Failed to add complaint', err)
		res.status(400).send({ err: 'Failed to add complaint' })
	}
}

export async function updateComplaint(req, res) {
	const { loggedinUser, body: complaint } = req
    const { _id: userId, isAdmin } = loggedinUser

    if(!isAdmin && complaint.owner._id !== userId) {
        res.status(403).send('Not your complaint...')
        return
    }

	try {
		const updatedComplaint = await complaintService.update(complaint)
		res.json(updatedComplaint)
	} catch (err) {
		logger.error('Failed to update complaint', err)
		res.status(400).send({ err: 'Failed to update complaint' })
	}
}

export async function removeComplaint(req, res) {
	try {
		const complaintId = req.params.id
		const removedId = await complaintService.remove(complaintId)

		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove complaint', err)
		res.status(400).send({ err: 'Failed to remove complaint' })
	}
}

export async function addComplaintMsg(req, res) {
	const { loggedinUser } = req

	try {
		const complaintId = req.params.id
		const msg = {
			txt: req.body.txt,
			by: loggedinUser,
		}
		const savedMsg = await complaintService.addComplaintMsg(complaintId, msg)
		res.json(savedMsg)
	} catch (err) {
		logger.error('Failed to update complaint', err)
		res.status(400).send({ err: 'Failed to update complaint' })
	}
}

export async function removeComplaintMsg(req, res) {
	try {
		const complaintId = req.params.id
		const { msgId } = req.params

		const removedId = await complaintService.removeComplaintMsg(complaintId, msgId)
		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove complaint msg', err)
		res.status(400).send({ err: 'Failed to remove complaint msg' })
	}
}
