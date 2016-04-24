/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

import AppRoot from './components/AppRoot';

class PlanetaryCapture extends Component {
  render() {
    return <AppRoot />
  }
}

AppRegistry.registerComponent('PlanetaryCapture', () => PlanetaryCapture);
