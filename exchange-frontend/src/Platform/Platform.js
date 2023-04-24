import React, { useState, useEffect } from 'react'
import '../App.css';
import { Typography, TextField, Button } from '@mui/material'
import './Platform.css'
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { IconButton } from '@mui/material';
import { Tooltip } from '@mui/material'
import { BiSearch } from 'react-icons/bi'
import {FaUserCircle} from 'react-icons/fa'


var SERVER_URL = "http://127.0.0.1:5000"



const Platform = ({userToken}) => {
    let users = [];
    let friends = [];
    let [filteredListUsers, setfilteredListUsers] = new useState(users);
    let [filteredListFriends, setfilteredListFriends] = new useState(friends);
    let [tabValue, setTabValue] = useState("");
    let [incomingFriendRequests, setIncomingFriendRequests] =  useState([])
    let [outgoingFriendRequests, setOutgoingFriendRequests] =  useState([])
    let [searchTermUsers, setsearchTermUsers] = useState("");
    let [searchTermFriends, setsearchTermFriends] = useState("");

    

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
        //fetchUsers();
    };

    function fetchUsers() {
        fetch(`${SERVER_URL}/users`)
            .then(response => response.json())
            .then(data => {
                setfilteredListUsers(data)
                users = data
            });
    }
    useEffect(fetchUsers, []);

    function fetchFriends() {
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }
        fetch(`${SERVER_URL}/users/friends`, {
            headers: header
        })
            .then(response => response.json())
            .then(data => {
                setfilteredListFriends(data)
                friends = data
            });
    }
    useEffect(fetchFriends, [userToken]);

    function fetchFriendRequests() {
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }
        fetch(`${SERVER_URL}/users/friend_requests`, {
            headers: header
        })
            .then(response => response.json())
            .then(data => {
                setIncomingFriendRequests(data.filter(item => item.request_type === "incoming"))
                setOutgoingFriendRequests(data.filter(item => item.request_type === "outgoing"))
            });
    }
    useEffect(fetchFriendRequests, []);


    function friendRequestAction(answer,senderName){
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }
        let status = {
            status: answer
        }
        fetch(`${SERVER_URL}/users/request_action/${senderName}`, {
            method: "PUT",
            headers: header,
            body: JSON.stringify(status),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);//success
            })
            .catch((err) => {
                console.error("something went wrong while sending the request");//error
            });
    }

    function removeFriend(friendId) {
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }

        fetch(`${SERVER_URL}/users/remove_friend/${friendId}`, {
            method: "Delete",
            headers: header,
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);//success
            })
            .catch((err) => {
                console.error("something went wrong while removing this friend");//error
            });
    }


    const handleSearchUsers = () => {
        let updatedList = [...filteredListUsers];
        updatedList = updatedList.filter((item) => item.user_name.toLowerCase().indexOf(searchTermUsers.toLowerCase()) !== -1);
        setfilteredListUsers(updatedList);
    };

    const handleSearchFriends = () => {
        let updatedListFriends = [...filteredListFriends];
        updatedListFriends = updatedListFriends.filter((item) => item.user_name.toLowerCase().indexOf(searchTermFriends.toLowerCase()) !== -1);
        setfilteredListFriends(updatedListFriends);
    };

    const handleAddUser = (user) => {
        let header = { "Content-Type": "application/json" };
            if (userToken) {
                header["Authorization"] = `Bearer ${userToken}`;
            }
            let friendToAdd = {
                friend_name:user.user_name,
            }
            fetch(`${SERVER_URL}/users/add_friend`, {
                method: "POST",
                headers: header,
                body: JSON.stringify(friendToAdd),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);//success
                })
                .catch((err) => {
                    console.error("something went wrong while sending the request");//error
                });
    }

      
    
    return (<div>{
        userToken && (
            <div id="platform" className="wrapper">
                <Typography variant="h5">
                    <span>Platform</span>
                    <Tooltip title="the following is a platform where you are able to record transaction with your friends. The user can add a list of friends that can record transactions with him">
                        <IconButton >
                            <AiOutlineInfoCircle className='icon_button_design' />
                        </IconButton>
                    </Tooltip>
                </Typography>
                <TabContext value={tabValue}>
                    <TabList
                        onChange={handleChange}
                        textColor="info"
                        indicatorColor="primary"
                        centered
                    >
                        <Tab label="Transactions with Friends" value="1" />
                        <Tab label="My Friends" value="2" />
                        <Tab label="Add Friends" value="3" />
                        <Tab label="Friend Requests" value="4" />
                    </TabList>
                    <TabPanel value='1'>
                        <div className="platform__cards">
                            past transactions with your friends

                        </div>
                    </TabPanel>

                    <TabPanel value='2'>
                    <div className="platform__cards">
                            <TextField
                                fullWidth
                                placeholder="Search..."
                                value={searchTermFriends}
                                onChange={({ target: { value } }) => {
                                    setsearchTermFriends(value)
                                    if (value == "") {
                                        fetchFriends()
                                    }
                                    else{
                                        handleSearchFriends()
                                    }
                                }}
                                InputProps={{
                                    startAdornment: <BiSearch className='icon'/>,
                                    style: { color: 'white' },
                                }}
                                InputLabelProps={{
                                    style: { color: 'white' },
                                }}

                            />
                            <div>
                                <ol>
                                    {filteredListFriends.map((item) => (
                                        <li className='users__cards'>
                                            <FaUserCircle className='icon'/>
                                            <span>
                                                {item.user_name}
                                            </span>
                                            <div className='friends__buttons'>
                                            <Button className='button'  variant="contained" size='small' style={{ backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold", width: "fit-content", marginInline: "4px"}}>Record</Button>
                                            <Button className='button'  variant="contained" size='small' onClick={()=>{removeFriend(item.id); fetchFriends()}} style={{ backgroundColor: "red", color: 'white', fontWeight: "bold", width: "fit-content"}}>Remove</Button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel value='3'>
                        <div className="platform__cards">
                            <TextField
                                fullWidth
                                placeholder="Search..."
                                value={searchTermUsers}
                                onChange={({ target: { value } }) => {
                                    setsearchTermUsers(value)
                                    if (value === "") {
                                        fetchUsers()
                                    }
                                    else{
                                        handleSearchUsers()
                                    }
                                }}
                                InputProps={{
                                    startAdornment: <BiSearch className='icon'/>,
                                    style: { color: 'white' },
                                }}
                                InputLabelProps={{
                                    style: { color: 'white' },
                                }}

                            />
                            <div>
                                <ol>
                                    {filteredListUsers.map((item) => (
                                        <li className='users__cards'>
                                            <FaUserCircle className='icon'/>
                                            <span>
                                                {item.user_name}
                                            </span>
                                            <Button className='button'  variant="contained" size='small' onClick={() => {handleAddUser(item); handleChange(null,2)}} style={{ backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold", width: "fit-content"}}>Add</Button>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value='4'>
                        <div className="platform__cards">
                            incoming friend requests
                            <div className='platform__cards'>
                                <ol>
                                    {incomingFriendRequests.map((item) => (
                                        <li className='users__cards'>
                                            <FaUserCircle className='icon'/>
                                            <span>
                                                {item.user_name}
                                            </span>
                                            <div className='friends__buttons'>
                                            <Button className='button'  variant="contained" onClick={friendRequestAction("accepted",item.user_name)} size='small' style={{ backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold", width: "fit-content", marginInline: "4px"}}>Accept</Button>
                                            <Button className='button'  variant="contained" onClick={friendRequestAction("rejected",item.user_name)}size='small' style={{ backgroundColor: "red", color: 'white', fontWeight: "bold", width: "fit-content"}}>Reject</Button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            outgoing friend requests
                            <div className='platform__cards'>
                                <ol>
                                    {outgoingFriendRequests.map((item) => (
                                        <li className='users__cards'>
                                            <FaUserCircle className='icon'/>
                                            <span>
                                                {item.user_name}
                                            </span>
                                            <div className='friends__buttons'>
                                            <Button className='button'  variant="contained" size='small' style={{ backgroundColor: "red", color: 'white', fontWeight: "bold", width: "fit-content"}}>Remove</Button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                        </div>
                    </TabPanel>

                </TabContext>
            </div>
        )
                                    }</div>
    )
}

export default Platform