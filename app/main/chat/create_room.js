import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, TextInput, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { setDoc, addDoc, collection, doc } from 'firebase/firestore';
import { useAuthContext } from '../../../AuthContext';
import { RadioButton, Checkbox } from 'react-native-paper';
import { db } from '../../../firebase';
import { getUsers } from '../../../api/db';
import { GiftedChat } from 'react-native-gifted-chat';

// 画面サイズ
const { width, height, scale } = Dimensions.get('window');

// Brown Base
const pushedColor = 'rgba(252, 240, 219, 1)'; // weak
const unpushedColor = 'rgba(229, 174, 92, 1)'; // main

const postedColor = 'rgba(86, 46, 0, 1)'; // strong
const unpostedColor = 'rgba(249, 194, 112, 1)';

const weakColor = 'rgba(252, 240, 219, 1)';
const mainColor = 'rgba(229, 174, 92, 1)';
const strongColor = 'rgba(86, 46, 0, 1)';

const create_room = () => {
	const [first_message, setFirstM] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [users, setUsers] = useState([]);
	const { user, loading } = useAuthContext();
	const [messages, setMessages] = useState([]);
	const [inputing, setInputing] = useState(false);

	const router = useRouter();

	const handleSubmit = async () => {
		endEditing();

		if (first_message === "") {
			router.back();
		} else {
			const roomRef = await addDoc(collection(db, "rooms"), {
				owner: user.uid,
				public: isPublic,
			});
			const messageRef = await addDoc(collection(db, roomRef.path, "messages"), {
				sender: user.uid,
				content: first_message,
				created_at: new Date(),
			});
			setDoc(doc(db, roomRef.path, "participants", user.uid), {
				remarks_count: 1,
				likes: false,
				last_checked: messageRef,
			});

			users.map((useritem) => { //参加者の追加
				if (useritem.checked) { // 話しかける人に含まれているなら
					setDoc(doc(db, roomRef.path, "participants", useritem.id), {
						remarks_count: 0,
						likes: false,
						last_checked: messageRef,
					});
				}
			})
			// notification(); 通知 未実装

			router.replace({ pathname: "/main/chat/" + roomRef.id, params: { first_message: first_message } });
		}
	}

	const Card = ({ name, check_flag }: any) => {
		return (
			<View style={styles.card}>
				<View style={styles.photo(check_flag)}>
					<Image
						style={styles.icon}
						source={require('../../../assets/acorn.png')}
					/>
				</View>

				<Text>
					{name}
				</Text>
			</View>
		);
	};

	const focus = () => {
		console.log("focus");
		setInputing(true);
	};

	const endEditing = () => {
		console.log("end");
		setInputing(false);
	};

	useEffect(() => {
		(async () => {
			let userlist = await getUsers();
			userlist = userlist.filter((useritem) => { // 自分以外に限定
				return useritem.id != user.uid;
			})
			userlist = userlist.map((useritem) => { // checed項目を追加
				return { ...useritem, checked: false };
			})
			setUsers(userlist);
		})();
	}, []);

	return (
		<View style={styles.root}>
			<Stack.Screen
				options={{
					headerTitle: "つぶやく/ 話しかける",
				}}
			/>

			<View style={{ backgroundColor: "white" }}>
				<View style={styles.userListExplanation}>
					<Text style={styles.userListExplanationLetter}>
						話しかける人を選択
					</Text>
				</View>

				{/*
				<View style={styles.userListSize}>
					<ScrollView style={styles.userList}>
						{
							users.map((useritem) => {
								return (
									<Checkbox.Item
										key={useritem.id}
										label={useritem.name}
										status={useritem.checked ? 'checked' : 'unchecked'}
										onPress={() => {
											setUsers((users) => {
												return users.map((obj) => (obj.id === useritem.id ? { ...obj, checked: !obj.checked } : obj));
											});
										}}
									/>
								);
							})
						}

					</ScrollView>
				</View>
				*/}

				<View style={styles.userListSize(inputing)}>
					<ScrollView
						contentContainerStyle={{
							flexDirection: 'row',
							flexWrap: 'wrap'
						}}
						style={styles.userList}
					>
						{users.map((useritem, index) => {
							return (
								<Pressable
									onPress={() => {
										setUsers((users) => {
											return users.map((obj) => (obj.id === useritem.id ? { ...obj, checked: !obj.checked } : obj));
										});
									}}
									style={{ width: '33%', flexDirection: "row" }}
								>
									<Card key={index} name={useritem.name} check_flag={useritem.checked} />
								</Pressable>
							);
						})}
					</ScrollView>
				</View>

			</View>

			<View style={styles.sendForm}>
				<View style={styles.switcher}>
					<Pressable
						onPress={() => setIsPublic(true)}
						style={styles.switchLeftButton(isPublic)}
					>
						<Text style={styles.switchLetter(isPublic)}>
							Public
						</Text>
					</Pressable>

					<Pressable
						onPress={() => setIsPublic(false)}
						style={styles.switchRightButton(!isPublic)}
					>
						<Text style={styles.switchLetter(!isPublic)}>
							Private
						</Text>
					</Pressable>
				</View>

				<View style={styles.textForm}>
					<TextInput
						onChangeText={setFirstM}
						//onFocus={focus}
						//onEndEditing={endEditing}

						value={first_message}
						style={styles.textInput}
					/>

					<Pressable
						onPress={handleSubmit}
						style={styles.submitButton}
					>
						<Text style={styles.sendLetter}>
							send
						</Text>
					</Pressable>
				</View>
			</View>
		</View>
	)
}

