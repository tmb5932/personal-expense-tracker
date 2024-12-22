# Personal Expense Tracker

## Overview

The Expense Tracker is a Flask-based web application designed to help users manage and visualize their expenses. Users can add purchases, view monthly expenses, analyze spending patterns through pie and line charts, and track all-time data. The application utilizes an SQLite database for data storage and dynamically updates visuals using Chart.js.

## Features

    - Add Purchases: Input expenses with details like date, business, amount, category, description, and an optional receipt photo.
    - View Recent Purchases: Display a list of the most recent expenses.
    - Monthly Overview: Visualize spending with dynamically generated charts (category breakdowns, totals by month).
    - All-Time Data: View cumulative spending trends and category distributions with line and pie charts.
    - Responsive Design: User-friendly UI, compatible across devices.

## Technologies Used

    - Backend:
            - Flask (Python)
            - SQLite
    - Frontend:
            - HTML5
            - CSS3
            - JavaScript
            - Chart.js
    - Other Tools:
            - Base64 for image handling
            - Fetch API for asynchronous requests

## Future Enhancements

    - User authentication for multiple accounts.
    - Export data as CSV or PDF.
    - Advanced filtering and search options.
    - Support for recurring expenses.
    - Improved mobile responsiveness.

## Authors Note

This project was initially made as a way to stay in practice over Winter break from College, but also from a specific (extremely minor) issue in my life. I track my expenses, as I find it interesting to look at how much I spend each month, and where that money goes.

The issue with existing (free) apps that I have tried is that they are either filled with ads, give a limited amount of saves, or simply are confusing to use or unintuitive. By creating this, I hope to not only solve my issue of using such apps, but I can customize it exactly as I want, allowing for ease of use and access to any information I wish, at any time.

**Made by Travis Brown**
