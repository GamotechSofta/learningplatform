import 'package:flutter/material.dart';

import '../../core/constants/app_assets.dart';

class AppLogo extends StatelessWidget {
  const AppLogo({
    super.key,
    this.height = 36,
    this.width,
    this.fit = BoxFit.contain,
  });

  final double height;
  final double? width;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      AppAssets.appIcon,
      height: height,
      width: width,
      fit: fit,
      filterQuality: FilterQuality.high,
    );
  }
}
