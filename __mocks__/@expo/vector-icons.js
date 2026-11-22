const React = require('react');
const { Text } = require('react-native');

const MockIcon = ({ name, ...rest }) => React.createElement(Text, rest, name);

module.exports = {
  Ionicons: MockIcon,
  MaterialCommunityIcons: MockIcon,
  MaterialIcons: MockIcon,
  Feather: MockIcon,
  FontAwesome: MockIcon,
};
