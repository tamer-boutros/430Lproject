import React, { useEffect, useState } from 'react'
import '../App.css'
import './Predictions.css'
import { BiTimeFive } from 'react-icons/bi'
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

const Predictions = () => {


    let [predictionDays, setPredictionDays] = useState(3);//prediction days inputed by the user
    let [bestBuyTime, setBestBuyTime] = useState();//best time to buy to be displayed
    let [bestSellTime, setBestSellTime] = useState();//best time to sell to be displayed
    let [futureBuy, setFutureBuy] = useState();//future buy usd predicted rates to be diplayed on the graph
    let [futureSell, setFutureSell] = useState();//future sell usd predicted rates to be diplayed on the graph
    //used ApexCharts: https://apexcharts.com/react-chart-demos/line-charts/basic/
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
                text: "Future Buy",
                align: 'left',
                style: {
                    color: '#ffffff' // set the color of the title to white
                }
            },
        },
        series: [
            {
                name: "Future Buy",
                data: [0, 0, 0]
            }
        ]
    });//chart data buy
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
                text: "Future Sell",
                align: 'left',
                style: {
                    color: '#ffffff' // set the color of the title to white
                }
            },
        },
        series: [
            {
                name: "Future Sell",
                data: [0, 0, 0]
            }
        ]
    });//chart data sell

    //from material ui
    const [tabValue, setTabValue] = useState(chartDataBuy);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    //function to fetch best time to buy and to sell
    function fetchBestTime() {
        fetch(`${SERVER_URL}/best_time`)
            .then(response => response.json())
            .then(data => {
                setBestBuyTime(data.best_buy_time);
                setBestSellTime(data.best_sell_time);
            });
    }
    useEffect(fetchBestTime, []);

    //function to fetch the predicted buy and sell rates
    function fetchPrediction() {
        fetch(`${SERVER_URL}/predict/${predictionDays}`)
            .then(response => response.json())
            .then(data => {
                setFutureBuy(data['future_buy']);
                setFutureSell(data['future_sell']);
            });
    }
    useEffect(fetchPrediction, [predictionDays]);

    //function to update the graphs given the number of days
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
                        categories: futureBuy.map(item => item.date),
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
                        text: "Future Buy",
                        align: 'left',
                        style: {
                            color: '#ffffff' // set the color of the title to white
                        }
                    },
                },
                series: [
                    {
                        name: "Future Buy",
                        data: futureBuy.map(item => item.value)
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
                        categories: futureSell.map(item => item.date),
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
                        text: "Future Sell",
                        align: 'left',
                        style: {
                            color: '#ffffff' // set the color of the title to white
                        }
                    },
                },
                series: [
                    {
                        name: "Future Sell",
                        data: futureSell.map(item => item.value)
                    }
                ]
            }
        )
    }

    return (
        <div id="predictions" className='wrapper'>
            <Typography variant="h5">
                <span>Best Time to Buy and Sell</span>
                <Tooltip title="the following is a prediction section for the rates, and their best time to buy and sell: You can also enter a specific amount of days and see what would the rates look like">
                    <IconButton >
                        <AiOutlineInfoCircle className='icon_button_design' />
                    </IconButton>
                </Tooltip>
            </Typography>
            <div className="predictions__card">
                <article className='predictions__cards'>
                    <BiTimeFive className='predictions__icon' />
                    <h5>Best Time to Buy</h5>
                    <small>{bestBuyTime}</small>
                </article>
                <article className='predictions__cards'>
                    <BiTimeFive className='predictions__icon' />
                    <h5>Best Time to Sell</h5>
                    <small>{bestSellTime}</small>
                </article>
            </div>
            <div className="form-item">
                <TextField
                    InputLabelProps={{
                        style: { color: 'white' },
                    }}
                    InputProps={{
                        style: { color: 'white' },
                    }}
                    fullWidth
                    label="Prediction Days"
                    type="number"
                    value={predictionDays}
                    onChange={({ target: { value } }) => {
                        if (value<0 || value>366) {
                            setPredictionDays(3)
                        }
                        else{
                            setPredictionDays(value)
                        }
                    }}
                    inputProps={{
                        min: 0,
                      }}
                />
                <Button className='button' color="primary" variant="contained" onClick={updateGraph} style={{ marginTop: "20px", backgroundColor: "white", color: "#2c2c6c", fontWeight: "bold" }}>Fetch Predictions</Button>

            </div>
            <TabContext value={tabValue}>
                <TabList 
                    onChange={handleChange}
                    textColor="info"
                    indicatorColor="primary"
                    centered
                 >
                    <Tab label="Graph Buy Prediction" value="1" />
                    <Tab label="Graph Sell Prediction" value="2" />
                </TabList>
                <TabPanel value='1'>
                    <div className="predictions__chart__cards">
                        <Chart
                            options={chartDataBuy.options}
                            series={chartDataBuy.series}
                            type="line"
                        />

                    </div>
                </TabPanel>

                <TabPanel value='2'>
                    <div className="predictions__chart__cards">
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

export default Predictions