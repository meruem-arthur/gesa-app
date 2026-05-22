import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import HomeScreen          from '../screens/HomeScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import LeadersScreen       from '../screens/LeadersScreen';
import MaterialsScreen     from '../screens/MaterialsScreen';
import PastQuestionsScreen from '../screens/PastQuestionsScreen';
import EventsScreen        from '../screens/EventsScreen';

const Tab = createBottomTabNavigator();

const tabs = [
  { name: 'Home',          component: HomeScreen,          icon: 'home-outline',          iconActive: 'home' },
  { name: 'Announcements', component: AnnouncementsScreen, icon: 'megaphone-outline',      iconActive: 'megaphone' },
  { name: 'Leaders',       component: LeadersScreen,       icon: 'people-outline',         iconActive: 'people' },
  { name: 'Materials',     component: MaterialsScreen,     icon: 'book-outline',           iconActive: 'book' },
  { name: 'PastQuestions', component: PastQuestionsScreen, icon: 'document-text-outline',  iconActive: 'document-text', label: 'Past Q' },
  { name: 'Events',        component: EventsScreen,        icon: 'calendar-outline',       iconActive: 'calendar' },
];

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = tabs.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? tab.iconActive : tab.icon}
              size={size}
              color={focused ? colors.gold2 : colors.dim}
            />
          ),
          tabBarLabel: tab.label || tab.name,
          tabBarActiveTintColor: colors.gold2,
          tabBarInactiveTintColor: colors.dim,
          tabBarStyle: {
            backgroundColor: 'rgba(13,10,28,0.97)',
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: 16,
            paddingTop: 8,
            height: 72,
          },
          tabBarLabelStyle: {
            fontSize: 9,
            marginTop: 2,
          },
        };
      }}
    >
      {tabs.map(t => (
        <Tab.Screen key={t.name} name={t.name} component={t.component} />
      ))}
    </Tab.Navigator>
  );
}
