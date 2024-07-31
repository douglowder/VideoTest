import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useScale } from './useScale';

type Status = Partial<AVPlaybackStatus> & {
  isPlaying?: boolean;
  uri?: string;
  rate?: number;
  positionMillis?: number;
  playableDurationMillis?: number;
};

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function App() {
  const styles = useVideoStyles();
  const video = useRef<Video>();
  const [videoStatus, setVideoStatus] = useState<Status>({
    isPlaying: false,
  });
  const [fractionComplete, setFractionComplete] = useState(0);

  const fractionCompleteFromStatus = (status: Status) =>
    status.playableDurationMillis !== undefined &&
    status.positionMillis !== undefined
      ? status.positionMillis / status.playableDurationMillis
      : 0;

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.videoStyle}
        source={{
          uri: videoSource,
        }}
        useNativeControls
        resizeMode={ResizeMode.STRETCH}
        isLooping
        onPlaybackStatusUpdate={(status) => {
          setVideoStatus(status);
          setFractionComplete(fractionCompleteFromStatus(status));
        }}
      />
      <ProgressBar fractionComplete={fractionComplete} />
      <View style={styles.buttons}>
        <Button
          title="Rewind"
          onPress={() => {
            video.current.setPositionAsync(0);
          }}
        />{' '}
        <Button
          title="Back 5 sec"
          onPress={() => {
            if (videoStatus.positionMillis > 5000) {
              video.current.setPositionAsync(videoStatus.positionMillis - 5000);
            } else {
              video.current.setPositionAsync(0);
            }
          }}
        />
        <Button
          title={videoStatus.isPlaying ? 'Pause' : 'Play'}
          onPress={() =>
            videoStatus?.isPlaying ?? false
              ? video.current.pauseAsync()
              : video.current.playAsync()
          }
        />
        <Button
          title="Forward 5 sec"
          onPress={() => {
            if (
              videoStatus.positionMillis <
              videoStatus.playableDurationMillis - 5000
            ) {
              video.current.setPositionAsync(videoStatus.positionMillis + 5000);
            } else {
              video.current.setPositionAsync(
                videoStatus.playableDurationMillis,
              );
            }
          }}
        />
        <Button
          title="Full screen"
          onPress={() => {
            video.current.presentFullscreenPlayer();
          }}
        />
      </View>
    </View>
  );
}

const ProgressBar = (props: any) => {
  const styles = useVideoStyles();
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
  const styles = useVideoStyles();
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

const backgroundColor = '#ecf0f1';

const useVideoStyles = () => {
  const { width, height, scale } = useScale();

  const dim = Math.min(width, height);

  const vidWidth = dim === height ? width * 0.3 : height * 0.3;
  const vidHeight = (vidWidth * 480) / 960;

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor,
    },
    videoStyle: {
      width: vidWidth,
      height: vidHeight,
    },
    buttons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      width: width * 0.75,
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
      flexDirection: 'row',
      width: vidWidth,
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
};
