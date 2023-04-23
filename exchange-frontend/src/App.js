import React from 'react'
import ExchangeRates from './exchangeRates/ExchangeRates'
import Statistics from './statistics/Statistics'
import Predictions from './predictions/Predictions'
import RateGraphs from './rateGraphs/RateGraphs'
import Platform from './Platform/Platform'

const App = () => {
  return (
    <div>
        <ExchangeRates/>
        <Statistics/>
        <Predictions/>
        <RateGraphs/>
        <Platform/>
    </div>
  )
}

export default App