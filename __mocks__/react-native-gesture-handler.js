const React = require('react');
const { View } = require('react-native');

const GestureHandlerRootView = ({ children, style }) => React.createElement(View, { style }, children);
const GestureDetector = ({ children }) => children;

module.exports = {
  GestureHandlerRootView,
  GestureDetector,
  usePanGesture: () => ({}),
  usePinchGesture: () => ({}),
  useRotationGesture: () => ({}),
  useSimultaneousGestures: () => ({}),
};
