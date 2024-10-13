import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Button, TextInput } from 'react-native'
import Userinfo from '../../components/userinfo';
//import escapeStringRegexp from "escape-string-regexp";
import {getUsers} from '../../api/db';

const search = () => {
    // plot
    return (
        <></>
        // <>
        //     <View style = {styles.header}>
        //         <TextInput
        //             style = {styles.input}
        //             value = {inputValue} 
        //             onChangeText = {handleInputChange}
        //             //onChangeText={newValue => this.setState({textValue: newValue})}
        //         />
        //         <View style = {{ flexDirection: 'row'}}>
        //             <Button
        //                 onPress = {onPressPost}
        //                 title = "Post"
        //                 //color = "blue"
        //                 accessibilityLabel="Learn more about this button"
        //             />
                    
        //             <Button
        //                 onPress = {onPressPeople}
        //                 title = "People"
        //                 //color = "blue"
        //                 accessibilityLabel = "Learn more about this button"
        //             />
        //         </View>
        //     </View>

        //     <ShowList />
            
        // </>
    );
}


export default search;


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
        height: 160,
        alignItems: 'center', 
        justifyContent: 'center'
    },

});

/*
export default function search2(){
    const [showPostList, setShowPostList] = useState(postList)
    const [inputValue, setInputValue] = useState()

    // 検索欄への入力値をハンドリング
    const handleInputChange = (e) => {
        setInputValue(e.target.value)
        search(e.target.value)
    }

    // 検索欄への入力値での絞り込み
    const search = (value) => {
        // 検索欄への入力が空の場合は早期return
        if (value === "") {
            setShowPosts(postList);
            return;
        }

        const serchedPostList = postList.filter(
            (post) =>
            Object.values(post).filter(
                (item) =>
                item !== undefined &&
                item !== null &&
                item.toUpperCase().indexOf(value.toUpperCase()) !== -1
            ).length > 0
        );

        setShowPosts(serchedPostList);
    }

    // plot
    return (  
        <>
        <div>
            <h4>Search</h4>
            <input type="text" value={inputValue} onChange={handleInputChange} />
        </div> 

        {showPostList.map((post, index) => {
        return (
            <div key={post.title}>
                <p>
                    {index + 1}. {post.title}
                </p>
                <p>category:{post.category}</p>
            </div>
        );
        })}
        
        <ScrollView>
        {postList.map((postItem) => {
            return (
                <Post
                key={postItem.id}            
                userId={postItem.userId}
                content={postItem.post}
            />
            )
        })}
        </ScrollView> 
        </>
    );
}

//export default search;


*/






/*
export default function App() {
    // ユーザーの入力キーワードをState化する
    const [searchKeyword, updateSearchKeyword] = React.useState("");
    
    // 入力イベントに反応してStateを更新する
    const onInput = (event: React.FormEvent<HTMLInputElement>) => {
      // 入力キーワードをstateに格納する
        updateSearchKeyword(event.currentTarget.value);
    };

    const filteredList = postList.filter((item) => {
        // ユーザー入力を安全に正規表現にする（このときすべて小文字化で正規化する）
        const escapedText = escapeStringRegexp(searchKeyword.toLowerCase());
        // 小文字で比較して部分一致するものだけを残す
        return new RegExp(escapedText).test(item.toLowerCase());
    });

    // あとはただ表示するだけ
    return (
        <div className="App">
            <h1>Simple keyword search</h1>
            <div>
                <label htmlFor="search-keyword">Search</label>
                <input
                    id="search-keyword"
                    type="text"
                    onInput={onInput}
                    placeholder={"input search keyword"}
                />
            </div>
        <ul className="list">
            {filteredList.map((item) => {
                return <li key={item}>{item}</li>;
            })}
        </ul>
        </div>
    );
}
*/
/*
const search = () => {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>

            <Text>search</Text>
        </View>
    );
}

export default search;
*/