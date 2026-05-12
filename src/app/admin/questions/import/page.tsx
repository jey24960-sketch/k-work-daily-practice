import { ImportQuestionConsole } from "./ImportQuestionConsole";

type ImportPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function AdminQuestionImportPage({
  searchParams,
}: ImportPageProps) {
  const params = await searchParams;
  return <ImportQuestionConsole initialToken={params.token ?? ""} />;
}
