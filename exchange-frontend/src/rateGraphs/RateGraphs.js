import React, { useEffect, useState } from 'react'
import '../App.css'
import './RateGraphs.css'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { Button } from '@mui/material'
import Chart from "react-apexcharts";
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { IconButton } from '@mui/material';
import { Tooltip } from '@mui/material'
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

var SERVER_URL = "http://127.0.0.1:5000"

const RateGraphs = () => {


    let [graphDays, setgraphDays] = useState(3);
    let [pastBuy, setpastBuy] = useState();
    let [pastSell, setpastSell] = useState();
    const [chartDataBuy, setChartDataBuy] = useState({
        options: {
            chart: {
                id: "basic-line",
                foreColor: "#ffffff",
                background: "#2c2c6c",
            },
            tooltip: {
                theme: 'dark',
                style: {
                    colors: ['#ffffff'],
                },
            },
            xaxis: {
                categories: [1, 2, 3],
                labels: {
                    style: {
                        colors: "#ffffff"
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#ffffff"
                    }
                }
            },
            title: {
                text: "Rates Buy",
                align: 'left',
                style: {
                    color: '#ffffff' // set the color of the title to white
                }
            },
        },
        series: [
            {
                name: "Rates Buy",
                data: [0, 0, 0]
            }
        ]
    });
    const [chartDataSell, setChartDataSell] = useState({
        options: {
            chart: {
                id: "basic-line",
                foreColor: "#ffffff",
                background: "#2c2c6c",
            },
            tooltip: {
                theme: 'dark',
                style: {
                    colors: ['#ffffff'],
                },
            },
            xaxis: {
                categories: [1, 2, 3],
                labels: {
                    style: {
                        colors: "#ffffff"
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#ffffff"
                    }
                }
            },
            title: {
                text: "Rates Sell",
                align: 'left',
                style: {
                    color: '#ffffff' // set the color of the title to white
                }
            },
        },
        series: [
            {
                name: "Rates Sell",
                data: [0, 0, 0]
            }
        ]
    });
    //from material ui
    const [tabValue, setTabValue] = useState(chartDataBuy);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    function fetchRates() {
        fetch(`${SERVER_URL}/getrates/${graphDays}`)
            .then(response => response.json())
            .then(data => {
                setpastBuy(data['avg_buy']);
                setpastSell(data['avg_sell']);
                console.log(graphDays)
            });
    }
    useEffect(fetchRates, [graphDays]);


    function updateGraph() {
        setChartDataBuy(
            {
                options: {
                    chart: {
                        id: "basic-line",
                        foreColor: "#ffffff",
                        background: "#2c2c6c",
                    },
                    tooltip: {
                        theme: 'dark',
                        style: {
                            colors: ['#ffffff'],
                        },
                    },
                    xaxis: {
                        categories: pastBuy.map(item => item.date),
                        labels: {
                            style: {
                                colors: "#ffffff"
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            style: {
                                colors: "#ffffff"
                            }
                        }
                    },
                    title: {
                        text: "Rates Buy",
                        align: 'left',
                        style: {
                            color: '#ffffff' // set the color of the title to white
                        }
                    },
                },
                series: [
                    {
                        name: "Rates Buy",
                        data: pastBuy.map(item => item.value)
                    }
                ]
            }
        )
        setChartDataSell(
            {
                options: {
                    chart: {
                        id: "basic-line",
                        foreColor: "#ffffff",
                        background: "#2c2c6c",
                    },
                    tooltip: {
                        theme: 'dark',
                        style: {
                            colors: ['#ffffff'],
                        },
                    },
                    xaxis: {
                        categories: pastSell.map(item => item.date),
                        labels: {
                            style: {
                                colors: "#ffffff"
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            style: {
                                colors: "#ffffff"
                            }
                        }
                    },
                    title: {
                        text: "Rates Sell",
                        align: 'left',
                        style: {
                            color: '#ffffff' // set the color of the title to white
                        }
                    },
                },
                series: [
                    {
                        name: "Rates Sell",
                        data: pastSell.map(item => item.value)
                    }
                ]
            }
        )
    }

    return (
        <div id="graphRates" className='wrapper'>
            <Typography variant="h5">
                <span>Buy and Sell Rates</span>
                <Tooltip title="the following is a section that graphs the different Buy and Sell rates over the entered amount of days">
                    <IconButton >
                        <AiOutlineInfoCircle className='icon_button_design' />
                    </IconButton>
                </Tooltip>
            </Typography>
            
            <div className="form-item">
                <TextField
                    InputLabelProps={{
                        style: { color: 'white' },
                    }}
                    InputProps={{
                        style: { color: 'white' },
                    }}
                    fullWidth
                    label="Graph Days"
                    type="number"
                    value={graphDays}
                    onChange={({ target: { value } }) => {
                        if (value<0) {
                            setgraphDays(10)
                        }
                        else{
                            setgraphDays(value)
                        }
                    }}
                    inputProps={{
                        min: 0,
                      }}
                />
                <Button className='button' color="primary" variant="contained" onClick={updateGraph} style={{ marginTop: "20px", backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold" }}>Fetch Rates</Button>

            </div>
            <TabContext value={tabValue}>
                <TabList 
                    onChange={handleChange}
                    textColor="info"
                    indicatorColor="primary"
                    centered
                 >
                    <Tab label="Graph Buy Rates" value="1" />
                    <Tab label="Graph Sell Rates" value="2" />
                </TabList>
                <TabPanel value='1'>
                    <div className="rates__chart__cards">
                        <Chart
                            options={chartDataBuy.options}
                            series={chartDataBuy.series}
                            type="line"
                        />

                    </div>
                </TabPanel>

                <TabPanel value='2'>
                    <div className="rates__chart__cards">
                        <Chart
                            options={chartDataSell.options}
                            series={chartDataSell.series}
                            type="line"
                        />
                    </div>
                </TabPanel>

            </TabContext>
        </div>
    )
}

export default RateGraphs