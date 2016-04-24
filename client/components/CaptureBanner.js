import React, { View, Component, StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

export default class CaptureBanner extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Capture</Text>
      </View>
    );
  }
}
