class AppAssets {
  AppAssets._();

  static const String logo = 'assets/images/logo.png';

  static const String lockedVideoThumbnail = 'assets/images/blureBanner.png';

  static const String physicsBanner = 'assets/images/banners/physics_banner.webp';
  static const String coursesBanner = 'assets/images/banners/courses_banner.webp';
  static const String itCoursesBanner = 'assets/images/banners/it_courses_banner.webp';

  static const List<String> heroBanners = [
    physicsBanner,
    coursesBanner,
    itCoursesBanner,
  ];

  /// Remote fallbacks if bundled WebP assets fail to decode on device.
  static const List<String> heroBannerUrls = [
    'https://res.cloudinary.com/dzd47mpdo/image/upload/v1781187303/physicsCourseBaner_yp4qp6.png',
    'https://res.cloudinary.com/dzd47mpdo/image/upload/v1781187304/coursesOffered_p5cpgk.png',
    'https://res.cloudinary.com/dzd47mpdo/image/upload/v1781187811/itCourses_teeg5z.png',
  ];

  static const String awsDevopsCategory = 'assets/images/categories/awsIcon.png';
  static const String cybersecurityCategory =
      'assets/images/categories/cybersecurityIcon.png';
  static const String operatingSystemCategory = 'assets/images/categories/osIcon.jpg';
  static const String skillCoursesCategory =
      'assets/images/banners/skillcoursesIcon.png';
  static const String videoEditingCategory =
      'assets/images/banners/videoEditingIcon.webp';
  static const String jeeMainCategory = 'assets/images/categories/jeemainIcon.png';
  static const String vocationalTrainingCategory =
      'assets/images/categories/vocationalTrainingIcon.png';
  static const String itCoursesCategory = 'assets/images/categories/itCourcesIcon.jpg';
}
