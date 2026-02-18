import { httpService } from '../http.service'

export const complaintService = {
    query,
    getById,
    save,
    remove,
    addComplaintMsg
}

async function query(filterBy = { txt: '', category: '' }) {
    return httpService.get(`complaints`, filterBy)
}

function getById(complaintId) {
    return httpService.get(`complaints/${complaintId}`)
}

async function remove(complaintId) {
    return httpService.delete(`complaints/${complaintId}`)
}
async function save(complaint) {
    let savedComplaint
    if (complaint._id) {
        savedComplaint = await httpService.put(`complaints/${complaint._id}`, complaint)
    } else {
        savedComplaint = await httpService.post('complaints', complaint)
    }
    return savedComplaint
}

async function addComplaintMsg(complaintId, txt) {
    const savedMsg = await httpService.post(`complaint/${complaintId}/msg`, {txt})
    return savedMsg
}