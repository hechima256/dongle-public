import { View, Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuthContext } from '../../AuthContext';


export default function Layout() {
	const {user, loading} = useAuthContext();

	if(loading){
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
	}else {
		if(user) {
			return <Redirect href='/main/map'/>;
		}else {
			return (
				<Stack
					screenOptions={{
						headerStyle: {
							backgroundColor: '#f4511e',
						},
						headerTintColor: '#fff',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				/>
			);
		}
	}
}