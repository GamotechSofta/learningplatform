class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.token,
    this.learningTrack,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String? token;
  final String? learningTrack;

  bool get hasLearningTrack =>
      learningTrack != null && learningTrack!.isNotEmpty;

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    String? token,
    String? learningTrack,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      token: token ?? this.token,
      learningTrack: learningTrack ?? this.learningTrack,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: _readId(json),
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'student',
      token: json['token']?.toString(),
      learningTrack: _readOptionalString(json['learningTrack']),
    );
  }

  static String _readId(Map<String, dynamic> json) {
    final id = json['_id'] ?? json['id'];
    if (id == null) return '';
    if (id is Map && id[r'$oid'] != null) return id[r'$oid'].toString();
    return id.toString();
  }

  static String? _readOptionalString(dynamic value) {
    if (value == null) return null;
    final text = value.toString().trim();
    return text.isEmpty ? null : text;
  }

  Map<String, dynamic> toSessionJson() => {
        '_id': id,
        'name': name,
        'email': email,
        'role': role,
        if (learningTrack != null) 'learningTrack': learningTrack,
      };
}
