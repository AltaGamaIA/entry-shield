import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/", // Redirect unauthenticated users back to login
  },
});

export const config = {
  // Matches all routes except api routes, the static Next.js paths, 
  // the login page (root), and public images.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|$).*)",
  ],
};
