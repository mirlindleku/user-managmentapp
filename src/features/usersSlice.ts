import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type User = {
  id: string;
  name: string;
  email: string;
  company: { name: string };
  phone?: string;
  website?: string;
  address?: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  isActive?: boolean;
  createdAt?: number;
  lastLogin?: number;
};

export type UsersState = {
  users: User[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  totalCount: number;
};

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  lastUpdated: null,
  totalCount: 0,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
      state.totalCount = action.payload.length;
      state.lastUpdated = Date.now();
    },

    addUser(state, action: PayloadAction<User>) {
      const newUser = {
        ...action.payload,
        isActive: true,
        createdAt: Date.now(),
        lastLogin: undefined,
      };
      state.users.unshift(newUser);
      state.totalCount = state.users.length;
    },

    updateUser(state, action: PayloadAction<User>) {
      for (let i = 0; i < state.users.length; i++) {
        if (state.users[i].id === action.payload.id) {
          state.users[i] = action.payload;
          break;
        }
      }
    },

    deleteUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter((user) => user.id !== action.payload);
      state.totalCount = state.users.length;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setLoading,
  setError,
} = usersSlice.actions;

export default usersSlice.reducer;
