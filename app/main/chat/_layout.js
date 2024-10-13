import { Stack } from 'expo-router';

export default function ChatLayout() {
	return (
		<Stack screenOptions={{ headerShown: true }}>

			<Stack.Screen
				name="index"
			/>
			<Stack.Screen
				name="[room_id]"
			/>
			<Stack.Screen
				name="create_room"
				options={{
					presentation: 'modal',
				}}
			/>
		</Stack>
	);
}