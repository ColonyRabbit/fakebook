import { icons } from "lucide-react";
import IndexProfile from "../../feature/profille/IndexProfile";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  return <IndexProfile id={id} />;
}
