A complete portfolio management system with add, delete, buy, and sell functionality for managing your stock investments.

Demo: https://rfughlns.gensparkspace.com/

Features
1. Add new stocks to your portfolio
2. Buy more shares of existing positions
3. Sell part or all of your holdings
4. Delete positions from your portfolio
5. Track transaction history
6. View portfolio allocation
7. Analyze performance metrics
8. Visualize data with interactive charts
9. Light/dark mode toggle
10.Local storage persistence

Responsive design for all devices
Installation
To install and run this project locally:

git clone https://github.com/your-username/stock-portfolio-dashboard.git
cd stock-portfolio-dashboard
# Open index.html in your browser
Alternatively, you can deploy directly to GitHub Pages:

Fork this repository
Go to your fork's Settings > Pages
Select the main branch as the source
Click Save to deploy

Usage
Adding a New Stock
Click the "Add New Stock" button
Enter the stock details (Name, Ticker, Units, Purchase Price)
Submit the form
Buying More Shares
Find the stock in your holdings table
Click the "Buy" button in the Actions column
Enter the number of additional units and the purchase price
Submit the form
Selling Shares
Find the stock in your holdings table
Click the "Sell" button in the Actions column
Enter the number of units to sell and the selling price
Submit the form
Deleting a Position
Find the stock in your holdings table
Click the "Delete" button in the Actions column
Confirm the deletion

Project Structure
- stock-portfolio-dashboard/
  - index.html
  - css/
    - styles.css
  - js/
    - app.js
    - portfolio.js
    - charts.js
    - utils.js
  - README.md
  - .gitignore

Technologies Used
1. HTML5: For structure
2. CSS3: For styling and responsive design
3.JavaScript: For interactivity and functionality
4. Chart.js: For data visualization
5. LocalStorage API: For data persistence
6. FontAwesome: For icons

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch: git checkout -b feature/amazing-feature
Commit your changes: git commit -m 'Add some amazing feature'
Push to the branch: git push origin feature/amazing-feature
Open a Pull Request

License
This project is licensed under the MIT License - see the LICENSE file for details.
