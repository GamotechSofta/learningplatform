class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.token,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String? token;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'student',
      token: json['token']?.toString(),
    );
  }
}
