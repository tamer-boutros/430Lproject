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
import { FaUserCircle } from 'react-icons/fa'
import RequestTransactions from './RequestTransactions';
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Pagination from '@mui/material/Pagination';



var SERVER_URL = "http://127.0.0.1:5000"



const Platform = ({ userToken }) => {
    let users = [];
    let friends = [];
    let [filteredListUsers, setfilteredListUsers] = new useState(users);
    let [filteredListFriends, setfilteredListFriends] = new useState(friends);
    let [tabValue, setTabValue] = useState("");
    let [incomingFriendRequests, setIncomingFriendRequests] = useState(['ali'])
    let [outgoingFriendRequests, setOutgoingFriendRequests] = useState([])
    let [searchTermUsers, setsearchTermUsers] = useState("");
    let [searchTermFriends, setsearchTermFriends] = useState("");
    const States = {
        RECORDING: "RECORDING",
        CLOSING: "CLOSING",
        PENDING: "PENDING",
    };
    let [transDialogState, settransDialogState] = useState(States.PENDING);
    let [recipientName, setRecipientName] = useState("")
    let [transaction_requests, setTransactionRequests] = useState([])
    let [paginationCountUsers, setPaginationCountUsers] = useState(10)
    let [paginatedListUsers, setPaginatedListUsers] = useState([{user_name: "Not Available"}])
    let [paginationCountFriends, setPaginationCountFriends] = useState(10)
    let [paginatedListFriends, setPaginatedListFriends] = useState([{user_name: "Not Available"}])


    function handlePaginatedListUsers(pageNumber) {
        let startIndex = (pageNumber-1)*5
        let endIndex = pageNumber*5>filteredListUsers.length?filteredListUsers.length:pageNumber*5
        let newListUsers = filteredListUsers.slice(startIndex, endIndex);
        setPaginatedListUsers(newListUsers)
        paginatedListUsers = newListUsers
    }
    useEffect(handlePaginatedListUsers, [userToken]);

    function handlePaginatedListFriends(pageNumber) {
        let startIndex = (pageNumber-1)*3
        let endIndex = pageNumber*3>filteredListFriends.length?filteredListFriends.length:pageNumber*3
        let newListFriends = filteredListFriends.slice(startIndex, endIndex);
        setPaginatedListFriends(newListFriends)
        paginatedListFriends = newListFriends
    }
    useEffect(handlePaginatedListFriends, [userToken]);


    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    function fetchUsers() {
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }
        fetch(`${SERVER_URL}/users/nonfriends`, {
            headers: header
        })
            .then(response => response.json())
            .then(data => {
                setfilteredListUsers(data)
                users = data
                filteredListUsers = data
                setPaginationCountUsers(Math.ceil(data.length/5))
                handlePaginatedListUsers(1)
            });
    }
    // useEffect(fetchUsers, [userToken, friendRequestAction, removeFriend]);
    useEffect(fetchUsers, [userToken]);


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
                filteredListFriends = data
                setPaginationCountFriends(Math.ceil(data.length/3))
                handlePaginatedListFriends(1)
            });
    }
    // useEffect(fetchFriends, [userToken, friendRequestAction, removeFriend]);
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
                incomingFriendRequests = data.filter(item => item.request_type === "incoming")
                outgoingFriendRequests = data.filter(item => item.request_type === "outgoing")
            });
    }
    // useEffect(fetchFriendRequests, [userToken, friendRequestAction]);
    useEffect(fetchFriendRequests, [userToken]);


    function friendRequestAction(answer, senderName) {
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
                fetchFriendRequests();
                fetchFriends();
                fetchUsers();
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
                fetchFriends();
                fetchUsers();
            })
            .catch((err) => {
                console.error("something went wrong while removing this friend");//error
            });
    }

    function recordTransaction(recipient_username, usd_amount, lbp_amount, usd_to_lbp) {
        settransDialogState(States.PENDING)
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }
        let transaction = {
            recipient_username: recipient_username,
            usd_amount: usd_amount,
            lbp_amount: lbp_amount,
            usd_to_lbp: usd_to_lbp
        }

        fetch(`${SERVER_URL}/transaction_request`, {
            method: "POST",
            headers: header,
            body: JSON.stringify(transaction),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);//success
            })
            .catch((err) => {
                console.error("something went wrong while doing this transaction");//error
            });
    }

    function fetchTransactionRequests() {
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }
        fetch(`${SERVER_URL}/get_transaction_requests`, {
            headers: header
        })
            .then(response => response.json())
            .then(data => {
                setTransactionRequests(data)
            });
    }
    // useEffect(fetchTransactionRequests, [userToken, recordTransactionAction]);
    useEffect(fetchTransactionRequests, [userToken]);


    function recordTransactionAction(answer, transactionRequestId) {
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }
        let status = {
            status: answer
        }
        fetch(`${SERVER_URL}/transaction_request/${transactionRequestId}`, {
            method: "POST",
            headers: header,
            body: JSON.stringify(status),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);//success
                fetchTransactionRequests();
            })
            .catch((err) => {
                console.error("something went wrong while sending the answer of the transaction request");//error
            });
    }


    const handleSearchUsers = () => {
        let updatedList = [...filteredListUsers];
        updatedList = updatedList.filter((item) => item.user_name.toLowerCase().indexOf(searchTermUsers.toLowerCase()) !== -1);
        setPaginatedListUsers(updatedList);
    };

    const handleSearchFriends = () => {
        let updatedListFriends = [...filteredListFriends];
        updatedListFriends = updatedListFriends.filter((item) => item.user_name.toLowerCase().indexOf(searchTermFriends.toLowerCase()) !== -1);
        setPaginatedListFriends(updatedListFriends);
    };

    const handleAddUser = (user) => {
        let header = { "Content-Type": "application/json" };
        if (userToken) {
            header["Authorization"] = `Bearer ${userToken}`;
        }
        let friendToAdd = {
            friend_name: user.user_name,
        }
        fetch(`${SERVER_URL}/users/add_friend`, {
            method: "POST",
            headers: header,
            body: JSON.stringify(friendToAdd),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);//success
                fetchUsers()
                fetchFriendRequests()
            })
            .catch((err) => {
                console.error("something went wrong while sending the add user request");//error
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
                            Transaction Requests
                            <div className='platform__cards'>
                                <ol>
                                    {transaction_requests.map((item) => (
                                        <div>
                                        { item.status !=="rejected" ?
                                        (<li className='users__cards'>
                                            <FaUserCircle className='icon' />
                                            <span>
                                                {item.sender_id}
                                            </span>
                                            <span>
                                                {item.usd_amount}$
                                            </span>
                                            <span>
                                                {item.lbp_amount}L.L
                                            </span>
                                            <span>
                                                {item.usd_to_lbp ? "USD to LBP" : "LBP to USD"}
                                            </span>
                                            <div className='friends__buttons'>
                                            { item.status !== "accepted"?
                                                <div>
                                                    <Button className='button' onClick={() => { recordTransactionAction("accepted", item.trans_req_id) }} variant="contained" size='small' style={{ backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold", width: "fit-content", marginInline: "4px" }}>Accept</Button>
                                                    <Button className='button' onClick={() => { recordTransactionAction("rejected", item.trans_req_id) }} variant="contained" size='small' style={{ backgroundColor: "red", color: 'white', fontWeight: "bold", width: "fit-content" }}>Reject</Button>
                                                </div>: <></>
                                            }
                                            </div>
                                        </li>):<></>}</div>
                                    ))}
                                </ol>
                            </div>

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
                                    else {
                                        handleSearchFriends()
                                    }
                                }}
                                InputProps={{
                                    startAdornment: <BiSearch className='icon' />,
                                    style: { color: 'white' },
                                }}
                                InputLabelProps={{
                                    style: { color: 'white' },
                                }}

                            />
                            <div>
                                <ol>
                                    {paginatedListFriends.map((item) => (
                                        <li className='users__cards'>
                                            <FaUserCircle className='icon' />
                                            <span>
                                                {item.user_name}
                                            </span>
                                            <div className='friends__buttons'>
                                                <Button className='button' variant="contained" size='small' onClick={() => { setRecipientName(item.user_name); settransDialogState(States.RECORDING) }} style={{ backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold", width: "fit-content", marginInline: "4px" }}>Record</Button>
                                                <Button className='button' variant="contained" size='small' onClick={() => { removeFriend(item.id); fetchFriends() }} style={{ backgroundColor: "red", color: 'white', fontWeight: "bold", width: "fit-content" }}>Remove</Button>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <Pagination count={paginationCountFriends} color="primary" className='pagination' 
                                onChange={(event,pageNumber)=> {
                                    handlePaginatedListFriends(pageNumber)
                                }} />
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
                                    else {
                                        handleSearchUsers()
                                    }
                                }}
                                InputProps={{
                                    startAdornment: <BiSearch className='icon' />,
                                    style: { color: 'white' },
                                }}
                                InputLabelProps={{
                                    style: { color: 'white' },
                                }}

                            />
                            <div>
                                <ol>
                                    {paginatedListUsers.map((item) => (
                                        <li className='users__cards'>
                                            <FaUserCircle className='icon' />
                                            <span>
                                                {item.user_name}
                                            </span>
                                            <Button className='button' variant="contained" size='small' onClick={() => { handleAddUser(item) }} style={{ backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold", width: "fit-content" }}>Add</Button>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <Pagination count={paginationCountUsers} color="primary" className='pagination' 
                                onChange={(event,pageNumber)=> {
                                    handlePaginatedListUsers(pageNumber)
                                }} />
                        </div>
                    </TabPanel>
                    <TabPanel value='4'>
                        <div className="platform__cards">
                            incoming friend requests
                            <div className='platform__cards'>
                                <ol>
                                    {incomingFriendRequests.map((item) => (
                                        <li className='users__cards'>
                                            <FaUserCircle className='icon' />
                                            <span>
                                                {item.user_name}
                                            </span>
                                            <div className='friends__buttons'>
                                                <Button className='button' variant="contained" onClick={() => { friendRequestAction("accepted", item.user_name); }} size='small' style={{ backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold", width: "fit-content", marginInline: "4px" }}>Accept</Button>
                                                <Button className='button' variant="contained" onClick={() => { friendRequestAction("rejected", item.user_name); }} size='small' style={{ backgroundColor: "red", color: 'white', fontWeight: "bold", width: "fit-content" }}>Reject</Button>
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
                                            <FaUserCircle className='icon' />
                                            <span>
                                                {item.user_name}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                        </div>
                    </TabPanel>

                </TabContext>
                <RequestTransactions
                    open={transDialogState === States.RECORDING}
                    onClose={() => settransDialogState(States.CLOSING)}
                    onSubmit={recordTransaction}
                    recipientName={recipientName}
                />
                <Snackbar
                    elevation={6}
                    variant="filled"
                    open={transDialogState === States.PENDING}
                    autoHideDuration={2000}
                    onClose={() => settransDialogState(States.CLOSING)}
                >
                    <Alert severity="success">Success</Alert>
                </Snackbar>
            </div>
        )
    }</div>
    )
}

export default Platform