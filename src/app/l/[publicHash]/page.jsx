import PublicListScreen from '@/modules/lists/components/PublicListScreen';

export default async function PublicListPage({ params }) {
  const { publicHash } = await params;
  return <PublicListScreen publicHash={publicHash} />;
}
