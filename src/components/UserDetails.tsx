import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface User {
  id: number;
  name: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
}

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then((res) => res.json())
      .then((data: User) => setUser(data));
  }, [id]);

  if (!user) return <p className="p-6 text-gray-500">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <div className="border border-black p-4 max-w-sm bg-gray-100 rounded">
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <p className="mt-2">
          <span className="font-bold">Phone:</span> {user.phone}
        </p>
        <p>
          <span className="font-bold">Website:</span> {user.website}
        </p>
        <p>
          <span className="font-bold">Address:</span> {user.address.street},{" "}
          {user.address.suite}, {user.address.city} - {user.address.zipcode}
        </p>
      </div>
      <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
        ⬅ Back to list
      </Link>
    </div>
  );
};

export default UserDetails;
