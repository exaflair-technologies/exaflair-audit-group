import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin · Users</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Email</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {profiles?.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.email}</td>
              <td>{p.full_name}</td>
              <td>{p.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
