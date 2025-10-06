import { AuthContext, AuthProvider } from '@/context/AuthContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';


const queryClient = new QueryClient();


function RootNavigator() {
  const { userToken } = useContext(AuthContext);
  console.log('user token',userToken)

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {userToken ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
     <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator/>
      </AuthProvider>
      <StatusBar style="auto" />
     </QueryClientProvider>
      
    </>
  );
}
