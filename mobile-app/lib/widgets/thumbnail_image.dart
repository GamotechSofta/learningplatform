import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

class ThumbnailImage extends StatelessWidget {
  const ThumbnailImage({
    super.key,
    this.url,
    this.aspectRatio = 16 / 9,
    this.borderRadius = 12,
    this.icon = Icons.play_circle_outline,
  });

  final String? url;
  final double aspectRatio;
  final double borderRadius;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: aspectRatio,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: url != null && url!.isNotEmpty
            ? CachedNetworkImage(
                imageUrl: url!,
                fit: BoxFit.cover,
                placeholder: (_, __) => _placeholder(context),
                errorWidget: (_, __, ___) => _placeholder(context),
              )
            : _placeholder(context),
      ),
    );
  }

  Widget _placeholder(BuildContext context) {
    return Container(
      color: const Color(0xFFE2E8F0),
      child: Center(
        child: Icon(icon, size: 40, color: Theme.of(context).colorScheme.primary),
      ),
    );
  }
}
