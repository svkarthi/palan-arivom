const React = require('react');
const { View } = require('react-native');

const LinearGradient = ({ children, style, ...rest }) => React.createElement(View, { style, ...rest }, children);

module.exports = { LinearGradient };
