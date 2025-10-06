import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useEffect, useState } from "react";

type IAuthContext={
  userToken:string|null;
  login:(token:string)=>void;
  logout:()=>void;
}

export const AuthContext=createContext<IAuthContext>({
  userToken:null,
  login:()=>{},
  logout:()=>{}
})

export const AuthProvider= ({children}:{children:ReactNode})=>{
const [userToken,setUserToken]=useState<string|null>(null);
useEffect(() => {
  const loadToken= async()=>{
    const token= await AsyncStorage.getItem('userToken');
    if(token) setUserToken(token)
  }
loadToken();
}, [])
const login= async(token:string)=>{
  await AsyncStorage.setItem('userToken',token);
  setUserToken(token)
}
const logout =async()=>{
  await AsyncStorage.removeItem('userToken');
  setUserToken(null);
}
return (
  <AuthContext.Provider value={{userToken,login,logout}}>
    {children}
  </AuthContext.Provider>
)
}