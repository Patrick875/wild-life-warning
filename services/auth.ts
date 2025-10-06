import { useMutation } from "@tanstack/react-query"
import { api } from "./api"

export const useLogin=()=>{
    return useMutation({
        mutationFn:async(data:{identifier:string,password:string})=>{
            return await api.post('/auth/login',data)
        },
        onSuccess:(res)=>{
            console.log('login-result',res);
            
        },
        onError:(err:any)=>{
            console.log('err',err);
            
        }
    })
}
export const useRegister=()=>{
    return useMutation({
        mutationFn:async(data:any)=>{
            return await api.post('/auth/register',data)
        },
        onSuccess:(res)=>{
            console.log('register-result',res);
            
        },
        onError:(err:any)=>{
            console.log('err',err);
            
        }
    })
}