
const form = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");

const totalIncomeText = document.getElementById("total-income");
const totalExpensesText = document.getElementById("total-expenses");
const currentBalanceText = document.getElementById("current-balance");

const filterType = document.getElementById("filter-type");
const searchBox = document.getElementById("search-box");
const dateInput = document.getElementById("date");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

dateInput.valueAsDate = new Date();

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatMoney(amount) {
    return "LKR " + amount.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = dateInput.value;

    if (description === "" || category === "" || date === "" ||
        !Number.isFinite(amount) || amount <= 0) {
        alert("Please complete all fields and enter an amount greater than zero.");
        return;
    }

    const newTransaction = {
        id: Date.now(),
        type: type,
        description: description,
        amount: amount,
        category: category,
        date: date
    };

    transactions.push(newTransaction);

    saveTransactions();
    displayTransactions();

    form.reset();
    dateInput.valueAsDate = new Date();

    alert("Transaction added successfully!");
});

function deleteTransaction(id) {
    const answer = confirm("Are you sure you want to delete this transaction?");

    if (answer) {
        transactions = transactions.filter(function(item) {
            return item.id !== id;
        });

        saveTransactions();
        displayTransactions();
    }
}

function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function(item) {
        if (item.type === "Income") {
            totalIncome += item.amount;
        } else {
            totalExpenses += item.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    totalIncomeText.textContent = formatMoney(totalIncome);
    totalExpensesText.textContent = formatMoney(totalExpenses);
    currentBalanceText.textContent = formatMoney(balance);
}

function displayTransactions() {
    transactionList.innerHTML = "";

    const selectedType = filterType.value;
    const searchText = searchBox.value.trim().toLowerCase();

    const visibleTransactions = transactions.filter(function(item) {
        const typeMatches = selectedType === "All" ||
                            item.type === selectedType;

        const descriptionMatches = item.description.toLowerCase()
            .includes(searchText);

        const categoryMatches = item.category.toLowerCase()
            .includes(searchText);

        return typeMatches && (descriptionMatches || categoryMatches);
    });

    if (visibleTransactions.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "empty-message";
        cell.textContent = "No transactions found.";

        row.appendChild(cell);
        transactionList.appendChild(row);
    } else {
        visibleTransactions.forEach(function(item) {
            const row = document.createElement("tr");

            const dateCell = document.createElement("td");
            dateCell.textContent = item.date;

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = item.description;

            const typeCell = document.createElement("td");
            const typeLabel = document.createElement("span");

            typeLabel.textContent = item.type;

            typeLabel.className = item.type === "Income"
                ? "type-label income-label"
                : "type-label expense-label";

            typeCell.appendChild(typeLabel);

            const categoryCell = document.createElement("td");
            categoryCell.textContent = item.category;

            const amountCell = document.createElement("td");

            amountCell.textContent =
                (item.type === "Income" ? "+ " : "- ") +
                formatMoney(item.amount);

            amountCell.className = item.type === "Income"
                ? "income-amount"
                : "expense-amount";

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-button";

            deleteButton.addEventListener("click", function() {
                deleteTransaction(item.id);
            });

            actionCell.appendChild(deleteButton);

            row.appendChild(dateCell);
            row.appendChild(descriptionCell);
            row.appendChild(typeCell);
            row.appendChild(categoryCell);
            row.appendChild(amountCell);
            row.appendChild(actionCell);

            transactionList.appendChild(row);
        });
    }

    updateSummary();
}

form.addEventListener("reset", function() {
    setTimeout(function() {
        dateInput.valueAsDate = new Date();
    }, 0);
});

filterType.addEventListener("change", displayTransactions);
searchBox.addEventListener("input", displayTransactions);

displayTransactions();
