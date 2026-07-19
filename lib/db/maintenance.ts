import { type SQLiteDatabase } from 'expo-sqlite';

// 全データ削除（設定画面から実行）。FK順で intake_records → items の順に消す
export async function deleteAllData(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM intake_records');
    await db.runAsync('DELETE FROM items');
  });
}
