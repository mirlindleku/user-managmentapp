import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import type { User } from "../features/usersSlice";
import {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setLoading,
  setError,
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
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        const users = data.map(
          (user: {
            id: number;
            name: string;
            email: string;
            company?: { name: string };
            phone?: string;
            website?: string;
            address?: {
              street: string;
              suite: string;
              city: string;
              zipcode: string;
            };
          }) => ({
            id: String(user.id),
            name: user.name,
            email: user.email,
            company: { name: user.company?.name || "Unknown" },
            phone: user.phone,
            website: user.website,
            address: user.address
              ? {
                  street: user.address.street,
                  suite: user.address.suite,
                  city: user.address.city,
                  zipcode: user.address.zipcode,
                }
              : undefined,
          })
        );

        dispatch(setUsers(users));
      } catch (err) {
        dispatch(
          setError(err instanceof Error ? err.message : "Something went wrong")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUsers();
  }, [dispatch]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Name and Email required");
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
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

  const deleteDialog = useDialogState(false);
  const editDialog = useDialogState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const confirmDelete = (id: string) => {
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
      const updatedUser: User = {
        ...editUser,
        name: editName.trim(),
        email: editEmail.trim(),
      };
      dispatch(updateUser(updatedUser));
      editDialog.setOpen(false);
      setEditUser(null);
    }
  };

  const displayUsers = (() => {
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );

    const newUsers = filtered.filter((u) => u.createdAt);
    const apiUsers = filtered.filter((u) => !u.createdAt);

    const [field, direction] = sortOption.split("-");
    apiUsers.sort((a, b) => {
      let aVal, bVal;

      if (field === "name") {
        aVal = a.name;
        bVal = b.name;
      } else if (field === "email") {
        aVal = a.email;
        bVal = b.email;
      } else if (field === "company") {
        aVal = a.company?.name || "";
        bVal = b.company?.name || "";
      } else {
        return 0;
      }

      if (direction === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

    return [...newUsers, ...apiUsers];
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-slate-600">Manage your team members efficiently</p>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-slate-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
              <span>Loading users…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
            {error}
          </div>
        )}

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Select
                onValueChange={(value: string) => setSortOption(value)}
                value={sortOption}
              >
                <SelectTrigger className="w-full lg:w-[200px] h-12 border-slate-300">
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
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-800">
              Add New User
            </CardTitle>
            <p className="text-slate-600">Create a new team member</p>
          </CardHeader>
          <CardContent>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700">
                {formError}
              </div>
            )}
            <form
              onSubmit={handleAddUser}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Email *
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                >
                  Add User
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-800">
              Users ({displayUsers.length})
            </h2>
          </div>

          {displayUsers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayUsers.map((user: User) => (
                <Card
                  key={user.id}
                  className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-300 overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                          {user.name}
                        </CardTitle>
                        <p className="text-sm text-slate-600 truncate mt-1">
                          {user.email}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {user.company?.name || "—"}
                          </span>
                        </div>
                      </div>
                      {user.createdAt && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          New
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate(user)}
                        className="flex-1 text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDelete(user.id)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                    <Link
                      to={`/users/${user.id}`}
                      className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      View Details
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="py-12 text-center">
                <div className="text-slate-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  No users found
                </h3>
                <p className="text-slate-500">
                  Try adjusting your search or add a new user above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
