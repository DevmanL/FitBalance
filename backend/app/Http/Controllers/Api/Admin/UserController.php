<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with('roles', 'assessments', 'assignedNutritionist:id,name,email');

        // Nutritionists only see their assigned clients; super_admin sees all
        if ($request->user()->hasRole('nutritionist') && !$request->user()->hasRole('super_admin')) {
            $query->where('assigned_nutritionist_id', $request->user()->id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->role($request->role);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign roles
        if (isset($validated['roles'])) {
            $user->assignRole($validated['roles']);
        } else {
            $user->assignRole('user');
        }

        $user->load('roles', 'permissions');

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = User::with([
            'roles',
            'permissions',
            'assessments' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'assignedNutritionist:id,name,email',
            'profile',
        ])->findOrFail($id);

        // Nutritionists can only view their assigned clients
        if ($request->user()->hasRole('nutritionist') && !$request->user()->hasRole('super_admin')) {
            if ((int) $user->assigned_nutritionist_id !== (int) $request->user()->id) {
                return response()->json(['message' => 'No tienes acceso a este usuario.'], 403);
            }
        }

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'stats' => [
                'total_assessments' => $user->assessments()->count(),
                'latest_assessment' => $user->assessments()->latest()->first(),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8|confirmed',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'assigned_nutritionist_id' => 'nullable|exists:users,id',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // Only super_admin can assign nutritionist; never assign to super_admin or nutritionist (they manage the platform)
        if ($request->user()->hasRole('super_admin') && array_key_exists('assigned_nutritionist_id', $validated) && !$user->hasRole('super_admin') && !$user->hasRole('nutritionist')) {
            $user->assigned_nutritionist_id = $validated['assigned_nutritionist_id'];
        }

        $user->save();

        // Update roles
        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        $user->load('roles', 'permissions');

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting super admin
        if ($user->hasRole('super_admin')) {
            return response()->json([
                'message' => 'Cannot delete super admin user',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Assign roles to user
     */
    public function assignRoles(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user->syncRoles($validated['roles']);

        return response()->json([
            'message' => 'Roles assigned successfully',
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * Get all available roles
     */
    public function getRoles()
    {
        $roles = \Spatie\Permission\Models\Role::all()
            ->pluck('name')
            ->filter(function ($roleName) {
                return $roleName !== 'premium';
            })
            ->values();

        return response()->json($roles);
    }
}
