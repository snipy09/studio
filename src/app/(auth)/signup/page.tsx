
// This page is no longer needed as signup functionality has been removed
// in favor of dummy login only for the demo.
// You can delete this file.

import { redirect } from 'next/navigation';

export default function SignupPage() {
  // Redirect to login page or dashboard if signup is disabled/removed
  redirect('/login'); 
  // Or return null or a message:
  // return (
  //   <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
  //     <p>Signup is not available in this demo. Please use the login page for demo access.</p>
  //   </div>
  // );
}
