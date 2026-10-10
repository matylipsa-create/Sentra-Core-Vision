# Flutter plugins — keep native plugin registrars and method channels
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }

# flutter_tts — keep TTS engine wrappers
-keep class com.tundem.** { *; }
-keep class com.ryanheise.audioservice.** { *; }

# permission_handler — keep permission enum reflection
-keep class com.baseflow.permissionhandler.** { *; }

# Keep model/DTO classes from JSON deserialization
-keep class com.sentra.vision.model.** { *; }
-keepclassmembers class com.sentra.vision.model.** {
  <fields>;
}

# Keep enum values used in method channels
-keepclassmembers enum * {
  public static **[] values();
  public static ** valueOf(java.lang.String);
}

# Flutter's own rules — keep the generated BuildConfig
-keep class com.sentra.vision.BuildConfig { *; }
