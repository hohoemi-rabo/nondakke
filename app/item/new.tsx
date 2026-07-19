import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ItemForm } from '@/components/item-form';
import { createItem } from '@/lib/db/items';

export default function NewItemScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  return (
    <ItemForm
      onSave={async (input) => {
        await createItem(db, input);
        router.back();
      }}
    />
  );
}
