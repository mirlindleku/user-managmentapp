import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import type { User } from "../features/usersSlice";
import {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../features/usersSlice";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

const UserList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.users.list);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data: User[]) => dispatch(setUsers(data)));
  }, [dispatch]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and Email required");
      return;
    }
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      company: { name: "Local Company" },
    };
    dispatch(addUser(newUser));
    setName("");
    setEmail("");
    setError("");
  };

  const handleDelete = (id: number) => {
    dispatch(deleteUser(id));
  };

  const handleUpdate = (user: User) => {
    const updatedName = prompt("Enter new name", user.name);
    const updatedEmail = prompt("Enter new email", user.email);
    if (!updatedName || !updatedEmail) return;
    dispatch(updateUser({ ...user, name: updatedName, email: updatedEmail }));
  };

  let filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filteredUsers = [...filteredUsers].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "email-asc":
        return a.email.localeCompare(b.email);
      case "email-desc":
        return b.email.localeCompare(a.email);
      default:
        return 0;
    }
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">User List</h2>

      <div className="flex flex-col md:flex-row items-center gap-4 max-w-2xl">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        <Select
          onValueChange={(value: string) => setSortOption(value)}
          value={sortOption}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A → Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z → A)</SelectItem>
            <SelectItem value="email-asc">Email (A → Z)</SelectItem>
            <SelectItem value="email-desc">Email (Z → A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add User Form */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <form onSubmit={handleAddUser} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Email *</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
              Add User
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User List */}
      <ul className="space-y-4">
        {filteredUsers.length ? (
          filteredUsers.map((user: User) => (
            <Card key={user.id} className="p-4 bg-gray-50">
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm">{user.company.name}</p>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdate(user)}
                >
                  Update
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
                <Link
                  to={`/users/${user.id}`}
                  className="ml-auto bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Details
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No users found.</p>
        )}
      </ul>
    </div>
  );
};

export default UserList;
