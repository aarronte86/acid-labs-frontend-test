import React from 'react';

export default class CapitalWeatherInfo extends React.Component {
  render() {
    return (
      <div>
        <h3>{this.props.capitalName}</h3>

        {!this.props.capitalWeather ? (
          <p>The weather information couldn't be retrieved.</p>
        ) : (
          <div>
            <p>{this.props.capitalWeather.summary}</p>
            <p>{this.props.capitalWeather.temperature} F</p>
          </div>
        )}
      </div>
    );
  }
}
