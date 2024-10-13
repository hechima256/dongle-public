import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Button, TextInput } from 'react-native'
import Notif from '../../components/notif';
import {getUsers, getNotificationsByUserId} from '../../api/db';

const notification = () => {
    const whoAmI = () => {
        return 1 // userId
    }

    const getContent = (postId) => {
        // follow用
        if (postId === -1) {
            return " "
        }
    }

    return (    
        <></>
        // <>
        
        //     <View style={styles.header}>
        //         <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        //             <Text>Notification</Text>
        //         </View>
        //     </View>

        //     <ScrollView>
        //         {getNotificationsByUserId(whoAmI()).map((notifItem) => {
        //             return (
        //                 //<View> key props Warningが出ないか確認
        //                     <Notif
        //                         key = {notifItem.id}
        //                         userId = {notifItem.responsorId}
        //                         userName = {getUsers().find(user => user.id == notifItem.responsorId).name}
        //                         response = {notifItem.response}
        //                         content = {getContent(notifItem.postId)}
        //                         /*
        //                         response:replyの場合のcontentは、reply先の投稿じゃなくてreply自体の内容の方がいいかもね
        //                         */
        //                     />
        //                 //</View>
        //             )
        //         })}
        //     </ScrollView> 
        // </>
    );
}


export default notification;


const styles = StyleSheet.create({
    input: {
        height: 35,
        width: 200,
        margin: 1,
        borderWidth: 1,
        padding: 10,
    },

    header: {
        backgroundColor: '#fff',  
        height: 100,
        alignItems: 'center', 
        justifyContent: 'center'
    },

});
