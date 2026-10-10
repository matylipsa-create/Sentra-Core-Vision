import 'dart:io';

import 'package:permission_handler/permission_handler.dart';

import 'hardware_interfaces.dart';

/// Android camera adapter that checks real hardware availability and
/// requests the CAMERA permission via the permission_handler plugin.
class AndroidCameraAdapter implements ICameraService {
  @override
  Future<CameraInfo> checkAvailability() async {
    final status = await Permission.camera.status;
    if (status.isDenied || status.isPermanentlyDenied) {
      return const CameraInfo(
        status: CameraStatus.permissionDenied,
        message: 'Permiso de cámara requerido. Otórgalo en Configuración.',
      );
    }
    if (status.isGranted) {
      return const CameraInfo(
        status: CameraStatus.available,
        message: 'Cámara disponible y autorizada.',
      );
    }
    return const CameraInfo(
      status: CameraStatus.unavailable,
      message: 'Estado de cámara desconocido.',
    );
  }

  @override
  Future<bool> requestPermission() async {
    final result = await Permission.camera.request();
    return result.isGranted;
  }
}
