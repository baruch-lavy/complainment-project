import { useState } from "react"
import { login } from "../services/admin/admin.service"
import { useNavigate } from "react-router"
import { store } from "../store/complaints.store"


export function AdminLogin() {
    const [ password, setPassword ] = useState('')
    const navigate = useNavigate()

    function handleChange(ev) {
        setPassword(ev.target.value)
    }

    async function hundleAdminLogin() {
        const currentstate = store.getState()
        try {
            const res = await login(password)  
            if (res === 'signin successfully'){
                store.setState({...currentstate, isUserLogin: true })
                navigate('/AdminComplaints')
            }
        } catch (error) {
            console.log(error);
            navigate('/ErrorPage')
        }
    }

    const handleSubmit = (ev) => ev.preventDefault() 



    return (
        <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="password">Enter Password</label>
            <input 
            id="password" 
            type="password" 
            value={password}
            placeholder="Enter Password"
            onChange={handleChange}
            />
            <button onClick={hundleAdminLogin} type="submit">Submit</button>
        </form>
    )
}