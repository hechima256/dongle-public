import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, Pressable, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { updateDoc, doc, getDoc, setDoc, getDocs, query, collection, limit, orderBy } from 'firebase/firestore';

import { getChatRoomsByUserId, getUserinfo } from '../../../api/db';
import { useAuthContext } from '../../../AuthContext';
import { db } from '../../../firebase';

// 画面サイズ
const { width, height, scale } = Dimensions.get('window');

// 色
/*  
// Green Base
const pushedColor = 'rgba(128, 255, 128, 0.70)';
const unpushedColor = 'rgba(128, 255, 128, 0.25)';

const postedColor = '#30AF30';
const unpostedColor = '#70EF70';
*/
// Brown Base
const pushedColor = 'white'; //'rgba(252, 240, 219, 1)';
const unpushedColor = 'rgba(229, 174, 92, 1)';

const postedColor = 'rgba(86, 46, 0, 1)';
const unpostedColor = 'rgba(249, 194, 112, 1)';

const weakColor = 'rgba(252, 240, 219, 1)';
const mainColor = 'rgba(229, 174, 92, 1)';
const strongColor = 'rgba(86, 46, 0, 1)';

const chat = () => {
	const router = useRouter();
	const { user, loading } = useAuthContext();
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

	/*
	const getUserName = ({ owner_id }) => {
		setUserinfo(await getUserinfo(owner_id));

		console.log("test");
		console.log(userinfo);

		return userinfo.name;
	};
	*/

	return (
		<View style={styles.root}>

			<Stack.Screen
				options={{
					//headerTitle: "チャットルーム一覧",
					headerShown: false,
					color: "black"
				}}
			/>

			<View style={styles.upperBlank}>
			</View>

			<View>
				<View style={styles.pageHeader}>

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

				<ScrollView
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					style={{
						minHeight: '100%',
						paddingHorizontal: 10,
						paddingTop: 10,
						backgroundColor: pushedColor,
					}}
				>
					{
						showing_rooms.map((room) => {
							return (
								<Pressable
									key={room.id}
									onPress={() => {
										handleUpdate(room.id);
										router.push({ pathname: "/main/chat/" + room.id, params: { first_message: room.first_message } })
									}}
									style={styles.chatBoxTheFormal}
								>
									<View style={{ flexDirection: 'row', }}>
										{/*
										<View>
											<View style={styles.photo}>
												<Text>fe</Text>
											</View>
											<Text>{getUserName(room.owner_id)}</Text>
										</View>
										*/}
										<View>
											<Text style={styles.titleMessageLetter}>
												{room.first_message}
											</Text>

											<Text style={styles.messageLetter}>
												最後の返信 : {room.last_message}
											</Text>
										</View>
									</View>
								</Pressable>
							);
						})
					}
				</ScrollView>

			</View>

			<Pressable
				onPress={() => {
					router.push({ pathname: "/main/chat/create_room", });
				}}
				style={({ pressed }) => [
					{
						position: 'absolute',
						bottom: pressed ? 25 : 20,
						right: pressed ? 25 : 20,
						width: pressed ? 70 : 80,
						height: pressed ? 70 : 80,
						borderRadius: pressed ? 35 : 40,
						//borderStyle: 'solid',
						//borderWidth: 1,
						//borderColor: pressed ? postedColor : pushedColor,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: pressed ? strongColor : mainColor,
					}
				]}
			>
				<Image
					style={styles.postImage}
					source={require('../../../assets/acorn.png')}
				/>
			</Pressable>
		</View >
	);
}

export default chat;

const photo_width = 50;
const photo_height = 50;

const styles = StyleSheet.create({
	root: {
		width: width,
		height: height,
		//flexDirection: 'column',
		//justifyContent: 'center',
		//alignItems: 'flex-start',
		backgroundColor: weakColor, //'white', //'#EEEEEE',
		flex: 1,
	},

	// header
	pageHeader: {
		width: width,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: weakColor, //'white', //'#EEEEEE',
		flexDirection: 'row',
		paddingVertical: 8,
		paddingHorizontal: 0,
	},
	title: {
		color: '#FFF',
		textAlign: 'center', //center',
		//fontFamily: 'Roboto',
		fontSize: 36,
		fontStyle: 'normal',
		fontWeight: '500',
		//lineHeight: '24',
		letterSpacing: 1,
		left: 0,
	},

	// switcher
	switcher: {
		height: 50,
		//width: width - 30,
		//left: 15,
		flexDirection: 'row',
		backgroundColor: weakColor,
	},
	switchLeftButton: (mode_selected) => ({
		flex: 1,
		//left: 15,
		//width: 10,//(width * 0.5) - 30,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: mode_selected ? pushedColor : weakColor,
		borderColor: 'rgba(255, 255, 255, 1.00)',
		//borderRightWidth: 1,
		//borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		//borderBottomLeftRadius: 15,
	}),
	switchRightButton: (mode_selected) => ({
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: mode_selected ? pushedColor : weakColor,
		borderColor: 'rgba(255, 255, 255, 1.00)',
		//borderLeftWidth: 1,
		borderTopLeftRadius: 15,
		//borderTopRightRadius: 15,
		//borderBottomRightRadius: 15,
	}),
	switchLetter: (mode_selected) => ({
		color: "#575757", //!mode_selected ? '#FFFFFF' : '#575757',
		textAlign: 'center',
		//fontFamily: 'Roboto',
		fontSize: 18,
		fontStyle: 'normal',
		fontWeight: '500',
		//lineHeight: '24',
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
	},
	photo: {
		width: photo_width,
		height: photo_height,
		//flexShrink: 0,
		backgroundColor: weakColor,
		//margin: photo_width * 0.1,
		borderRadius: photo_width / 2,
		top: 5,
		//left: 10,
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

	// post
	/*
	postButton: (pressed) => ({
		position: 'absolute',
		bottom: 20,
		right: 20,
		width: 80,
		height: 80,
		borderRadius: 40,
		borderStyle: 'solid',
		borderWidth: 1,
		borderColor: pressed ? '#30AF30' : '#70EF70',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: pressed ? '#30AF30' : '#70EF70',
	}),
	*/
	postImage: {
		width: 35,
		height: 35,
	},

	//brank
	upperBlank: {
		width: width,
		height: 44,
		flexShrink: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.00)',
	},
});
