import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id:          string;
      phone:       string;
      role:        string;
      companyName: string | null;
      industry:    string | null;
      location:    string | null;
    } & DefaultSession['user'];
  }
}
