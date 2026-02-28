import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: "USER" | "ADMIN";
  }

  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
  }
}
