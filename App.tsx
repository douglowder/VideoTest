import * as React from 'react';
import {
  Dimensions,
  Platform,
  View,
  ViewStyle,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

type Status = Partial<AVPlaybackStatus> & {
  isPlaying?: boolean;
  uri?: string;
  rate?: number;
  positionMillis?: number;
  playableDurationMillis?: number;
};

export default function App() {
  const video = React.useRef<Video>();
  const [status, setStatus] = React.useState<Status>({
    isPlaying: false,
  });
  const [fractionComplete, setFractionComplete] = React.useState(0);

  const { height, width } = Dimensions.get('screen');

  const videoStyle: ViewStyle = {
    alignSelf: 'center',
    width: width * 0.8,
    height: width * 0.3,
  };

  const fractionCompleteFromStatus = (status: Status) =>
    status.playableDurationMillis !== undefined &&
    status.positionMillis !== undefined
      ? status.positionMillis / status.playableDurationMillis
      : 0;

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={videoStyle}
        source={{
          uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        }}
        useNativeControls
        resizeMode={ResizeMode.STRETCH}
        isLooping
        onPlaybackStatusUpdate={(status) => {
          setStatus(status);
          setFractionComplete(fractionCompleteFromStatus(status));
        }}
      />
      <ProgressBar fractionComplete={fractionComplete} />
      <View style={styles.buttons}>
        <Button
          title="Back 5 seconds"
          onPress={() => {
            if (status.positionMillis > 5000) {
              video.current.setPositionAsync(status.positionMillis - 5000);
            } else {
              video.current.setPositionAsync(0);
            }
          }}
        />
        <Button
          title={status.isPlaying ? 'Pause' : 'Play'}
          onPress={() =>
            status?.isPlaying ?? false
              ? video.current.pauseAsync()
              : video.current.playAsync()
          }
        />
        <Button
          title="Forward 5 seconds"
          onPress={() => {
            if (status.positionMillis < status.playableDurationMillis - 5000) {
              video.current.setPositionAsync(status.positionMillis + 5000);
            } else {
              video.current.setPositionAsync(status.playableDurationMillis);
            }
          }}
        />
      </View>
    </View>
  );
}

const ProgressBar = (props: any) => {
  const progressBarStyles = {
    container: styles.progressContainer,
    left: [styles.progressLeft, { flex: props?.fractionComplete || 0.0 }],
    right: [
      styles.progressRight,
      { flex: 1.0 - props?.fractionComplete || 1.0 },
    ],
  };
  return (
    <View style={progressBarStyles.container}>
      <View style={progressBarStyles.left} />
      <View style={progressBarStyles.right} />
    </View>
  );
};

const Button = (props: { title: string; onPress: () => void }) => {
  return (
    <Pressable
      onPress={() => props.onPress()}
      style={({ pressed, focused }) => [
        styles.button,
        pressed || focused ? { backgroundColor: 'blue' } : {},
      ]}
    >
      <Text style={styles.buttonText}>{props.title}</Text>
    </Pressable>
  );
};

const scale = Platform.OS === 'ios' && Platform.isTV ? 2.0 : 0.6;

const backgroundColor = '#ecf0f1';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 50 * scale,
  },
  button: {
    backgroundColor: 'darkblue',
    margin: 20 * scale,
    borderRadius: 5 * scale,
    padding: 10 * scale,
  },
  buttonText: {
    color: 'white',
    fontSize: 20 * scale,
  },
  progressContainer: {
    backgroundColor,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%',
    height: 5 * scale,
    margin: 0,
  },
  progressLeft: {
    backgroundColor: 'blue',
    borderTopRightRadius: 5 * scale,
    borderBottomRightRadius: 5 * scale,
    flexDirection: 'row',
    height: '100%',
  },
  progressRight: {
    backgroundColor,
    flexDirection: 'row',
    height: '100%',
  },
});
