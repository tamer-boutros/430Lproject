import React, { useState } from 'react'
import '../App.css';
import { Typography, TextField, Button } from '@mui/material'
import './Platform.css'
import { DataGrid } from "@mui/x-data-grid";
import { getUserToken } from '../localStorage';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { IconButton } from '@mui/material';
import { Tooltip } from '@mui/material'
import { BiSearch } from 'react-icons/bi'
import {FaUserCircle} from 'react-icons/fa'

const Platform = () => {
    let userToken = getUserToken();
    let users = ['Mohamad', 'Ralph', 'Tamer'];
    const [filteredList, setFilteredList] = new useState(users);
    //from material ui
    const [tabValue, setTabValue] = useState("");

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        let updatedList = [...users];
        updatedList = updatedList.filter((item) => item.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
        setFilteredList(updatedList);
        console.log(searchTerm)
    };

    return (
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
                    </TabList>
                    <TabPanel value='1'>
                        <div className="platform__cards">
                            past transactions with your friends

                        </div>
                    </TabPanel>

                    <TabPanel value='2'>
                        <div className="platform__cards">
                            no friends
                        </div>
                    </TabPanel>

                    <TabPanel value='3'>
                        <div className="platform__cards">
                            <TextField
                                fullWidth
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={({ target: { value } }) => {
                                    setSearchTerm(value)
                                    if (!value) {
                                        setFilteredList(users)
                                    }
                                    else{
                                        handleSearch()
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
                                    {filteredList.map((item) => (
                                        <li className='users__cards'>
                                            <FaUserCircle className='icon'/>
                                            <span>
                                                {item}
                                            </span>
                                            <Button className='button'  variant="contained" size='small' style={{ backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold", width: "fit-content"}}>Add</Button>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </TabPanel>

                </TabContext>
            </div>
        )
    )
}

export default Platform