<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User permissions
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.manage_roles',
            
            // Assessment permissions
            'assessments.view',
            'assessments.view_all',
            'assessments.create',
            'assessments.edit',
            'assessments.delete',
            'assessments.manage',
            
            // Recommendation permissions
            'recommendations.view',
            'recommendations.create',
            'recommendations.edit',
            'recommendations.delete',
            'recommendations.manage',
            'recommendations.approve',
            
            // Analytics permissions
            'analytics.view',
            'analytics.view_all',
            
            // Reports permissions
            'reports.generate',
            'reports.export',
            
            // Settings permissions
            'settings.view',
            'settings.manage',
            'system.configure',
            
            // Content permissions
            'content.view',
            'content.create',
            'content.edit',
            'content.delete',
            'content.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        // Super Admin - All permissions
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin - Most permissions except system configuration
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'assessments.view_all', 'assessments.manage',
            'recommendations.manage', 'recommendations.approve',
            'analytics.view_all',
            'reports.generate', 'reports.export',
            'settings.view', 'settings.manage',
            'content.manage',
        ]);

        // Nutritionist/Trainer - Can view and manage assigned users' assessments
        $nutritionist = Role::create(['name' => 'nutritionist']);
        $nutritionist->givePermissionTo([
            'users.view',
            'assessments.view', 'assessments.view_all', 'assessments.create', 'assessments.edit',
            'recommendations.view', 'recommendations.create', 'recommendations.edit',
            'analytics.view',
        ]);

        // Regular User - Basic features (default)
        $regular = Role::create(['name' => 'user']);
        $regular->givePermissionTo([
            'assessments.view', 'assessments.create',
            'recommendations.view',
        ]);

        // Create a super admin user
        $superAdminUser = User::firstOrCreate(
            ['email' => 'admin@fitbalance.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('admin123456'),
            ]
        );
        $superAdminUser->assignRole('super_admin');

        $this->command->info('Roles and permissions created successfully!');
        $this->command->info('Super Admin created: admin@fitbalance.com / admin123456');
    }
}
