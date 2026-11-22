const React = require('react');
const { View, Text, ScrollView, Image } = require('react-native');

const chainable = () => {
  const obj = {
    duration: () => obj,
    delay: () => obj,
    springify: () => obj,
    damping: () => obj,
    stiffness: () => obj,
  };
  return obj;
};

const Animated = {
  View,
  Text,
  ScrollView,
  Image,
  createAnimatedComponent: (C) => C,
};

module.exports = {
  __esModule: true,
  default: Animated,
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: (fn) => fn(),
  withSpring: (v) => v,
  withTiming: (v) => v,
  runOnJS: (fn) => fn,
  FadeIn: chainable(),
  FadeInDown: chainable(),
  FadeInUp: chainable(),
  FadeOut: chainable(),
  FadeOutUp: chainable(),
  LinearTransition: chainable(),
};
