import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { updateDoc, doc, getDoc, setDoc, getDocs, query, collection, limit, orderBy } from 'firebase/firestore';

import { getUserinfo, getChatRoomsByUserId } from '../../api/db.js'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../firebase';
import { useAuthContext } from '../../AuthContext';

// 画面サイズ
const { width, height, scale } = Dimensions.get('window');

// Brown Base
const strongColor = 'rgba(86, 46, 0, 1)'; // strong
const mainColor = 'rgba(229, 174, 92, 1)'; // main
const weakColor = 'rgba(252, 240, 219, 1)'; // weak

// APIで取得
const user_index = 0;
const setting = () => {
	const { user, loading } = useAuthContext();
	const [userinfo, setUserinfo] = useState({ id: "", name: "", bio: "" });

	const router = useRouter();
	const [chatrooms, setChatrooms] = useState([]);
	const [showing_rooms, setShowingrooms] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [public_selected, setPubSelected] = useState(true); //pubかpri,どちらを表示するか
	const public_rooms = chatrooms.filter((room) => { return room.public });
	const private_rooms = chatrooms.filter((room) => { return !room.public });

	const onRefresh = () => {
		(async () => {
			setRefreshing(true);
			setChatrooms(await getChatRoomsByUserId(user.uid));
			setRefreshing(false);
		})();
	};

	const handleUpdate = async (roomid) => { //ルームの自分の参加情報を更新
		const docRef = doc(db, "rooms", roomid, "participants", user.uid);
		const me_qss = await getDoc(docRef);
		const q = query(collection(db, "rooms", roomid, "messages"), orderBy("created_at", "desc"), limit(1));
		const messages_qss = await getDocs(q);
		const last_mRef = messages_qss.docs[0].ref;

		if (!me_qss.exists()) { // 初閲覧なら
			await setDoc(docRef, { // participantsに追加
				remarks_count: 0,
				likes: false,
				last_checked: last_mRef,
			});
		} else { // 2回目以降なら
			updateDoc(docRef, { // participantのlast_checkedを更新
				last_checked: last_mRef,
			});
		}
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
		} catch (e) {
			if (e instanceof FirebaseError) {
				console.log(e)
			}
		} finally {
			console.log("logged out");
		}
	};

	useEffect(() => {
		(async () => {
			if (user) {
				setUserinfo(await getUserinfo(user.uid));
			}
		})();
	}, [loading]);

	useEffect(() => {
		(async () => {
			setChatrooms(await getChatRoomsByUserId(user.uid));
		})();
	}, [loading]);

	useEffect(() => {
		if (public_selected) {
			setShowingrooms(public_rooms);
		} else {
			setShowingrooms(private_rooms);
		}
	}, [chatrooms]);


	return (
		<View style={styles.root}>

			<Stack.Screen
				options={{
					headerShown: false,
					color: "black"
				}}
			/>

			<View style={styles.upperBlank}>
			</View>

			<View style={styles.profile}>
				<View style={styles.photo}>
				</View>
				<Text style={styles.$name}>
					{userinfo.name}
				</Text>
				<Text style={styles.id}>
					{userinfo.id}
				</Text>
				<Text style={styles.bio}>
					{userinfo.bio}
				</Text>
			</View>

			<View style={styles.switcher}>
				<Pressable
					onPress={() => {
						setPubSelected(true);
						setShowingrooms(public_rooms);
					}}
					style={styles.switchLeftButton(public_selected)}
				>
					<Text style={styles.switchLetter(public_selected)}>
						Public
					</Text>
				</Pressable>

				<Pressable
					onPress={() => {
						setPubSelected(false);
						setShowingrooms(private_rooms);
					}}
					style={styles.switchRightButton(!public_selected)}
				>
					<Text style={styles.switchLetter(!public_selected)}>
						Private
					</Text>
				</Pressable>
			</View>

			<View style={{ height: height - 44 - 196 - 50 - 48 - 87, }}>
				<ScrollView
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					style={{
						minHeight: '10%',
						paddingHorizontal: 10,
						paddingTop: 0,
						marginTop: 10,
						width: width,
					}}
				>
					{
						showing_rooms.map((room) => {
							if (room.owner_id == userinfo.id) {
								return (
									<Pressable
										key={room.id}
										onPress={() => {
											//handleUpdate(room.id);
											//router.push({ pathname: "/main/chat/" + room.id, params: { first_message: room.first_message } })
										}}
										style={styles.chatBoxTheFormal}
									>
										<Text style={styles.titleMessageLetter}>
											{room.first_message}
										</Text>
										<Text style={styles.messageLetter}>
											最後の返信 : {room.last_message}
										</Text>
									</Pressable>
								);
							}
						})
					}
				</ScrollView>
			</View>

			<View style={styles.logoutButton}>
				<TouchableOpacity
					onPress={handleLogout}
					style={{
						marginTop: 10,
						padding: 10,
						backgroundColor: 'rgba(220, 0, 0, 0.8)',//88cb7f',
						borderRadius: 10,
						width: 100,
					}}
				>

					<Text style={styles.logout}>
						Logout
					</Text>
				</TouchableOpacity>
			</View>

		</View>
	);
}

