import { httpService } from "../http.service";

export function login(password) {
    console.log(password);
    return httpService.post('auth/login', {password})
}