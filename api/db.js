import { db } from "../firebase";
import { collection, getDocs, setDoc, query, orderBy, limit, getDoc, doc, where, startAt, endAt } from "firebase/firestore";
import * as geofire from "geofire-common";

export async function saveUserLocations(myId, mycoords){
    // editing  set勝手に上書き　追加はできない　なんか引数あったはず
    const hash = geofire.geohashForLocation([mycoords.latitude, mycoords.longitude]);
    const data = {
        geohash:hash,
        updated_at:new Date(),
        coords:mycoords,
        public:true//固定となってしまっている。
    };
    try{
        const locationRef = doc(collection(db, "userlocations"), myId);
        await setDoc(locationRef, data);

    }catch(err){
        console.log('Error firestore add'+ JSON.stringify(err))
    };
    return null
};

export async function getUserCoords(uid, mycoords){
	const coords = await getDoc(doc(db, "userlocations", uid)).data().coords;
    if (coords == null){console.log("Err: No Coords Data");return null};
    const dist = geofire.distanceBetween([coords.latitude, coords.longitude], [mycoords.latitude, mycoords.longitude]);
    return {id: uid, dist: dist, coords: coords};
}

export async function getUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    const userList = querySnapshot.docs.map((doc) => {
        return { id: doc.id, name: doc.data().name, bio: doc.data().bio };
    });
    return userList;
}
export async function getAroundUsers(myId, mycoords) {
    const n_optimal = 10.0; // 理想的な表示するユーザ数
    const rate_tolerance = 0.5; // 許容する誤差率 0.1->10%
    const n_tolerance = n_optimal * rate_tolerance;
    const n_min = n_optimal - n_tolerance;
    const n_max = n_optimal + n_tolerance;    
    const center = [mycoords.latitude, mycoords.longitude];  
    const MAX_LOOP = 5; 

    const getUsersByGeohash = async (center, radiusInM) => { // geohashを用いて周辺のユーザを取得
        const bounds = geofire.geohashQueryBounds(center, radiusInM);
        const promises = [];
        for (const b of bounds) {
            const q = query(
                collection(db, 'userlocations'),
                orderBy('geohash'),
                startAt(b[0]),
                endAt(b[1]));
            promises.push(getDocs(q));
        }
        const snapshots = await Promise.all(promises);

        const matchingDocs = [];
        for (const snap of snapshots) { // 偽陽性と自分自身を消す
            for (const doc of snap.docs) {
                const lat = doc.get('coords.latitude');
                const lng = doc.get('coords.longitude');
                const distanceInM = geofire.distanceBetween([lat, lng], center) * 1000;
            if (distanceInM <= radiusInM && doc.id != myId) {
                    matchingDocs.push(doc);
                }
            }
        }
        return matchingDocs;
    };

    let r = 5000; // 半径[m]
    let users = [];
    let count = 0;
    while (true) {
        count++;
        users = await getUsersByGeohash(center, r);
        if (count > MAX_LOOP ) {
            console.log("too many re-search in getAroundUsers()");
            break;
        }
        if( users.length > n_max ){
            break;
        }
        r = r * Math.sqrt(n_optimal / (users.length+1));
    }   

    let userlocations = users.map(userItem => {
        let userloc = userItem.data();
        userloc["id"] = userItem.id;
        userloc["dist"] = geofire.distanceBetween([userloc.coords.latitude, userloc.coords.longitude], center) * 1000;
        return userloc;
    })
    if(userlocations.length > n_max){ // 1/10ずつ半径を減らす
        while(true){
            if(userlocations.length <= n_max) break;
            r = 0.9 * r;
            userlocations = userlocations.filter((userItem)=>{
                return userItem.dist <= r;
            });
        }
    }

    return userlocations;
}

export async function getUserinfo(uid) {
    const docSnap = await getDoc(doc(db, "users", uid));
    let useri = docSnap.data();
    useri["id"] = docSnap.id;
    return useri;
}


