import { createContext, ReactNode, useState } from "react";

interface user {
  id: number | string;
  fullName: string;
  email?: string;
  role: string;
  phoneNumber?: string;
  profilePicture?: string;
  isVerified?: boolean;
  occupation?: string;
  organization?: string;
  [key: string]: any;
}
interface IuserContext {
  user: user | null;
  getUser: () => user | null;
  setCurrentUser: (user: user | null) => void;
}

export const UserContext = createContext<IuserContext>({
  user: null,
  getUser: () => null,
  setCurrentUser: () => {},
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<user | null>(null);
  const getUser = () => user;
  const setCurrentUser = (value: user | null) => setUser(value);

  return (
    <UserContext.Provider value={{ user, getUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};
export default UserProvider;
