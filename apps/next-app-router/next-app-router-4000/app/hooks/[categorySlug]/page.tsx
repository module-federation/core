import { getCategory } from '#/app/api/categories/getCategories';
import { HooksClient } from '#/app/hooks/_components/router-context';

export default async function Page(props: {
  params: Promise<{ categorySlug: string }>;
}) {
  const params = await props.params;
  const category = await getCategory({ slug: params.categorySlug });

  return (
    <div className="space-y-9">
      <h1 className="text-xl font-medium text-gray-400/80">
        All {category.name}
      </h1>

      <HooksClient />
    </div>
  );
}