const photo_width = 64;
const photo_height = 64;

const styles = StyleSheet.create({
	root: {
		width: width,
		height: height,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		backgroundColor: 'white', //"white", //Color, //'#FFF',
		flex: 1,
	},

	// header
	pageHeader: {
		width: width,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#EEE',
		flexDirection: 'row',
		paddingVertical: 16,
		paddingHorizontal: 0,
	},
	title: {
		color: '#000',
		textAlign: 'center',
		//fontFamily: 'Roboto',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: '500',
		//lineHeight: '24',
		letterSpacing: 1,
	},

	// profile
	profile: {
		width: width,
		height: 196,
		flexShrink: 0,
		backgroundColor: weakColor, //'#F2F2F2',
	},
	photo: {
		width: photo_width,
		height: photo_height,
		flexShrink: 0,
		backgroundColor: 'white', //'#DDD',
		margin: photo_width * 0.25,
		borderRadius: photo_width / 2,
	},
	$name: {
		width: width - 96,
		height: 32,
		flexShrink: 0,
		color: '#000',
		//fontFamily: 'Roboto',
		fontSize: 25,
		fontStyle: 'normal',
		fontWeight: '400',
		//lineHeight: '24',
		marginLeft: photo_width * 1.35,
		marginTop: -photo_width * 1.25,
	},
	id: {
		width: width - 96,
		color: '#000',
		//fontFamily: 'Roboto',
		fontSize: 16,
		fontStyle: 'normal',
		fontWeight: '400',
		//lineHeight: '24',
		marginLeft: photo_width * 1.35,
	},
	bio: {
		width: width - 40,
		height: 83,
		flexShrink: 0,
		color: '#000',
		//fontFamily: 'Roboto',
		fontSize: 16,
		fontStyle: 'normal',
		fontWeight: '400',
		//lineHeight: '24',
		marginLeft: photo_width * 0.25,
		marginTop: 20, // magic number
	},

	// switcher
	switcher: {
		height: 50,
		flexDirection: 'row',
		backgroundColor: weakColor,
	},
	switchLeftButton: (mode_selected) => ({
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: mode_selected ? 'white' : weakColor,
		borderColor: 'white',
		borderTopRightRadius: 15,
	}),
	switchRightButton: (mode_selected) => ({
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: mode_selected ? 'white' : weakColor,
		borderColor: 'white',
		borderTopLeftRadius: 15,
	}),
	switchLetter: (mode_selected) => ({
		color: '#575757',
		textAlign: 'center',
		fontSize: 18,
		fontStyle: 'normal',
		fontWeight: '500',
		letterSpacing: 1,
	}),

	// chatroom
	chatBoxThePop: {
		height: 80,
		backgroundColor: 'white',//'rgba(45, 140, 60, 0.08)', //'#2d8c3c',
		//borderColor: '#80FF66',
		//borderWidth: 1,
		borderRadius: 20,
		marginBottom: 5,
	},
	chatBoxTheFormal: {
		height: 80,
		borderBottomColor: '#EEEEEE',
		borderBottomWidth: 1,
		color: 'white',
	},
	titleMessageLetter: {
		color: '#000',
		//textAlign: 'center',
		//fontFamily: 'Roboto',
		fontSize: 18,
		fontStyle: 'normal',
		fontWeight: '500',
		//lineHeight: '24',
		left: 10,
		top: 5,
		width: width - 30,
		letterSpacing: 0.3,
	},
	messageLetter: {
		color: '#797979',
		//textAlign: 'center',
		//fontFamily: 'Roboto',
		fontSize: 16,
		fontStyle: 'normal',
		//fontWeight: '500',
		//lineHeight: '24',
		left: 10,
		top: 5,
		width: width - 30,
		letterSpacing: 0.3,
	},

	// logout 
	logout: {
		width: 54,
		height: 22,
		left: 11,
		flexShrink: 0,
		color: '#FFF',
		//fontFamily: 'Roboto',
		fontSize: 16,
		fontStyle: 'normal',
		fontWeight: '400',
		//lineHeight: '24',
		textAlign: 'center',
		justifyContent: 'center',
	},
	logoutButton: {
		width: width,
		height: 48,
		justifyContent: 'center',
		alignItems: 'center',
		flexShrink: 0,
		backgroundColor: '#FFF',
		flexDirection: 'row',
		paddingVertical: 10,
		paddingHorizontal: 0,
	},

	// blank
	upperBlank: {
		width: width,
		height: 44,
		flexShrink: 0,
		backgroundColor: weakColor, //'rgba(255, 255, 255, 0.00)',
	},
	lowerBlank: {
		width: width,
		height: 0,
		flexShrink: 0,
		backgroundColor: 'white',
	},
});

export default setting;
