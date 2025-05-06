import IndexProfile from "../../feature/profille/IndexProfile";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  return <IndexProfile id={id} />;
}
