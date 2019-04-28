import React from 'react';

import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';

import LoadingOverlay from '../LoadingOverlay';
import CapitalWeatherInfo from './CapitalInfoWeather';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const BACKEND_API_BASE_URL = process.env.REACT_APP_BACKEND_API_BASE_URL;

class WeatherMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      capitalWeather: {}
    };
  }

  selectedCapitalName = () => `${this.state.countryCapital}, ${this.state.countryName}`;

  showInfoWindow = marker => {
    this.setState({
      showingInfoWindow: true,
      activeMarker: marker
    });
  };

  closeInfoWindow = () => {
    this.setState({
      showingInfoWindow: false,
      activeMarker: null
    });
  };

  onMarkerClick = (props, marker, e) => {
    this.showInfoWindow(marker);
  };

  onMapClick = async (props, map, e) => {
    this.closeInfoWindow();

    const selectedPlace = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    try {
      this.setState({ loading: true });

      const capitalData = await this.buildCountryCapitalDataFromPosition({
        selectedPlace
      });

      this.setState(state => ({ ...state, ...capitalData, loading: false }));
    } catch (error) {
      alert(
        'No capital could be found from the selected location. Please ensure to make click on a country.'
      );
    }
  };

  onInfoWindowClose = () => this.closeInfoWindow();

  buildCountryCapitalDataFromPosition = async ({ selectedPlace }) => {
    const externalFetchs = [
      this.fetchCountry,
      this.fetchCapital,
      this.fetchCapitalLatLng,
      this.fetchCapitalWeather
    ];

    const capitalData = await externalFetchs.reduce(async (fetchChain, currentFetch) => {
      const chainResult = await fetchChain;
      const currentResult = await currentFetch(chainResult);

      return { ...chainResult, ...currentResult };
    }, Promise.resolve({ selectedPlace }));

    return capitalData;
  };

  fetchCountry = ({ selectedPlace }) => {
    return this.googleMapsGeocoderPromisify({ latLng: selectedPlace }, result => {
      const countryAddressComponent = result.address_components.filter(address =>
        address.types.includes('country')
      )[0];

      return {
        countryCode: countryAddressComponent.short_name,
        countryName: countryAddressComponent.long_name
      };
    });
  };

  fetchCapital = async ({ countryCode }) => {
    const result = await fetch(`https://restcountries.eu/rest/v2/alpha/${countryCode}`);
    const countryData = await result.json();
    return { countryCapital: countryData.capital };
  };

  fetchCapitalLatLng = ({ countryCapital, countryName }) => {
    return this.googleMapsGeocoderPromisify(
      { address: `${countryCapital}, ${countryName}` },
      result => {
        return { capitalLocation: result.geometry.location };
      }
    );
  };

  fetchCapitalWeather = async ({ capitalLocation }) => {
    try {
      const result = await fetch(
        `${BACKEND_API_BASE_URL}/weather?latitude=${capitalLocation.lat()}&longitude=${capitalLocation.lng()}`
      );
      const capitalWeather = await result.json();

      return { capitalWeather };
    } catch (error) {
      this.setState({ weatherError: true });
    }
  };

  googleMapsGeocoderPromisify(request, resultHandler) {
    const geocoder = new this.props.google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode(request, (results, status) => {
        if (status === this.props.google.maps.GeocoderStatus.OK) {
          const result = results[0];

          resolve(resultHandler(result));
        } else {
          reject(status);
        }
      });
    });
  }

  retryFetchWeather = async () => {
    console.log('Retrying...');
    const capitalWeather = await this.fetchCapitalWeather({
      capitalLocation: this.state.capitalLocation
    });

    this.setState({ capitalWeather });
  };

  render() {
    return (
      <div>
        <LoadingOverlay active={this.state.loading} />

        <Map
          google={this.props.google}
          zoom={4}
          centerAroundCurrentLocation={true}
          zoomControl={false}
          scrollwheel={false}
          onClick={this.onMapClick}
        >
          <Marker
            onClick={this.onMarkerClick}
            name={'Current location'}
            position={this.state.capitalLocation}
          />

          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
            onClose={this.onInfoWindowClose}
          >
            <CapitalWeatherInfo
              capitalName={this.selectedCapitalName()}
              capitalWeather={this.state.capitalWeather}
            />
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: GOOGLE_MAPS_API_KEY
})(WeatherMap);
