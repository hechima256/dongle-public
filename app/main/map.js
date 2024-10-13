import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Pressable, ScrollView, Dimensions } from 'react-native'
import { Link } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet from 'reanimated-bottom-sheet';
import * as Location from 'expo-location';
import { getAroundUsers, getUserinfo, getUserCoords, saveUserLocations, } from '../../api/db';
import { useAuthContext } from '../../AuthContext';
import Profile from '../../components/map_profile';
import Chat from '../../components/map_chat';
import Icon from 'react-native-vector-icons/AntDesign';

const { width, height, scale } = Dimensions.get('window');

// Brown Base
const strongColor = 'rgba(86, 46, 0, 1)'; // strong
const mainColor = 'rgba(229, 174, 92, 1)'; // main
const weakColor = 'rgba(252, 240, 219, 1)'; // weak
const photo_width = 64;
const photo_height = 64;

const map = () => {
	const { user, loading } = useAuthContext();
	const [mylocation, setLocation] = useState({});
	const [users, setUsers] = useState([]);
	const [selectedUserInfo, setSelectedUserInfo] = useState({});
	const [modalView, setModalView] = useState('PROFILE'); // PROFILE, CHAT
	const sheetRef = useRef(null);
	let owners = [];

	/////////////////////////
	/* api/db との中間地点 */
	const updateUsersCoords = async () => {
		const newlist = await Promise.all(
			users.map(async (userItem) => {
				// const newItem = await getUserCoords(userItem.id, mylocation.coords);
				const newItem = userItem; // 今は何もしない
				return newItem;
			})
		)
		return newlist;
	}
	/* 以上 */
	/////////

	useEffect(() => {
		(async () => {

			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied');
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			setUsers(await getAroundUsers(user.uid, location.coords));

		})();
	}, []);


	useEffect(() => { // 一定時間毎に他ユーザの情報を取得
		const update_users = setInterval(async () => {
			setUsers(await updateUsersCoords());
		}, 10000); // per 10s
		return () => clearInterval(update_users);
	}, [users])




	const renderContent = () => ( // ハーフモーダル		
		<View style={styles.modalWrapper}>
			<View style={styles.modalHeader}>
				<View style={styles.modalPulltab} />
			</View>
			<View style={styles.modalContents}>
				{
					(() => {
						if (modalView === 'PROFILE') {
							return (
								<View style={styles.root}>
									<View style={styles.upperBlank}>
									</View>
									<View style={styles.profile}>
										<View style={styles.photo}>
										</View>
										<Text style={styles.$name}>
											{selectedUserInfo.name}
										</Text>
										<Text style={styles.id}>
											{selectedUserInfo.id}
										</Text>
										<Text style={styles.bio}>
											{selectedUserInfo.bio}
										</Text>
										<Pressable
											onPress={() => {
												setModalView('CHAT');
											}}
										>
											<Icon name="message1" size={30} style={{ position: 'absolute', right: 10, bottom: 10 }} />
										</Pressable>
									</View>
									<View>
										<Text>このユーザーのチャットルーム</Text>
									</View>


									<Profile
										myid={user.uid}
										uid={selectedUserInfo.id}
									/>
								</View>
							);
						} else if (modalView === 'CHAT') {
							return (
								<View style={styles.root}>
									<View style={styles.upperBlank}>
									</View>
									<View style={styles.profile}>
										<Pressable
											onPress={() => {
												setModalView('PROFILE');
											}}
										>
											<Text>{"<もどる"}</Text>
										</Pressable>
										<View style={styles.photo}>
										</View>
										<Text style={styles.$name}>
											{selectedUserInfo.name}
										</Text>
										<Text style={styles.id}>
											{selectedUserInfo.id}
										</Text>
										<Text style={styles.bio}>
											{selectedUserInfo.bio}
										</Text>
									</View>
									<View>
										<Text>このユーザーへの送信履歴</Text>
									</View>

									<Chat
										myid={user.uid}
										uid={selectedUserInfo.id}
									/>

								</View>
							);
						}
					})()
				}
			</View>
		</View>
	);
	return (
		<>
			<MapView
				style={{ flex: 1 }}
				// region={}
				showsUserLocation={true}
				onUserLocationChange={(e) => {
					setLocation(e.nativeEvent.coordinate);
					saveUserLocations(user.uid, e.nativeEvent.coordinate)
					// 自分の現在地が変更される度、firestoreにその位置情報をアップロードする
					// upload my location (api/db.js)
				}}
			>
				{
					users.map((userItem) => {
						if (userItem.id === user.uid) {
							return;
						}
						return (
							<Marker
								key={userItem.id}
								coordinate={{
									latitude: userItem.coords.latitude,
									longitude: userItem.coords.longitude,
								}}
								title={userItem.id}
								onPress={() => {
									(async () => {
										setSelectedUserInfo(await getUserinfo(userItem.id));
									})();
									console.log("clicked. id: ", userItem.id);
									sheetRef.current.snapTo(1);
								}}
							/>
						);
					})
				}
			</MapView>
			<BottomSheet
				ref={sheetRef}
				snapPoints={['90%', '40%', 0]}
				initialSnap={2} // モーダルの初期位置を決める。snapPointsのインデックス番号を指定
				borderRadius={10}
				renderContent={renderContent}
			/>
		</>
	);
}


export default map;


const styles = StyleSheet.create({
	modalWrapper: {
		// backgroundColor: 'rgba(221,221,221,0.3)',
	},
	modalHeader: {
		backgroundColor: 'rgb(200,200,200)',
		height: 50,
		borderRadius: 20,
		borderBottomEndRadius: 0,
		borderBottomStartRadius: 0,
		alignItems: 'center',
		justifyContent: 'center'
	},
	modalPulltab: {
		backgroundColor: 'gray',
		borderRadius: 5,
		margin: 5,
		height: 5,
		width: 40,
	},
	modalContents: {
		backgroundColor: 'rgb(240,240,245)',
		height: '100%',
		alignItems: 'center',
		paddingLeft: 16,
		paddingRight: 16,
		paddingBottom: 100,
		height: 800,
	},
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

