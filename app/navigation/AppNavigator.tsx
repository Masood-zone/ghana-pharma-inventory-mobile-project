import type React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../screens/admin/DashboardScreen";
import { ProductsScreen } from "../screens/admin/Products/ProductsScreen";
import { SalesScreen } from "../screens/admin/Sales/SalesScreen";
import { ReportsScreen } from "../screens/admin/Reports/ReportsScreen";
import { ProfileScreen } from "../screens/admin/Profile/ProfileScreen";
import { COLORS } from "../constants";
import Feather from "react-native-vector-icons/Feather";

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "circle";

          if (route.name === "Dashboard") iconName = "home";
          else if (route.name === "Products") iconName = "package";
          else if (route.name === "Sales") iconName = "shopping-cart";
          else if (route.name === "Reports") iconName = "bar-chart-2";
          else if (route.name === "Profile") iconName = "user";

          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: "PharmaTrack Dashboard",
          tabBarLabel: "Dashboard",
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          headerTitle: "Product Management",
          tabBarLabel: "Products",
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          headerTitle: "Sales Recording",
          tabBarLabel: "Sales",
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          headerTitle: "Business Reports",
          tabBarLabel: "Reports",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Profile Settings",
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}
