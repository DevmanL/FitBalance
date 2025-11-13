<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\RecommendationController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Assessment routes
    Route::apiResource('assessments', AssessmentController::class);
    Route::get('/assessments/{id}/recommendations', [RecommendationController::class, 'index']);

    // Recommendation routes
    Route::get('/assessments/{assessmentId}/recommendations/{type}', [RecommendationController::class, 'byType']);
});

