import React, {
  Component,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import '../UserAgent';
import MapView from 'react-native-maps';
import io from 'socket.io-client/socket.io';
import distanceBetweenPoints from '../gpsdistance';
import CaptureBanner from './CaptureBanner';

let images = {};
images.mercury = require('../planets/mercury.png');
images.sun = require('../planets/sun.png');
images.venus = require('../planets/venus.png');
images.earth = require('../planets/earth.png');
images.mars = require('../planets/mars.png');
images.jupiter = require('../planets/jupiter.png');
images.saturn = require('../planets/saturn.png');
images.saturn_titan = require('../planets/saturn_titan.png');
images.neptune = require('../planets/neptune.png');
images.uranus = require('../planets/uranus.png');
images.pluto = require('../planets/pluto.png');
images.earth_moon = require('../planets/earth_moon.png');
images.jupiter_callisto = require('../planets/jupiter_callisto.png');
images.jupiter_europa = require('../planets/jupiter_europa.png');
images.jupiter_ganymede = require('../planets/jupiter_ganymede.png');
images.jupiter_io = require('../planets/jupiter_io.png');
images.ceres = require('../planets/ceres.png');
images['halleys-comet'] = require('../planets/halleys-comet.png');
images.unknown = require('../planets/unknown.png');

const CAPTURABLE_DISTANCE = 2000;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1
  },
  captureBannerContainer: {
    height: 60
  },
  link: {
    fontWeight:'bold',
    color:'#ff0000',
    padding:10,
    backgroundColor:'#efefef'
  }
});
//https://blss-game.herokuapp.com/test/
const URL = 'https://blss-game.herokuapp.com';

const SOLAR_SYSTEM_CENTER = {
  latitude: 39.545841,
  longitude: -119.819379
}

export default class AppRoot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      objects: [],
      orbits: [],
      position: null,
      selectedObject: null,
    };

    this.socket = io(URL, { transports: ['websocket'] });
    this.socket.on('connect_error', data => console.log(data));
    this.socket.on('connect', data => console.log(data));
    this.socket.emit('locations');
    this.socket.emit('orbits');
    this.socket.emit('authenticate');
    this.socket.on('orbits', data => {
      this.setState({ orbits: data });
      console.log(data);
    });
    this.socket.on('locations', data => {
      console.log(data);
      this.setState({ objects: data.map(this.distanceForObject.bind(this)) });
    });
    this.socket.on('authenticate', data => {
      console.log(data);
      this.userId = data.id;
    });
    this.socket.on('state', (key, state) => {
      let index = null;
      for (let i = 0; i < this.state.objects.length; i++) {
        if (this.state.objects[i].key == key) {
          index = i;
          break;
        }
      }
      if (index === null) {
        return;
      }
      let objects = this.state.objects;
      objects[index].state = state;
      this.setState({ objects });
    });
    this.socket.on('fail', data => console.log(data));
  }

  distanceForObject(object) {
    if (this.state.position) {
      let userPosition = {
        latitude: this.state.position.coords.latitude,
        longitude: this.state.position.coords.longitude
      };
      let objectPosition = {
        latitude: object.geographic.latitude,
        longitude: object.geographic.longitude
      };
      object.distance = distanceBetweenPoints(userPosition, objectPosition);
    }
    return object;
  }

  updatePosition(position) {
    let newState = { position };
    if (this.state.objects) {
      newState.objects = this.state.objects.map(this.distanceForObject.bind(this));
    }
    this.setState(newState);
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(position => {
      console.log('initial position', position);
      this.updatePosition(position);
      this.positionWatcher = navigator.geolocation.watchPosition(position => {
        console.log('current position', position);
        this.updatePosition(position);
      });
    });
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.positionWatcher);
  }

  didSelectObject(object, event) {
    this.setState({ selectedObject: object });
  }

  didDeselectObject(object, event) {
    console.log('deselect', object);
    this.setState({ selectedObject: null });
  }

  performActionOnObject(action, object) {
    console.log('performing action', action, 'on object', object);
    this.socket.emit(action, {
      key: object.key,
      location: {
        latitude: this.state.position.coords.latitude,
        longitude: this.state.position.coords.longitude
      }
    });
  }

  attackObject(object) {
    this.performActionOnObject('attack', object);
  }

  reinforceObject(object) {
    this.performActionOnObject('reinforce', object);
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: SOLAR_SYSTEM_CENTER.latitude,
            longitude: SOLAR_SYSTEM_CENTER.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {this.state.objects.map(object => {
            let coordinate = { latitude: object.geographic.latitude, longitude: object.geographic.longitude };
            let objectState = object.state || {};
            let actions = [];
            if (object.distance <= CAPTURABLE_DISTANCE) {
              if (object.state.owner != this.userId && object.state.owner != null) {
                actions.push(
                  <TouchableHighlight key={'attack'} onPress={this.attackObject.bind(this, object)}>
                    <Text style={styles.link}>Attack!</Text>
                  </TouchableHighlight>
                );
              } else {
                actions.push(
                  <TouchableHighlight key={'reinforce'} onPress={this.reinforceObject.bind(this, object)}>
                    <Text style={styles.link}>Reinforce</Text>
                  </TouchableHighlight>
                );
              }
            }
            return (
              <MapView.Marker
                coordinate={coordinate}
                image={images[object.key] || images['unknown']}
                key={object.key}
                onSelect={this.didSelectObject.bind(this, object)}
                onDeselect={this.didDeselectObject.bind(this, object)}>
                <MapView.Callout>
                  <View>
                    <Text key={'name'}>{object.name}</Text>
                    <Text key={'owner'}>Owner: {objectState.owner}</Text>
                    <Text key={'health'}>Health: {objectState.health}</Text>
                    <Text key={'distance'}>Distance: {object.distance.toFixed(1)}</Text>
                    {actions}
                  </View>
                  <View>

                  </View>
                </MapView.Callout>
              </MapView.Marker>
            );
          })}
          {
            this.state.position ?
            <MapView.Marker
              title="Current Location"
              image={require('../spaceship.png')}
              coordinate={{
                latitude: this.state.position.coords.latitude,
                longitude: this.state.position.coords.longitude
              }}/> :
            null
          }
          {this.state.orbits.map(orbit => {
            let coordinates = orbit.orbit.map(o => o.geographic);
            return <MapView.Polyline
              key={`orbit-${orbit.key}`}
              coordinates={coordinates}
              strokeColor={'#999999'} />
          })}
        </MapView>
      </View>
    );
  }
}
