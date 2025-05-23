import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { auth } from '../../firebase';
import { Link, Stack } from 'expo-router';


const LoginScreen = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.log(error.message);
		}
	};

	return (

		<KeyboardAvoidingView
			behavior="padding"
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				flex: 1,
			}}
		>
			<Stack.Screen/>
			<Text style={{ fontSize: 20, marginBottom: 20 }}>ログイン画面</Text>
			<View style={{ marginBottom: 20 }}>
				<TextInput
					style={{
						width: 250,
						borderWidth: 1,
						padding: 5,
						borderColor: 'gray',
					}}
					onChangeText={setEmail}
					value={email}
					placeholder="メールアドレスを入力してください"
					autoCapitalize="none"
					autoCorrect={false}
				/>
			</View>
			<View style={{ marginBottom: 20 }}>
				<TextInput
					style={{
						width: 250,
						borderWidth: 1,
						padding: 5,
						borderColor: 'gray',
					}}
					onChangeText={setPassword}
					value={password}
					placeholder="パスワードを入力してください"
					secureTextEntry={true}
					autoCapitalize="none"
				/>
			</View>
			<TouchableOpacity
				style={{
					padding: 10,
					backgroundColor: '#88cb7f',
					borderRadius: 10,
				}}
				onPress={handleLogin}
			>
				<Text style={{ color: 'white' }}>ログイン</Text>
			</TouchableOpacity>
			<Link href="./RegisterScreen">
				<Text>ユーザ登録はこちら</Text>
				
			</Link>
		</KeyboardAvoidingView>

	);
};

export default LoginScreen;