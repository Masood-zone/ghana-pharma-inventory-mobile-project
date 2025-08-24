import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./app/contexts/auth/AuthContext";
import { RootNavigator } from "./app/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