export default create_room;

const photo_width = 80;
const photo_height = 80;

const styles = StyleSheet.create({
	// root
	root: {
		backgroundColor: weakColor,
		flex: 1,
		justifyContent: 'flex-start',
	},

	// user list
	userListExplanation: {
		borderTopWidth: 1,
		borderColor: '#DDD',
		color: '#000',
		backgroundColor: '#FFF',
		paddingHorizontal: 10,
		paddingTop: 3,
		paddingBottom: 5,
		left: 10,
		width: width - 20,
	},
	userListExplanationLetter: {
		textAlign: 'center',
		//fontFamily: 'Roboto',
		fontSize: 18,
		fontStyle: 'normal',
		fontWeight: '500',
		//lineHeight: '24',
		//top: 9,
		letterSpacing: 0.3,
	},
	userList: {
		//borderTopWidth: 1,
		//height: 20,
		//top: 9,
		contentHeight: 200,
		backgroundColor: "white",
	},
	userListSize: (inputing) => ({
		height: inputing ? 265 : 265, // このままでいいや
	}),
	card: {
		backgroundColor: 'white',
		height: 125,
		flex: 1,
		alignSelf: "center",
		justifyContent: 'flex-start',
		alignItems: 'center',
		marginBottom: 5,
		marginHorizontal: 5,
	},
	photo: (checked) => ({
		width: photo_width,
		height: photo_height,
		flexShrink: 0,
		backgroundColor: checked ? mainColor : weakColor, //'#DDD',
		margin: photo_width * 0.1,
		borderRadius: photo_width / 2,
	}),
	icon: {
		width: '50%', //photo_width,
		height: '50%', //photo_height,
		alignSelf: "center",
		justifyContent: 'center',
		top: '25%',
	},

	// send form
	sendForm: {
		marginTop: 10,
		//alignItems: 'center',
		justifyContent: 'center',
	},

	// pub-pri switcher
	switcher: {
		flexDirection: 'row',
		height: 40,
		left: 10,
	},
	switchLeftButton: (mode_selected) => ({
		width: 100,
		//alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: mode_selected ? "white" : pushedColor,
		borderColor: 'rgba(255, 255, 255, 1.00)',
		//borderLeftWidth: 1,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
	}),
	switchRightButton: (mode_selected) => ({
		width: 100,
		backgroundColor: mode_selected ? "white" : pushedColor,
		//alignItems: 'center',
		justifyContent: 'center',
		borderColor: 'rgba(255, 255, 255, 1.00)',
		//borderLeftWidth: 1,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
	}),
	switchLetter: (mode_selected) => ({
		color: '#575757', //!mode_selected ? 'white' : 'black',
		textAlign: 'center',
		//fontFamily: 'Roboto',
		fontSize: 18,
		fontStyle: 'normal',
		fontWeight: '500',
		//lineHeight: '24',
		letterSpacing: 1,
	}),

	// message
	textForm: {
		//marginTop: 5,
		flexDirection: 'row',
	},
	textInput: {
		width: width - 60,
		height: 40,
		padding: 5,
		backgroundColor: 'white',
		borderTopWidth: 0,
		borderBottomWidth: 0,
		borderTopColor: 'gray',
		borderBottomColor: 'gray',
	},
	submitButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 60,
		height: 40,
		//borderWidth: 1,
		//margin: 2,
		backgroundColor: 'white', //alignContent, 'rgb(0, 152, 220)',
		//borderLeftWidth: 1,
		//borderLeftColor: 
	},
	sendLetter: {
		color: 'rgb(0, 152, 220)',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: '500',
		//letterSpacing: 1,
	},
});

