import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona imediatamente para splash usando replace
    // Isso remove o index do histórico de navegação
    router.replace('/splash');
  }, [router]);

  // Retorna view vazia enquanto redireciona
  return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
}
