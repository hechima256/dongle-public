import {useEffect, useState} from 'react'
import { View, Text, ScrollView, TextInput, StyleSheet, Dimensions, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { setDoc, addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { getParticipants, getChatRoomsByUserId } from '../api/db';
import { db } from '../firebase';


const { width, height, scale } = Dimensions.get('window');

// Brown Base
const strongColor = 'rgba(86, 46, 0, 1)'; // strong
const mainColor = 'rgba(229, 174, 92, 1)'; // main
const weakColor = 'rgba(252, 240, 219, 1)'; // weak
const photo_width = 64;
const photo_height = 64;

const map_chat = props => {
	const [myrooms, setMyrooms] = useState([]);
	const [first_message, setFirstM] = useState("");
    const myid = props.myid;
	const uid = props.uid;

	const router = useRouter();	
	useEffect(()=>{
        (async ()=>{
            let rooms = await getChatRoomsByUserId(myid); 
			rooms = rooms.filter((room)=>{// 自分がオーナーのルーム && private
                return room.owner_id === myid && !room.public;
            })
			const bits = await Promise.all(
				rooms.map(async (room)=>{
					const user_qss = await getDoc(doc(db, "rooms", room.id, "participants", uid));
					return user_qss.exists();
				})
			)
			rooms = rooms.filter(i => bits.shift()) // 選択したユーザが参加者に含まれているもののみ
            setMyrooms(rooms);
        })();
    }, [uid]);


	const handleSubmit = async () => {
		if (first_message === "") {
			router.back();
		} else {
			const roomRef = await addDoc(collection(db, "rooms"), {
				owner: myid,
				public: false,
			});
			const messageRef = await addDoc(collection(db, roomRef.path, "messages"), {
				sender: myid,
				content: first_message,
				created_at: new Date(),
			});
			setDoc(doc(db, roomRef.path, "participants", myid), { // 自分を追加
				remarks_count: 1,
				likes: false,
				last_checked: messageRef,
			});
			setDoc(doc(db, roomRef.path, "participants", uid), { // 相手を追加
				remarks_count: 0,
				likes: false,
				last_checked: messageRef,
			});			
			// notification(); 通知 未実装
			router.replace({ pathname: "/main/chat/" + roomRef.id, params: { first_message: first_message } });
		}
	}
	return (
		<View style={styles.root}>
			<TextInput
				style={{
					width: 250,
					borderWidth: 1,
					padding: 5,
					borderColor: 'gray',
				}}
				onChangeText={setFirstM}
				value={first_message}
			/>  
			<Pressable
				onPress={handleSubmit}
			>
				<Text>送信</Text>
			</Pressable>
			{
				(()=>{
					if(myrooms.length === 0){
						return <Text>このユーザに話しかけたことはありません</Text>;
					}else {
						return (
							<ScrollView
								style={{
									width: '100%',
									minHeight: '100%',
									paddingHorizontal: 10,
									paddingTop: 10,
								}}
							>
								{
									myrooms.map((room) => {
										return (
											<Pressable
												key={room.id}
												onPress={() => {
													// handleUpdate(room.id); // これをルーム内側で更新するべき
													router.replace({ pathname: "/main/chat/" + room.id, params: { first_message: room.first_message } })
												}}
												style={styles.chatBoxTheFormal}
											>
												<Text>最初のメッセージ: {room.first_message}</Text>
												<Text>最後のメッセージ: {room.last_message}</Text>
											</Pressable>
										)
									})
								}
							</ScrollView>
						)
					}
				})()
			}          
        </View>
	)
}

export default map_chat;


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
});

