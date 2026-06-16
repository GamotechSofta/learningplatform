import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../core/constants/app_assets.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/themed_colors.dart';

class HeroBanner extends StatefulWidget {
  const HeroBanner({super.key});

  @override
  State<HeroBanner> createState() => _HeroBannerState();
}

class _HeroBannerState extends State<HeroBanner> {
  final _controller = PageController();
  int _page = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: c.surface,
                border: Border.all(color: c.border),
              ),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: PageView.builder(
                  controller: _controller,
                  itemCount: AppAssets.heroBanners.length,
                  onPageChanged: (index) => setState(() => _page = index),
                  itemBuilder: (context, index) {
                    return _HeroBannerSlide(
                      assetPath: AppAssets.heroBanners[index],
                      networkUrl: AppAssets.heroBannerUrls[index],
                    );
                  },
                ),
              ),
            ),
          ),
          SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              AppAssets.heroBanners.length,
              (index) => AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: index == _page ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: index == _page ? AppColors.primary : c.border,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroBannerSlide extends StatefulWidget {
  const _HeroBannerSlide({
    required this.assetPath,
    required this.networkUrl,
  });

  final String assetPath;
  final String networkUrl;

  @override
  State<_HeroBannerSlide> createState() => _HeroBannerSlideState();
}

class _HeroBannerSlideState extends State<_HeroBannerSlide> {
  bool _assetFailed = false;

  @override
  Widget build(BuildContext context) {
    if (_assetFailed) {
      return CachedNetworkImage(
        imageUrl: widget.networkUrl,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        placeholder: (_, __) => const _BannerPlaceholder(),
        errorWidget: (_, __, ___) => const _BannerPlaceholder(failed: true),
      );
    }

    return Image.asset(
      widget.assetPath,
      fit: BoxFit.cover,
      width: double.infinity,
      height: double.infinity,
      gaplessPlayback: true,
      errorBuilder: (_, __, ___) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && !_assetFailed) {
            setState(() => _assetFailed = true);
          }
        });
        return const _BannerPlaceholder();
      },
      frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
        if (wasSynchronouslyLoaded || frame != null) return child;
        return const _BannerPlaceholder();
      },
    );
  }
}

class _BannerPlaceholder extends StatelessWidget {
  const _BannerPlaceholder({this.failed = false});

  final bool failed;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return ColoredBox(
      color: c.borderLight,
      child: Center(
        child: failed
            ? Icon(Icons.broken_image_outlined, color: c.textSecondary)
            : const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
      ),
    );
  }
}
