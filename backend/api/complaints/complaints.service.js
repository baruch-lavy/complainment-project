import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const complaintService = {
	remove,
	query,
	getById,
	add,
	update,
}

async function query() {
	try {
		const collection = await dbService.getCollection('complaints')
		let complaintCursor = await collection.find()

		const complaints = await complaintCursor.toArray() 
		return complaints.sort((a,b) => b.createdAt - a.createdAt)
	} catch (err) {
		logger.error('cannot find complaints', err)
		throw err
	}
}

async function getById(complaintId) {
	try {
        const criteria = { _id: ObjectId.createFromHexString(complaintId) }

		const collection = await dbService.getCollection('complaints')
		const complaint = await collection.findOne(criteria)
        
		complaint.createdAt = complaint._id.getTimestamp()
		return complaint
	} catch (err) {
		logger.error(`while finding complaint ${complaintId}`, err)
		throw err
	}
}

async function remove(complaintId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

	try {
        const criteria = { 
            _id: ObjectId.createFromHexString(complaintId), 
        }
        if(!isAdmin) criteria['owner._id'] = ownerId
        
		const collection = await dbService.getCollection('complaints')
		const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) throw('Not your complaint')
		return complaintId
	} catch (err) {
		logger.error(`cannot remove complaint ${complaintId}`, err)
		throw err
	}
}

async function add(complaint) {
	try {
		const collection = await dbService.getCollection('complaints')
		const id = await collection.insertOne({...complaint, createdAt: Date.now() })

		return { ...complaint, _id: id?.insertedId }
	} catch (err) {
		logger.error('cannot insert complaint', err)
		throw err
	}
}

async function update(complaint) {
    const complaintToSave = { vendor: complaint.vendor, speed: complaint.speed }

    try {
        const criteria = { _id: ObjectId.createFromHexString(complaint._id) }

		const collection = await dbService.getCollection('complaints')
		await collection.updateOne(criteria, { $set: complaintToSave })

		return complaint
	} catch (err) {
		logger.error(`cannot update complaint ${complaint._id}`, err)
		throw err
	}
}



function _buildCriteria(filterBy) {
    const criteria = {
        vendor: { $regex: filterBy.txt, $options: 'i' },
        speed: { $gte: filterBy.minSpeed },
    }

    return criteria
}

function _buildSort(filterBy) {
    if(!filterBy.sortField) return {}
    return { [filterBy.sortField]: filterBy.sortDir }
}