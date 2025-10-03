import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { User } from "@/features/usersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const allUsers = useSelector((state: RootState) => state.users.users);
  type ApiUser = {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    company?: { name?: string };
    address?: { street: string; suite: string; city: string; zipcode: string };
  };
  const [fetchedUser, setFetchedUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const storeUser: User | undefined = useMemo(() => {
    if (!id) return undefined;
    return allUsers.find((u) => String(u.id) === String(id));
  }, [allUsers, id]);

  useEffect(() => {
    if (!storeUser && id && /^\d+$/.test(id)) {
      setIsLoading(true);
      fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
        .then((res) =>
          res.ok
            ? res.json()
            : Promise.reject(new Error(`Failed: ${res.status}`))
        )
        .then((data: ApiUser) => setFetchedUser(data))
        .catch(() => setFetchedUser(null))
        .finally(() => setIsLoading(false));
    }
  }, [storeUser, id]);

  const userToShow: (User & ApiUser) | null =
    (storeUser as unknown as User & ApiUser) ?? fetchedUser;

  if (isLoading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (!userToShow) return <p className="p-6 text-gray-500">User not found.</p>;

  const showPhone = Boolean(userToShow.phone);
  const showWebsite = Boolean(userToShow.website);
  const address = userToShow.address;

  return (
    <div className="p-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold">{userToShow.name}</h3>
          {userToShow.email && (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-semibold">Email:</span> {userToShow.email}
            </p>
          )}
          {userToShow.company?.name && (
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Company:</span>{" "}
              {userToShow.company.name}
            </p>
          )}
          {showPhone && (
            <p className="mt-2">
              <span className="font-semibold">Phone:</span> {userToShow.phone}
            </p>
          )}
          {showWebsite && (
            <p>
              <span className="font-semibold">Website:</span>{" "}
              {userToShow.website}
            </p>
          )}
          {address && (
            <p>
              <span className="font-semibold">Address:</span> {address.street},{" "}
              {address.suite}, {address.city} - {address.zipcode}
            </p>
          )}
        </CardContent>
      </Card>
      <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
        ⬅ Back to list
      </Link>
    </div>
  );
};

export default UserDetails;
