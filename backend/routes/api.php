<?php

// routes/api.php
use App\Http\Controllers\Api\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', fn(Request $r) => $r->user());
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auctions', [AuctionController::class, 'index']);
    Route::post('/auctions', [AuctionController::class, 'store']);
});
