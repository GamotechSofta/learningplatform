import 'package:flutter/material.dart';

class LearningTrackOption {
  const LearningTrackOption({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String id;
  final String title;
  final String subtitle;
  final IconData icon;
}

class LearningTracks {
  LearningTracks._();

  static const exploreAll = 'explore_all';

  static const options = <LearningTrackOption>[
    LearningTrackOption(
      id: 'class_8_10',
      title: 'Class 8th – 10th',
      subtitle: 'School foundation, basics & skill courses',
      icon: Icons.school_outlined,
    ),
    LearningTrackOption(
      id: 'class_11_12',
      title: 'Class 11th – 12th',
      subtitle: 'Senior secondary & board-level prep',
      icon: Icons.menu_book_outlined,
    ),
    LearningTrackOption(
      id: 'jee',
      title: 'JEE / Engineering',
      subtitle: 'JEE Main, Physics & entrance prep',
      icon: Icons.science_outlined,
    ),
    LearningTrackOption(
      id: 'skills',
      title: 'Skills & IT Courses',
      subtitle: 'AWS, coding, cyber security & more',
      icon: Icons.computer_outlined,
    ),
  ];

  static String label(String? trackId) {
    if (trackId == null || trackId.isEmpty) return 'All courses';
    if (trackId == exploreAll) return 'All courses';
    return options
            .where((o) => o.id == trackId)
            .map((o) => o.title)
            .firstOrNull ??
        'Recommended';
  }
}
