import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Vidyank',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF2563EB),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    auth.isAuthenticated ? auth.user!.email : 'Sign in to continue',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.home_outlined),
              title: const Text('Home'),
              onTap: () {
                Navigator.pop(context);
                context.go('/');
              },
            ),
            ListTile(
              leading: const Icon(Icons.menu_book_outlined),
              title: const Text('Courses'),
              onTap: () => Navigator.pop(context),
            ),
            if (auth.isAuthenticated) ...[
              ListTile(
                leading: const Icon(Icons.logout_rounded),
                title: const Text('Logout'),
                onTap: () async {
                  Navigator.pop(context);
                  await auth.logout();
                  if (context.mounted) context.go('/');
                },
              ),
            ] else ...[
              ListTile(
                leading: const Icon(Icons.login_rounded),
                title: const Text('Login'),
                onTap: () {
                  Navigator.pop(context);
                  context.push('/login');
                },
              ),
              ListTile(
                leading: const Icon(Icons.person_add_outlined),
                title: const Text('Register'),
                onTap: () {
                  Navigator.pop(context);
                  context.push('/register');
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}
