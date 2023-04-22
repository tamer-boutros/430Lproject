import React from 'react'
import ExchangeRates from './exchangeRates/ExchangeRates'
import Statistics from './statistics/Statistics'
import Predictions from './predictions/Predictions'
import RateGraphs from './rateGraphs/RateGraphs'

const App = () => {
  return (
    <div>
        <ExchangeRates/>
        <Statistics/>
        <Predictions/>
        <RateGraphs/>
    </div>
  )
}

export default App