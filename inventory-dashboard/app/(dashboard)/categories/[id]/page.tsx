import CategoryDetails from "@/components/CategoryDetails";

type CategoryDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CategoryDetailsPage({ params }: CategoryDetailsPageProps) {
  const { id } = await params;
  return <CategoryDetails categoryId={id} />;
}
