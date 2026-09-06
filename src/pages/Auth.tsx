import { SignIn } from '@clerk/clerk-react';

export default function Auth() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10">
      <SignIn routing="path" path="/auth" signUpUrl="/auth" />
    </main>
  );
}
