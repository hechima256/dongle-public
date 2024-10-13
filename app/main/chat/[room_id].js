import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import { useAuthContext } from '../../../AuthContext';
import { Stack } from 'expo-router';
import { getMessagesByRoomId, getUserinfo, } from "../../../api/db";
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { db } from "../../../firebase";
import { collection, orderBy, addDoc, doc, limit, getDoc, query, getDocs, updateDoc, setDoc } from "firebase/firestore";

// 画面サイズ
const { width, height, scale } = Dimensions.get('window');

const chatroom = () => {
	const { user, loading } = useAuthContext();
	const { room_id, first_message } = useLocalSearchParams();
	const [messages, setMessages] = useState([]);

	const onSend = (messages) => {
		setMessages((previousMessages) =>
			GiftedChat.append(previousMessages, messages)
		);
		addDoc(collection(db, "rooms", room_id, "messages"), {
			content: messages[0].text,
			created_at: messages[0].createdAt,
			sender: messages[0].user._id,
		});
		(async () => {
			const docRef = doc(db, "rooms", room_id, "participants", user.uid);
			const me_qss = await getDoc(docRef);
			const q = query(collection(db, "rooms", room_id, "messages"), orderBy("created_at", "desc"), limit(1));
			const messages_qss = await getDocs(q);
			const last_mRef = messages_qss.docs[0].ref;
			if (!me_qss.exists()) {
				await setDoc(docRef, {
					remarks_count: 0,
					likes: false,
					last_checked: last_mRef,
				});

			} else {
				updateDoc(docRef, {
					remarks_count: me_qss.data().remarks_count + 1,
					last_checked: last_mRef,
				});
			}
		})();
	};

	useEffect(() => {
		(async () => {
			const messagesbyroomid = (await getMessagesByRoomId(room_id)).sort((a, b) => b.created_at - a.created_at);
			const chatgifted = await Promise.all(
				messagesbyroomid.map(async (message) => {
					let x;
					x = await getUserinfo(message.sender_id);
					return { _id: message.id, user: { _id: message.sender_id, name: x.name }, text: message.content, createdAt: message.created_at };
				})
			);
			setMessages(chatgifted);
		})();
	}, [loading]);

	const MessageBubble = (props) => {
		const userId = user?.uid
		const currentUserId = props.currentMessage?.user._id;
		let times = props.currentMessage.createdAt;
		const time = new Date(times)
		return (
			<View style={{ flex: 1 }}>
				{userId !== currentUserId && (
					<Text style={styles.userName}>
						{props.currentMessage.user.name}
					</Text>
				)}
				<Bubble
					{...props}
					textStyle={{
						right: {
							color: 'white'
						},
						left: {
							color: 'black'
						}
					}}
					wrapperStyle={{
						right: {
							backgroundColor: 'rgba(219, 164, 82, 1.5)',//'#1e90ff',
							padding: 3
						},
						left: {
							backgroundColor: '#f8f8ff',
							padding: 3,
						}
					}}
					renderTime={() => {
						return null
					}}
				/>
				{userId === currentUserId ? (
					<Text style={styles.rightTerm}>{time.toLocaleTimeString()}</Text>
				) : (
					<Text style={styles.leftTerm}>{time.toLocaleTimeString()}</Text>
				)}
			</View>
		)
	}
	return (
		<>
			<Stack.Screen
				options={{ headerTitle: /*"タイトル: " + */first_message }}
			/>
			<GiftedChat
				messages={messages}
				onSend={messages => onSend(messages)}
				renderBubble={MessageBubble}
				alwaysShowSend
				user={{
					_id: user.uid,
					name: user.name,
				}}
				locale='ja'
				renderAvatarOnTop
			/>
		</>
	);
}

export default chatroom;

const styles = StyleSheet.create({
	userName: {
		fontStyle: 'normal',
		//fontWeight: '500',
		letterSpacing: 0.3,
	},
	rightTerm: {
		textAlign: 'right',
		bottom: 0,
		marginBottom: 5,
	},
	leftTerm: {
		textAlign: 'left',
		bottom: 0,
		marginBottom: 5,
	}
});