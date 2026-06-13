class CourseCertificate {
  const CourseCertificate({
    required this.id,
    required this.courseId,
    required this.courseTitle,
    required this.studentName,
    required this.issuedAt,
    required this.certificateNumber,
    this.instructorName,
    this.organization = 'Vidyank',
    this.totalVideos = 0,
  });

  final String id;
  final String courseId;
  final String courseTitle;
  final String studentName;
  final DateTime issuedAt;
  final String certificateNumber;
  final String? instructorName;
  final String organization;
  final int totalVideos;

  factory CourseCertificate.fromJson(Map<String, dynamic> json) {
    return CourseCertificate(
      id: json['id']?.toString() ?? '',
      courseId: json['courseId']?.toString() ?? '',
      courseTitle: json['courseTitle']?.toString() ?? 'Course',
      studentName: json['studentName']?.toString() ?? 'Student',
      issuedAt: DateTime.tryParse(json['issuedAt']?.toString() ?? '') ?? DateTime.now(),
      certificateNumber: json['certificateNumber']?.toString() ?? '',
      instructorName: json['instructorName']?.toString(),
      organization: json['organization']?.toString() ?? 'Vidyank',
      totalVideos: (json['totalVideos'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'courseId': courseId,
        'courseTitle': courseTitle,
        'studentName': studentName,
        'issuedAt': issuedAt.toIso8601String(),
        'certificateNumber': certificateNumber,
        'instructorName': instructorName,
        'organization': organization,
        'totalVideos': totalVideos,
      };
}
