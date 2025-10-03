import React, { useEffect, useMemo, useState } from "react";
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
import { Dialog, useDialogState } from "@/components/ui/dialog";
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
  const [formError, setFormError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>("");

  useEffect(() => {
    let disposed = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data: User[] = await res.json();
        if (!disposed) dispatch(setUsers(data));
      } catch (err) {
        if (!disposed)
          setLoadError(
            err instanceof Error ? err.message : "Failed to load users"
          );
      } finally {
        if (!disposed) setIsLoading(false);
      }
    };
    load();
    return () => {
      disposed = true;
    };
  }, [dispatch]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Name and Email required");
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
    setFormError("");
  };

  const handleUpdate = (user: User) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    editDialog.setOpen(true);
  };

  // Dialog state
  const deleteDialog = useDialogState(false);
  const editDialog = useDialogState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const confirmDelete = (id: number) => {
    setPendingDeleteId(id);
    deleteDialog.setOpen(true);
  };

  const performDelete = () => {
    if (pendingDeleteId != null) {
      dispatch(deleteUser(pendingDeleteId));
    }
    deleteDialog.setOpen(false);
    setPendingDeleteId(null);
  };

  const performUpdate = () => {
    if (editUser && editName.trim() && editEmail.trim()) {
      dispatch(updateUser({ ...editUser, name: editName, email: editEmail }));
      editDialog.setOpen(false);
      setEditUser(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const base = users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );

    // Separate newly added users (ID > 1000) from API users
    const newUsers = base.filter((u) => u.id > 1000);
    const apiUsers = base.filter((u) => u.id <= 1000);

    // Sort API users
    const sortedApiUsers = [...apiUsers].sort((a, b) => {
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

    // Return new users first, then sorted API users
    return [...newUsers, ...sortedApiUsers];
  }, [users, searchTerm, sortOption]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">User List</h2>

      {isLoading && <p className="text-sm text-gray-600">Loading users…</p>}
      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

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
          {formError && <p className="text-red-500 mb-2">{formError}</p>}
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
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length ? (
          filteredUsers.map((user: User) => (
            <li key={user.id}>
              <Card className="h-full p-4 bg-gray-50">
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
                    onClick={() => confirmDelete(user.id)}
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
            </li>
          ))
        ) : (
          <p className="text-gray-500">No users found.</p>
        )}
      </ul>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.onOpenChange}
        title="Delete user?"
        description="This action cannot be undone."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => deleteDialog.setOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={performDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to delete this user?
        </p>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={editDialog.onOpenChange}
        title="Update user"
        description="Edit the user's name and email."
        footer={
          <>
            <Button variant="outline" onClick={() => editDialog.setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={performUpdate}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserList;
