import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../core/constants/app_assets.dart';
import '../core/theme/themed_colors.dart';
import '../core/utils/media_url.dart';
import '../services/video_frame_thumbnail_service.dart';

class ThumbnailImage extends StatefulWidget {
  const ThumbnailImage({
    super.key,
    this.url,
    this.videoUrl,
    this.aspectRatio = 16 / 9,
    this.width,
    this.height,
    this.borderRadius = 12,
    this.icon = Icons.play_circle_outline,
    this.fit = BoxFit.cover,
    this.showMediaOverlay = false,
    this.mediaOverlayIcon = Icons.play_circle_outline,
    this.blurPreview = false,
  });

  final String? url;
  final String? videoUrl;
  final double aspectRatio;
  final double? width;
  final double? height;
  final double borderRadius;
  final IconData icon;
  final BoxFit fit;
  final bool showMediaOverlay;
  final IconData mediaOverlayIcon;
  final bool blurPreview;

  @override
  State<ThumbnailImage> createState() => _ThumbnailImageState();
}

class _ThumbnailImageState extends State<ThumbnailImage> {
  bool _imageFailed = false;
  Future<String?>? _frameFuture;
  String? _loadedVideoUrl;

  @override
  void didUpdateWidget(ThumbnailImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) _imageFailed = false;
    if (oldWidget.videoUrl != widget.videoUrl) {
      _frameFuture = null;
      _loadedVideoUrl = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.blurPreview) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(widget.borderRadius),
        child: _wrapSize(_lockedThumbnail()),
      );
    }

    final imageUrl = MediaUrl.resolve(widget.url);
    final previewVideoUrl = MediaUrl.resolve(widget.videoUrl);
    final useImage = imageUrl != null && imageUrl.isNotEmpty && !_imageFailed;
    final useVideoFrame =
        !useImage && previewVideoUrl != null && previewVideoUrl.isNotEmpty;

    if (useVideoFrame && _loadedVideoUrl != previewVideoUrl) {
      _loadedVideoUrl = previewVideoUrl;
      _frameFuture = VideoFrameThumbnailService.instance
          .thumbnailPathFor(previewVideoUrl);
    }

    final child = useImage
        ? CachedNetworkImage(
            imageUrl: imageUrl,
            fit: widget.fit,
            width: widget.width,
            height: widget.height,
            placeholder: (_, __) => _placeholder(context),
            errorWidget: (_, __, ___) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted && !_imageFailed) {
                  setState(() => _imageFailed = true);
                }
              });
              return _placeholder(context);
            },
          )
        : useVideoFrame
            ? FutureBuilder<String?>(
                future: _frameFuture,
                builder: (context, snapshot) {
                  final path = snapshot.data;
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return _placeholder(context, loading: true);
                  }
                  if (path != null && path.isNotEmpty) {
                    return Image.file(
                      File(path),
                      fit: widget.fit,
                      width: widget.width,
                      height: widget.height,
                      errorBuilder: (_, __, ___) => _placeholder(context),
                    );
                  }
                  return _placeholder(context);
                },
              )
            : _placeholder(context);

    final showOverlay =
        widget.showMediaOverlay && (useImage || useVideoFrame);

    final content = showOverlay
        ? Stack(
            fit: StackFit.expand,
            children: [
              child,
              _mediaOverlay(context),
            ],
          )
        : child;

    return ClipRRect(
      borderRadius: BorderRadius.circular(widget.borderRadius),
      child: _wrapSize(content),
    );
  }

  Widget _lockedThumbnail() {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset(
          AppAssets.lockedVideoThumbnail,
          fit: widget.fit,
          width: widget.width,
          height: widget.height,
        ),
        ColoredBox(color: Colors.black.withValues(alpha: 0.15)),
        Center(
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.5),
              shape: BoxShape.circle,
            ),
            child: Icon(
              widget.icon == Icons.play_circle_outline
                  ? Icons.lock_rounded
                  : widget.icon,
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
      ],
    );
  }

  Widget _mediaOverlay(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.45),
          shape: BoxShape.circle,
        ),
        child: Icon(
          widget.mediaOverlayIcon,
          size: 32,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _wrapSize(Widget child) {
    if (widget.height != null) {
      final width = widget.width != null && widget.width!.isFinite
          ? widget.width
          : double.infinity;
      return SizedBox(width: width, height: widget.height, child: child);
    }

    if (widget.width != null && widget.width!.isFinite) {
      return SizedBox(width: widget.width, child: child);
    }

    return AspectRatio(aspectRatio: widget.aspectRatio, child: child);
  }

  Widget _placeholder(BuildContext context, {bool loading = false}) {
    final c = context.colors;
    return Container(
      width: widget.width,
      height: widget.height,
      color: c.placeholder,
      child: Center(
        child: loading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(widget.icon, size: 40, color: Theme.of(context).colorScheme.primary),
      ),
    );
  }
}
