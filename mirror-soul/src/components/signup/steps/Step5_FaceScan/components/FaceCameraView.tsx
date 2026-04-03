import React, { forwardRef } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Camera, CameraProps } from 'react-native-vision-camera';

interface FaceCameraViewProps extends Partial<CameraProps> {
  isActive: boolean;
  style?: ViewStyle;
}

/**
 * Face Scan 전용 카메라 뷰 컴포넌트
 *
 * VisionCamera를 래핑하여 영상 녹화 및 프레임 프로세싱을 수행합니다.
 * 외부에서 훅을 통해 생성된 frameProcessor를 주입받아 동작합니다.
 */
const FaceCameraView = forwardRef<Camera, FaceCameraViewProps>(
  ({ isActive, style, ...props }, ref) => {
    return (
      <Camera
        ref={ref}
        isActive={isActive}
        style={[styles.camera, style]}
        video={true}
        audio={false}
        {...props}
      />
    );
  }
);

const styles = StyleSheet.create({
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default FaceCameraView;
