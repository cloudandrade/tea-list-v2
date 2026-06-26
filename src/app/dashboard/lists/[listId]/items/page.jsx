import CreateItemScreen from '@/modules/lists/components/CreateItemScreen';

export default async function ListItemsPage({ params }) {
  const { listId } = await params;
  return <CreateItemScreen listId={listId} />;
}
