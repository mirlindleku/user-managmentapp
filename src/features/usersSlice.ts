import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  email: string;
  company: { name: string };
}

interface UsersState {
  list: User[];
}

const initialState: UsersState = {
  list: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.list = action.payload;
    },
    addUser(state, action: PayloadAction<User>) {
      state.list.unshift(action.payload); // add to top
    },
    updateUser(state, action: PayloadAction<User>) {
      state.list = state.list.map((user) =>
        user.id === action.payload.id ? action.payload : user
      );
    },
    deleteUser(state, action: PayloadAction<number>) {
      state.list = state.list.filter((user) => user.id !== action.payload);
    },
  },
});

export const { setUsers, addUser, updateUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
export type { User };
