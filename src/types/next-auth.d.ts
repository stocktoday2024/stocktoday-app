import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    preferredLang?: string;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      preferredLang?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    preferredLang?: string;
  }
}

