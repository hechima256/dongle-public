import {useEffect, useState} from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native'
import { Link, useRouter } from "expo-router";
import { getChatRoomsByUserId } from '../api/db';

const { width, height, scale } = Dimensions.get('window');

// Brown Base
const strongColor = 'rgba(86, 46, 0, 1)'; // strong
const mainColor = 'rgba(229, 174, 92, 1)'; // main
const weakColor = 'rgba(252, 240, 219, 1)'; // weak
const photo_width = 64;
const photo_height = 64;


const profile = props => {
    const [userrooms, setUserrooms] = useState([]);
    const myid = props.myid;
    const uid = props.uid;
    const router = useRouter();
    useEffect(()=>{
        (async ()=>{
            let rooms = await getChatRoomsByUserId(myid);             
            rooms = rooms.filter((room)=>{// 閲覧しているユーザがオーナーのルーム
                return room.owner_id === uid;
            })
            setUserrooms(rooms);
        })();
    }, [uid]);

    return (
        <View style = {styles.root}>            
            {
				(()=>{
					if(userrooms.length === 0){
						return <Text>このユーザがオーナーのルームなし</Text>;
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
									userrooms.map((room) => {
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
    );
}
export default profile;

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
