import { View, Text, Pressable, useColorScheme, StyleSheet } from 'react-native';
import { Redirect, Tabs } from "expo-router";
import { FontAwesom } from '@expo/vector-icons';
import { useAuthContext } from '../../AuthContext';

import Icon from 'react-native-vector-icons/AntDesign';

export default function Layout() {
	const { user, loading } = useAuthContext();
	//const colorScheme = useColorScheme();

	if (loading) {
		return (
			<View
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					flex: 1,
				}}
			>
				<Text>Loading...</Text>
			</View>
		);
	} else {
		if (user) {
			return (
				<Tabs screenOptions={styles.tabBar} >
					<Tabs.Screen
						name="map"
						options={{
							href: "/main/map",
							tabBarIcon: ({ color }) => <Icon name="enviromento" color={color} size={30} />,
						}}
					/>
					<Tabs.Screen
						name="chat"
						options={{
							href: "/main/chat",
							tabBarIcon: ({ color }) => <Icon name="message1" color={color} size={30} />,
						}}
					/>
					<Tabs.Screen
						name="search"
						options={{
							href: "/main/search",
							tabBarIcon: ({ color }) => <Icon name="search1" color={color} size={30} />,
						}}
					/>
					<Tabs.Screen
						name="notification"
						options={{
							href: "/main/notification",
							tabBarIcon: ({ color }) => <Icon name="bells" color={color} size={30} />,
						}}

					/>
					<Tabs.Screen
						name="setting"
						options={{
							href: "/main/setting",
							tabBarIcon: ({ color }) => <Icon name="setting" color={color} size={30} />,
						}}
					//icon="cat"
					/>
				</Tabs>
			);
		} else {
			return <Redirect href='/auth/LoginScreen' />;
		}
	}
}

// Brown Base
const pushedColor = 'rgba(252, 240, 219, 1)';
const unpushedColor = 'rgba(229, 174, 92, 1)';

const postedColor = 'rgba(86, 46, 0, 1)';
const unpostedColor = 'rgba(249, 194, 112, 1)';

const styles = StyleSheet.create({
	tabBar: {
		tabBarShowLabel: false,
		headerShown: false,
		//tabBarActiveBackgroundColor: pushedColor,
		//tabBarInactiveBackgroundColor: pushedColor,
		tabBarActiveTintColor: 'black', //'rgba(50, 155, 50, 0.70)',
	},
});