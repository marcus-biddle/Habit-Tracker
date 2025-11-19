
import React from 'react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const initialUsers = [
  {
    UserId: "USR001",
    username: "sarah_chen",
    LastLoggedIn: "2024-11-11 08:30:00"
  },
  {
    UserId: "USR002",
    username: "m_rodriguez",
    LastLoggedIn: "2024-11-10 14:22:00"
  },
  {
    UserId: "USR003",
    username: "emily_w",
    LastLoggedIn: "2024-10-12 09:15:00"
  },
  {
    UserId: "USR004",
    username: "james_kim",
    LastLoggedIn: "2024-11-11 03:45:00"
  },
  {
    UserId: "USR005",
    username: "aisha_p",
    LastLoggedIn: "2024-11-10 16:30:00"
  },
  {
    UserId: "USR006",
    username: "d_johnson",
    LastLoggedIn: "2024-11-11 07:55:00"
  },
  {
    UserId: "USR007",
    username: "maria_garcia",
    LastLoggedIn: "2024-10-27 11:20:00"
  },
  {
    UserId: "USR008",
    username: "alex_t",
    LastLoggedIn: "2024-11-08 19:45:00"
  }
];

function BasicTable() {
  return (
    <Table className=''>
      <TableCaption>Complete list of website users and their last login information</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">User ID</TableHead>
          <TableHead colSpan={4}>Email</TableHead>
          <TableHead>Last Logged In</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {initialUsers.map((user) => (
          <TableRow key={user.UserId} onClick={() => console.log(user.UserId)}>
            <TableCell className="font-medium">{user.UserId}</TableCell>
            <TableCell colSpan={4}>{user.username}</TableCell>
            <TableCell>{user.LastLoggedIn}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total: 24 users</TableCell>
          <TableCell>8 active this week</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}


const explore = () => {
  return (
    <div className='h-screen flex justify-center'>
        <BasicTable />
    </div>
  )
}

export default explore