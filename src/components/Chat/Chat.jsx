import React, {useEffect, useState} from 'react';
import Message from "../Message/Message";
import {db} from "../../firebase";
import {collection, getDocs, onSnapshot, addDoc} from "firebase/firestore";
import Spinner from "../Loading/Spinner";
import Iceberg from "../../assets/img/logo.png"
import UserDropdown from "../UserDropdown/UserDropdown";

const Chat = ({user}) => {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true)
    const messagesRef = collection(db, "messages");

    const handleOnSubmit = async e => {
        e.preventDefault();
        setNewMessage('')
        await addDoc(messagesRef, {
            text: newMessage,
            createdAt: new Date(),
            user: {
                displayName: user.displayName,
                photoURL: user.photoURL,
                uid: user.uid,
                emailVerified: user.emailVerified
            },
            isEdited: false,
            editMetadata: {}
        })

        document.getElementById('messagesUl').scrollTo(0, document.getElementById('messagesUl').scrollHeight)
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getDocs(messagesRef);
            await setMessages(data.docs.map(doc => ({...doc.data(), id: doc.id})))
            setLoading(false)
            document.getElementById('messagesUl').scrollTo(0, document.getElementById('messagesUl').scrollHeight)
        }
        fetchData()
    }, [])

    useEffect(() => {
        return onSnapshot(collection(db, "messages"), async (snapshot) => {
            await setMessages(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
            document.getElementById('messagesUl').scrollTo(0, document.getElementById('messagesUl').scrollHeight)
        });
    }, [])

    useEffect(() => {
        if (messages.length > 0) document.getElementById('messagesUl').scrollTo(0, document.getElementById('messagesUl').scrollHeight)
    }, [messages])

    if (loading) return <div className="flex justify-center items-center h-[100vh] w-full"><Spinner/></div>
    return (
        <div className="w-full lg:w-1/2 border-l-2 border-r-2 border-solid border-secondaryColor h-[100vh] mx-auto">
            <div className="flex flex-col h-full">
                <div className="overflow-auto h-full" id="messagesUl">
                    <div className="py-4 max-w-screen-lg mx-auto">
                        <div
                            className="border-b dark:border-gray-600 border-gray-200 py-8 mb-4 flex flex-col justify-center">
                            <div className="font-bold text-3xl text-center">

                                <p className="mb-1 text-gray-300 font-thin">Welcome to</p>
                                <span className="flex justify-center gap-2">
                                    <img src={Iceberg} alt="Iceberg Logo" className="w-8 h-8"/>
                                    <p className="mb-3 text-gray-300 font-bold">Iceberg</p>
                                </span>
                            </div>
                            <p className="text-gray-500 text-center">
                                This is the beginning of this chat.
                            </p>
                        </div>
                        <ul>
                            {
                                loading ? <div className="flex justify-center items-center"><Spinner/></div>
                                    :
                                    messages
                                        ?.sort((first, second) =>
                                            first?.createdAt?.seconds <= second?.createdAt?.seconds ? -1 : 1
                                        )
                                        ?.map(message => (
                                            <li key={message.id}>
                                                <Message message={message} uid={user?.uid}/>
                                            </li>
                                        ))}
                        </ul>
                    </div>
                </div>
                <div className="mb-6 mx-4 flex items-center gap-4">
                    <UserDropdown user={user}/>
                    <form onSubmit={handleOnSubmit}
                          className="flex flex-row w-full bg-secondaryColor text-white rounded-md px-4 py-3 z-10 max-w-screen-lg mx-auto shadow-md">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-1 bg-transparent outline-none"/>
                        <button
                            type="submit"
                            disabled={!newMessage}
                            className="font-semibold cursor-pointer text-lg text-thirdColor transition-colors disabled:text-gray-500 disabled:cursor-not-allowed">
                            <i className="fa-solid fa-paper-plane"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
