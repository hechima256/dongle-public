import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Stack } from 'expo-router';


const RegisterScreen = () => {
	const [name, setName] = useState('');
	const [bio, setBio] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const handleRegister = async () => {
		let userinfo={name: name, bio: bio};
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;
			if(userinfo.name=="") userinfo.name = user.uid; 
			if(userinfo.bio=="") userinfo.bio = "自己紹介を書きましょう";
			await setDoc(doc(db, "users", user.uid), userinfo);
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
			<Text style={{ fontSize: 20, marginBottom: 20 }}>ユーザ登録画面</Text>
			<View style={{ marginBottom: 20 }}>
				<TextInput
					style={{
						width: 250,
						borderWidth: 1,
						padding: 5,
						borderColor: 'gray',
					}}
					onChangeText={setName}
					value={name}
					placeholder="ユーザー名を入力してください"
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
					onChangeText={setBio}
					value={bio}
					placeholder="自己紹介文を入力してください"
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
					onChangeText={setEmail}
					inputMode='email'
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
				onPress={handleRegister}

			>
				<Text style={{ color: 'white' }}>登録する</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
};

export default RegisterScreen;