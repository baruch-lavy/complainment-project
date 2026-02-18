
import { Outlet, Navigate } from "react-router";
import { useSyncExternalStore } from "react";
import { store } from "../store/complaints.store";


export function ProtectedRoute() {
    const { isUserLogin } = useSyncExternalStore(store.subscribe, store.getState)
    console.log(isUserLogin);
    return isUserLogin ? < Outlet /> : <Navigate to='/AdminLogin' />  
}