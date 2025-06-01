import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './commonStyles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const scanFrameSize = SCREEN_WIDTH * 0.7;

export const qrScannerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: scanFrameSize,
    height: scanFrameSize,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  instructions: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.2,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 8,
    width: '80%',
  },
  rescanButton: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
}); 