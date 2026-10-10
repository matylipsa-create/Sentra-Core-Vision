import 'hardware_interfaces.dart';

/// Desktop / Windows camera stub — returns [CameraStatus.unavailable] so
/// the UI correctly shows simulation mode on platforms without a mobile
/// camera plugin.
class DesktopCameraAdapter implements ICameraService {
  @override
  Future<CameraInfo> checkAvailability() async {
    return const CameraInfo(
      status: CameraStatus.unavailable,
      message: 'Cámara no disponible en escritorio. Modo simulación activo.',
    );
  }

  @override
  Future<bool> requestPermission() async => false;
}
