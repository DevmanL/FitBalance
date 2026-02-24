<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\AssessmentController as AdminAssessmentController;
use App\Http\Controllers\Api\Nutritionist\NoteController;
use App\Http\Middleware\CheckPermission;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

        // User profile & goals
        Route::get('/user/profile', [UserProfileController::class, 'show']);
        Route::put('/user/profile', [UserProfileController::class, 'update']);

    // Assessment routes (user)
    Route::apiResource('assessments', AssessmentController::class);
    Route::get('/assessments/{id}/recommendations', [RecommendationController::class, 'index']);
    
    // User can view notes on their own assessments (read-only)
    Route::get('/assessments/{assessmentId}/notes', [NoteController::class, 'index']);

    // Recommendation routes
    Route::get('/assessments/{assessmentId}/recommendations/{type}', [RecommendationController::class, 'byType']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:analytics.view_all');
        
        // Nutritionist dashboard (uses analytics.view permission)
        Route::get('/dashboard/nutritionist', [DashboardController::class, 'nutritionist'])->middleware('permission:analytics.view');

        // Users management
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::get('/users/{id}', [UserController::class, 'show'])->middleware('permission:users.view');
        Route::get('/users/roles/all', [UserController::class, 'getRoles'])->middleware('permission:users.view');
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:users.edit');
        Route::post('/users/{id}/roles', [UserController::class, 'assignRoles'])->middleware('permission:users.edit');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete');

        // Assessments management
        Route::get('/assessments', [AdminAssessmentController::class, 'index'])->middleware('permission:assessments.view_all');
        Route::get('/assessments/statistics', [AdminAssessmentController::class, 'statistics'])->middleware('permission:assessments.view_all');
        Route::get('/assessments/{id}', [AdminAssessmentController::class, 'show'])->middleware('permission:assessments.view_all');
        Route::put('/assessments/{id}', [AdminAssessmentController::class, 'update'])->middleware('permission:assessments.manage');
        Route::delete('/assessments/{id}', [AdminAssessmentController::class, 'destroy'])->middleware('permission:assessments.manage');
    });

    // Nutritionist routes
    Route::prefix('nutritionist')->middleware('permission:assessments.view')->group(function () {
        // Notes management
        Route::get('/assessments/{assessmentId}/notes', [NoteController::class, 'index']);
        Route::get('/users/{userId}/notes', [NoteController::class, 'byUser']);
        Route::post('/assessments/{assessmentId}/notes', [NoteController::class, 'store'])->middleware('permission:assessments.edit');
        Route::put('/notes/{noteId}', [NoteController::class, 'update'])->middleware('permission:assessments.edit');
        Route::delete('/notes/{noteId}', [NoteController::class, 'destroy'])->middleware('permission:assessments.edit');
    });
});