export function getNotificationsByUserId(myId) {
    const notificationList = [
        { id: 1, resieverId: 1, postId: 3, responsorId: 2, response: "favorite" },
        { id: 2, resieverId: 1, postId: 5, responsorId: 3, response: "reply" },
        { id: 3, resieverId: 1, postId: -1, responsorId: 2, response: "follow" },
        { id: 4, resieverId: 3, postId: 4, responsorId: 2, response: "favorite" },
        { id: 5, resieverId: 3, postId: 6, responsorId: 2, response: "favorite" },
        { id: 6, resieverId: 3, postId: 7, responsorId: 1, response: "repost" },
        { id: 7, resieverId: 2, postId: 1, responsorId: 1, response: "favorite" },
        { id: 8, resieverId: 2, postId: 2, responsorId: 3, response: "favorite" },
        { id: 9, resieverId: 1, postId: 13, responsorId: 2, response: "favorite" },
        { id: 10, resieverId: 1, postId: 13, responsorId: 2, response: "favorite" },
        { id: 11, resieverId: 1, postId: 12, responsorId: 3, response: "repost" },
        { id: 12, resieverId: 1, postId: 12, responsorId: 3, response: "reply" },
        { id: 13, resieverId: 1, postId: 14, responsorId: 2, response: "favorite" },
        { id: 14, resieverId: 1, postId: 3, responsorId: 2, response: "reply" },
        { id: 15, resieverId: 2, postId: 8, responsorId: 3, response: "favorite" },
        { id: 16, resieverId: 2, postId: 8, responsorId: 1, response: "favorite" },
    ];
    let myNotif = notificationList.filter((notifItem) => {
        return notifItem.resieverId == myId;
    });
    myNotif.map((notifItem) => {
        notifItem["responsorName"] = getUsers().find(user => user.id == notifItem.responsorId).name;
        delete notifItem.resieverId;
    });
    return myNotif;
}

export function getUserPositions() {
    const userMapList = [
        { id: 1, name: "takeki", latitude: 35.681236, longitude: 139.767125, active: true },
        { id: 2, name: "shuma", latitude: 35.661236, longitude: 139.750000, active: false },
        { id: 3, name: "hiroki", latitude: 35.671236, longitude: 139.777125, active: true },
    ];
    return userMapList;
}

export async function getChatRoomsByUserId(myId) {
    // return [ {string id, string owner_id, bool public, string first_message, string last_message, int likes, int viewers, int remarkers}, ..., {...} ]
    // myIdのユーザから見えるルームだけを返す
    // 後で実装　-> 距離によって返すルームを変える
    const rooms_qss = await getDocs(collection(db, "rooms"));
    let roomList = await Promise.all(
        rooms_qss.docs.map(async (doc) => {
            let q, messages_qss, participants_qss, remarkers_qss, first_m, last_m;
            q = query(collection(db, doc.ref.path, "messages"), orderBy("created_at"), limit(1));
            messages_qss = await getDocs(q);
            first_m = messages_qss.docs[0].data().content;
            q = query(collection(db, doc.ref.path, "messages"), orderBy("created_at", "desc"), limit(1));
            messages_qss = await getDocs(q);
            last_m = messages_qss.docs[0].data().content;

            participants_qss = await getDocs(collection(db, doc.ref.path, "participants"));
            q = query(collection(db, doc.ref.path, "participants"), where("likes", "==", true));
            likes_qss = await getDocs(q);
            q = query(collection(db, doc.ref.path, "participants"), where("remarks_count", ">", 0));
            remarkers_qss = await getDocs(q);
            if (first_m === last_m) {
                last_m = "(まだ返信はありません)";
            }
            return { id: doc.id, owner_id: doc.data().owner, public: doc.data().public, first_message: first_m, last_message: last_m, likes: likes_qss.docs.length, viewers: participants_qss.docs.length, remarkers: remarkers_qss.docs.length };
        })
    );


    const bits = await Promise.all(
        roomList.map(async (room)=>{
            const user_qss = await getDoc(doc(db, "rooms", room.id, "participants", myId));
            return user_qss.exists() || room.public;
        })
    )
    roomList = roomList.filter(i => bits.shift()) // 自分が参加しているもの or パブリックのみ表示

    return roomList;
}

// [ {int id, int senderId, string content}, ..., {...} ]
export async function getMessagesByRoomId(roomId) {
    const messages_qss = await getDocs(query(collection(db, "rooms", roomId, "messages")), orderBy("created_at", "desc"));
    const messageList = messages_qss.docs.map((doc) => {
        return { id: doc.id, sender_id: doc.data().sender, content: doc.data().content, created_at: doc.data().created_at.toDate() };
    });
    return messageList;
}


// [ {id, likes, remarks_count, last_checked}, ..., {} ]
export async function getParticipants(roomId) {
    const participants_qss = await getDocs(collection(db, "rooms", roomId, "participants"));
    const participantsList =
        participants_qss.docs.map((doc) => {
            return { id: doc.id, remarks_count: doc.data().remarks_count }; //ownerは未実装
        });
    console.log(participantsList);
    return participantsList;
}

