import { Slot } from 'expo-router';
import { AuthProvider } from '../AuthContext';

export default function Layout() {	
	return (
		<AuthProvider>
			<Slot/>
		</AuthProvider>
	);
}