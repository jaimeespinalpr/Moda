import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import WebView from 'react-native-webview';
import { VIEWER_HTML } from '../viewer/viewerHTML';
import { useDesignStore } from '../store/designStore';

interface Props {
  onCapture?: (base64: string) => void;
  onReady?: () => void;
}

export const ClothingViewer3D = React.forwardRef<{ capture: () => void; reset: () => void }, Props>(
  ({ onCapture, onReady }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [isReady, setIsReady] = React.useState(false);

    const {
      shirtCutId, pantsCutId,
      shirtFabricId, pantsFabricId,
      shirtColor, pantsColor,
      showShirt, showPants, showMannequin,
    } = useDesignStore();

    const sendUpdate = useCallback((patch: object) => {
      if (!isReady) return;
      const msg = JSON.stringify({ type: 'update', ...patch });
      webViewRef.current?.injectJavaScript(`
        window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(msg)} }));
        true;
      `);
    }, [isReady]);

    useEffect(() => {
      sendUpdate({
        shirtCutId, pantsCutId,
        shirtFabricId, pantsFabricId,
        shirtColor, pantsColor,
        showShirt, showPants, showMannequin,
      });
    }, [shirtCutId, pantsCutId, shirtFabricId, pantsFabricId, shirtColor, pantsColor, showShirt, showPants, showMannequin, sendUpdate]);

    React.useImperativeHandle(ref, () => ({
      capture: () => {
        const msg = JSON.stringify({ type: 'capture' });
        webViewRef.current?.injectJavaScript(`
          window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(msg)} }));
          true;
        `);
      },
      reset: () => {
        const msg = JSON.stringify({ type: 'reset' });
        webViewRef.current?.injectJavaScript(`
          window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(msg)} }));
          true;
        `);
      },
    }));

    const handleMessage = useCallback((event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'ready') {
          setIsReady(true);
          onReady?.();
          sendUpdate({
            shirtCutId, pantsCutId,
            shirtFabricId, pantsFabricId,
            shirtColor, pantsColor,
            showShirt, showPants, showMannequin,
          });
        }
        if (data.type === 'capture' && onCapture) {
          onCapture(data.data);
        }
      } catch (_) {}
    }, [onCapture, onReady, sendUpdate, shirtCutId, pantsCutId, shirtFabricId, pantsFabricId, shirtColor, pantsColor, showShirt, showPants, showMannequin]);

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ html: VIEWER_HTML }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          originWhitelist={['*']}
          onMessage={handleMessage}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          androidLayerType="hardware"
          onError={(e) => console.warn('WebView error:', e.nativeEvent.description)}
        />
        {!isReady && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#C8A96E" />
            <Text style={styles.loadingText}>Cargando visor 3D…</Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111318' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#111318',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: '#C8A96E', fontSize: 14, fontWeight: '500' },
});
