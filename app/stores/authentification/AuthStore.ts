import { defineStore } from "pinia";
import type { User } from "@/types/User";

export const AuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null as null | User,
  }),
  getters: {
    isAuth: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
  },
  actions: {
    login(user: User) {
      this.isAuthenticated = true;
      this.user = user;
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null;
    },
  },
});
