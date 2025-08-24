import type React from "react";
import { useState } from "react";
import { LoginScreen } from "../screens/auth/Login/LoginScreen";
import { RegisterScreen } from "../screens/auth/Register/RegisterScreen";

export const AuthNavigator: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  if (isLogin) {
    return <LoginScreen />;
  }

  return <RegisterScreen onSwitchToLogin={() => setIsLogin(true)} />;
};
