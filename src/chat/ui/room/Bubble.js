import PropTypes from 'prop-types';
import React from 'react';
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

/* import MessageText from './MessageText';
import MessageImage from './MessageImage';
import Time from './Time'; */

import {
  MessageText,
  MessageImage,
  Time,
} from 'react-native-gifted-chat';
import { Icon } from 'react-native-elements';

import Network from '../../../network';
import { isSameUser, isSameDay, warnDeprecated } from './utils';

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#f0f0f0',
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#0084ff',
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
  }),
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tick: {
    fontSize: 10,
    backgroundColor: 'transparent',
    color: 'white',
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  },
  actionBtn: {
    padding: 5,
    borderRadius: 3,
    borderColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 5,
  },
};

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);
    this._network = new Network();
    this.obj = this.props.obj;
    this.onLongPress = this.onLongPress.bind(this);
    const likes = this.props.currentMessage.likes;
    const original = JSON.parse(this.props.currentMessage.original);
    this.state = {
      showActions: false,
      likes,
      original,
    };
  }

  onLongPress() {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else if (this.props.currentMessage.text) {
      const options = [
        'Copy Text',
        'Cancel',
      ];
      const cancelButtonIndex = options.length - 1;
      this.context.actionSheet().showActionSheetWithOptions({
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) { // eslint-disable-line default-case
          case 0:
            Clipboard.setString(this.props.currentMessage.text);
            break;
        }
      });
    }
  }

  toggleActions = () => {
    const action = this.state.showActions;
    this.setState({ showActions: !action });
  }

  _onPressLike = () => {
    console.log('**** like pressed **** ');
    this._network.chat.setPhotoLike(this.state.original._id);
  }

  _deleteMessage = () => {
    Alert.alert(
      'Delete',
      'Do you want to delete the image?',
      [
        { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Yes',
          onPress: () => {
            this._network.chat.deleteMessage(this.state.original._id);
          },
        },
      ],
      { cancelable: false },
    );
  }

  _handleComments = () => {
    if (this.state.original.file) {
      Actions.imagePreview({
        imageUri: this.props.currentMessage.image,
        obj: this.props.obj,
        msgId: this.props.currentMessage._id,
        msgLikes: this.props.currentMessage.likes,
        msgTitle: this.props.currentMessage.text,
      });
    }
  }

  handleBubbleToNext() {
    if (isSameUser(this.props.currentMessage, this.props.nextMessage)
    && isSameDay(this.props.currentMessage, this.props.nextMessage)) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToNext,
        this.props.containerToNextStyle[this.props.position]]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (isSameUser(this.props.currentMessage, this.props.previousMessage)
    && isSameDay(this.props.currentMessage, this.props.previousMessage)) {
      return StyleSheet.flatten([
        styles[this.props.position].containerToPrevious,
        this.props.containerToPreviousStyle[this.props.position]]);
    }
    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  renderReply() {
    if (this.state.original.attachments) {
      if (this.state.original.attachments[0].message_link) {
        return (
          <Text>{this.state.original.attachments[0].message_link}</Text>
        );
      }
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps} />;
    }
    return null;
  }

  renderTicks() {
    const { currentMessage } = this.props;
    if (this.props.renderTicks) {
      return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
      return;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
          {currentMessage.received && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
        </View>
      );
    }
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const { containerStyle, wrapperStyle, ...timeProps } = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }
    return null;
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  renderActions() {
    if (this.state.showActions || this.state.likes > 0) {
      return (
        <View
          style={{
            marginHorizontal: 5,
            marginBottom: 5,
          }}
        >
          <View
            style={{
              alignItems: 'flex-start',
              padding: 3,
              flexDirection: 'row',
            }}
          >
            <TouchableOpacity
              style={[styles.actionBtn]}
              onPress={this._onPressLike}
            >
              <Icon
                name={'heart-outline'}
                type={'material-community'}
                size={14}
                color={'#FFF'}
              />
              {
                (this.state.likes > 0 &&
                  <Text
                    style={{
                      fontFamily: 'OpenSans-Regular',
                      fontSize: 12,
                      color: '#fff',
                      marginLeft: 5,
                    }}
                  >{this.state.likes > 0 ? this.state.likes : 'no'}</Text>
                )
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn]}
              onPress={this._handleComments}
            >
              <Icon
                name={'comment-multiple-outline'}
                type={'material-community'}
                size={14}
                color={'#FFF'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn]}
              onPress={this._deleteMessage}
            >
              <Icon
                name={'delete'}
                type={'material-community'}
                size={14}
                color={'#FFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  render() {
    // console.log('bubble mess', this.props.currentMessage);
    return (
      <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
        <View style={[
          styles[this.props.position].wrapper,
          this.props.wrapperStyle[this.props.position],
          this.handleBubbleToNext(),
          this.handleBubbleToPrevious()]}
        >
          <TouchableWithoutFeedback
            onLongPress={this.onLongPress}
            accessibilityTraits="text"
            onPress={this.toggleActions}
            {...this.props.touchableProps}
          >
            <View>
              {this.renderCustomView()}
              {this.renderMessageImage()}
              {this.renderMessageText()}
              <View style={[styles.bottom, this.props.bottomContainerStyle[this.props.position]]}>
                {this.renderActions()}
                <View>
                  {this.renderTime()}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTime: null,
  position: 'left',
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
  // TODO: remove in next major release
  isSameDay: warnDeprecated(isSameDay),
  isSameUser: warnDeprecated(isSameUser),
  obj: {},
  renderTicks: {},
  user: {},
};

Bubble.propTypes = {
  touchableProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  nextMessage: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  previousMessage: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  // TODO: remove in next major release
  isSameDay: PropTypes.func,
  isSameUser: PropTypes.func,
  obj: React.PropTypes.object,    // eslint-disable-line react/forbid-prop-types
  renderTicks: React.PropTypes.object,    // eslint-disable-line react/forbid-prop-types
  user: React.PropTypes.object,    // eslint-disable-line react/forbid-prop-types
};
