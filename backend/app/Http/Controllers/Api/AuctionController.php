<?php

class AuctionController extends Controller
{
    public function index()
    {
        return Auction::all();
    }

    public function store(Request $request)
    {
        return Auction::create($request->validate([
            'title' => 'required',
            'start_price' => 'required|numeric',
            'current_price' => 'required|numeric',
            'end_at' => 'required|date'
        ]));
    }
}
