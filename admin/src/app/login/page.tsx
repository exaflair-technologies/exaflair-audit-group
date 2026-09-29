import { login } from "./actions";

const messages: Record<string, string> = {
  invalid: "Invalid email or password.",
  forbidden: "This account does not have admin access.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="flex w-full max-w-sm flex-col gap-3">
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        {error && <p className="text-sm text-red-600">{messages[error] ?? "Sign in failed."}</p>}
        <input name="email" type="email" placeholder="Email" required className="rounded border p-2" />
        <input name="password" type="password" placeholder="Password" required className="rounded border p-2" />
        <button type="submit" className="rounded bg-black p-2 text-white">
          Sign in
        </button>
      </form>
    </main>
  );
}
