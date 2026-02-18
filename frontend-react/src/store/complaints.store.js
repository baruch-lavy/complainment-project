import { complaintService } from "../services/complaint/complaint.service.remote"

function createStore(initialState) {
    let currentState = initialState
    const listeners = new Set()

    return {
        getState: () => currentState,
        setState: (newState) => {
            currentState = newState
            listeners.forEach(listener => listener(currentState))
        },
        subscribe: (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        addComplaint: (complaint) => {
            return complaintService.save(complaint)
        }
    }
}

export const store = createStore({
    complaints: [],
    isUserLogin: false,
    complaint:{
        category: null,
        txt: null
    }
})