import CreateListScreen from '@/modules/lists/components/CreateListScreen';

export default async function EditListPage({ params }) {
  const { listId } = await params;
  return <CreateListScreen listId={listId} mode="edit" />;
}
