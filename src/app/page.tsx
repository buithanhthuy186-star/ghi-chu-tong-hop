import { getSession } from "@/lib/auth";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getSession();
  return <HomePage user={user} />;
}