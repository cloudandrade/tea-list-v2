import PrivateListScreen from '@/modules/lists/components/PrivateListScreen';

export default async function ListPage({ params }) {
  const { listId } = await params;
  return <PrivateListScreen listId={listId} />;
}
