import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Link } from "expo-router";

// Userinfoコンポーネント
/*
1つのユーザー情報を表示するコンポーネント。
ユーザー検索の画面などで使用する。
プロフィールへのリンクを持つ。

propsは
userId: ユーザーのid(整数)
userName: ユーザーの名前(文字列)
bio: 自己紹介(文字列)
*/

const userinfo = props => {
    return (
        <View style={styles.userinfo}>
            {/* <Image> */}
            <Link href={{ pathname: '/main/home/user', params: { id: props.userId } }}>{props.userName}</Link> 
            <Text>{props.bio}</Text>
            {/* フォロワー数などを追加予定 */}
        </View>
    );
}


export default userinfo;


const styles = StyleSheet.create({
    userinfo: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
});