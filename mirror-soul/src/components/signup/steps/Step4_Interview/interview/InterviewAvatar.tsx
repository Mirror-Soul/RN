import { Colors } from '@/src/constants/theme';
import { Canvas, useLoader } from '@react-three/fiber/native';
import React, { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GLTFLoader } from 'three-stdlib';
import { useInterviewModel } from '../hooks/useInterviewModel';

/**
 * 내부 3D 모델 컴포넌트.
 * Canvas 내부에서 렌더링되어야 합니다.
 *
 * 사전에 Draco 압축이 해제된 GLB 파일을 사용하므로
 * DRACOLoader가 필요하지 않습니다.
 *
 * 현재 텍스처(색상)는 React Native에서 자동 로드되지 않으므로,
 * 추후 Blender에서 버텍스 컬러를 베이크한 GLB로 교체 예정입니다.
 */
function RobotModel({ uri, onLoad }: { uri: string; onLoad: () => void }) {
  const gltf: any = useLoader(GLTFLoader, uri);

  useEffect(() => {
    if (gltf?.scene) {
      // 씬 순회: 깨진 텍스처 맵을 제거하고 머티리얼 색상을 보정
      gltf.scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const mat = child.material;
          if (mat.map && !mat.map.image) {
            mat.map = null;
          }
          if (child.geometry?.attributes?.color) {
            mat.vertexColors = true;
          }
          mat.needsUpdate = true;
        }
      });
      onLoad();
    }
  }, [gltf, onLoad]);

  return (
    <primitive
      object={gltf.scene}
      scale={[2.5, 2.5, 2.5]}
      position={[0, 0, 0]}
      rotation={[0, 155.5, 0]}
    />
  );
}

/**
 * InterviewAvatar
 *
 * 3D 모델의 로딩 상태와 데이터 처리는 useInterviewModel 훅에서 담당하고,
 * 컴포넌트는 오직 Three.js 캔버스와 렌더링에만 집중합니다.
 */
export default function InterviewAvatar() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { modelUri, isLoading } = useInterviewModel(
    require('@/assets/images/3D-image/interview_robot_vertex-v2-uncompressed.glb')
  );

  return (
    <View style={styles.container}>
      {/* 에셋 로딩 및 3D 파싱 중 로딩 인디케이터 */}
      {(isLoading || !isLoaded) && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary.electricCyan} />
        </View>
      )}

      {/* 모델 URI가 준비된 후에만 Canvas를 마운트 */}
      {modelUri && (
        <Canvas
          camera={{ position: [0, 0.5, 4], fov: 40 }}
          style={styles.canvas}
          gl={{ toneMapping: 3 }}
        >
          <ambientLight intensity={1.2} color={0xffffff} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} color={0xffffff} />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} color={0xffffff} />

          <Suspense fallback={null}>
            <RobotModel uri={modelUri} onLoad={() => setIsLoaded(true)} />
          </Suspense>
        </Canvas>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 256,
    height: 256,
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
});
