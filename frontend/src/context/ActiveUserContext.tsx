import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleSheetApi } from "../api/GoogleSheetsAPI";
import { getFormattedDate, isSameDate, type FormattedDate } from "../utils/time";

export type UserListData = {
    success: boolean;
    users: string[];
    totalUsers: number;
}

// Define the context value type
interface ActiveUserContextType {
  user: string | null;
  userList: string[] | null;
  totalUsers: number | null;
  userActionList: any | null;
  actionsByDate: any | null;
  selectedDate: any | null;
  date: any | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
  setUserList: React.Dispatch<React.SetStateAction<string[] | null>>;
}

// Create context with default undefined to enforce usage within provider
const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined);

export const ActiveUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [userList, setUserList] = useState<string[] | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [userActionList, setUserActionList] = useState(null);
  const [actionsByDate, retrieveActionsByDate] = useState(null); // need to set type
  const [date, selectedDate] = useState<FormattedDate>(getFormattedDate());

  const fetchUserActions = async () => {
    if (!user) return;

    const data = await GoogleSheetApi.getUserStats(user);
    setUserActionList(data.data ?? null);

    const dataFromDate = data.data.filter((entry: any) => isSameDate(entry.date, date.text))
    retrieveActionsByDate(dataFromDate ?? null)
  }

  useEffect(() => {
    fetchUserActions();
  }, [date, user])

  // Fetch user list on mount
  useEffect(() => {
    async function fetchUserList() {
      const data: UserListData = await GoogleSheetApi.getUserList('Users');
      if (!user) {
        setUser(data.users[0])
      }
      setUserList(data.users);
      setTotalUsers(data.totalUsers);
    }
    fetchUserList();
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("activeUser");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("activeUser", JSON.stringify(user));
    else localStorage.removeItem("activeUser");
  }, [user]);

  const value = React.useMemo(() => ({
    user,
    totalUsers,
    userActionList,
    actionsByDate,
    selectedDate,
    date,
    setUser,
    userList,
    setUserList,
  }), [user, userList, totalUsers, date, userActionList]);

  return (
    <ActiveUserContext.Provider value={value}>
      {children}
    </ActiveUserContext.Provider>
  );
};

// Custom hook to use context easily
export function useActiveUser() {
  const context = useContext(ActiveUserContext);
  if (context === undefined) {
    throw new Error("useActiveUser must be used within an ActiveUserProvider");
  }
  return context;
}