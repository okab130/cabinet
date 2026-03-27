import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useInvoiceStore } from '../store/invoiceStore';

/**
 * アプリ起動時に Firebase Auth の購読と Firestore リアルタイムリスナーを初期化する。
 * 認証状態が変わるたびにリスナーを再登録する。
 */
const AppInitializer: React.FC = () => {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const initializeListeners = useInvoiceStore((s) => s.initializeListeners);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Firebase Auth セッション復元（初回のみ）
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 認証後に Firestore リアルタイムリスナーを開始
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = initializeListeners();
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return null;
};

export default AppInitializer;
