import React from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import { Link } from 'expo-router'

// Notifコンポーネント
/*
1つの通知を表示するためのコンポーネント
propsは
    userId:     反応したユーザーのID(整数)
    userName:   反応したユーザーの名前(文字列)
    response:   反応の種類(文字列)
    content:    投稿内容(文字列)
    (userImage):ユーザーのアイコン
となる。
*/

const notif = props => {
    return (
        <View style={styles.notif}>
            <Link href={{ pathname: '/main/home/user', params: { id: props.userId }}}>
                {<Text>userImage</Text>}
            </Link>
            
            <Text>{props.userName + "さんが" + props.response + "しました。"}</Text>

            <Text>{props.content}</Text>
        </View>
    );
}


export default notif;


const styles = StyleSheet.create({
    notif: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
});