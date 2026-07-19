import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ItemForm } from '@/components/item-form';
import { colors, typography } from '@/constants/tokens';
import { getItem, updateItem } from '@/lib/db/items';
import { type Item } from '@/lib/db/types';

export default function EditItemScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Number(id);

  // undefined = ロード中 / null = 見つからない
  const [item, setItem] = useState<Item | null | undefined>(undefined);

  useEffect(() => {
    if (!Number.isInteger(itemId)) {
      setItem(null);
      return;
    }
    let cancelled = false;
    getItem(db, itemId).then((loaded) => {
      if (!cancelled) {
        setItem(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, itemId]);

  if (item === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (item === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>アイテムが見つかりません</Text>
      </View>
    );
  }

  return (
    <ItemForm
      initialItem={item}
      onSave={async (input) => {
        await updateItem(db, item.id, input);
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
