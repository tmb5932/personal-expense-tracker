document.addEventListener("DOMContentLoaded", () => {
  // Get today's date in the format YYYY-MM-DD
  const today = new Date();

  const localDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  // Set the default value of the date input to today's date
  let ele = document.getElementById("date");
  if (ele) {
    ele.value = localDate;
  }

  const form = document.getElementById("purchaseForm");
  const statusMessage = document.getElementById("statusMessage");
  const purchasesTable = document.getElementById("purchasesTable");
  const monthlyOverview = document.getElementById("monthlyOverview");
  const monthlySpendingChart = document.getElementById("monthlySpendingChart");
  const allTimeCategoriesChart = document.getElementById(
    "allTimeCategoriesChart"
  );

  // Handle form submission
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    let tempDate = form.date.value;
    formData.append("date", form.date.value);
    formData.append("business", form.business.value);
    formData.append("amount", parseFloat(form.amount.value));

    if (form.category.value === "Other") {
      formData.append("category", form.customCategory.value);
    } else {
      formData.append("category", form.category.value);
    }
    formData.append("description", form.description.value);

    const photoFile = form.photo.files[0];
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const response = await fetch("/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        statusMessage.textContent = "Purchase added successfully!";
        form.reset();
        document.getElementById("date").value = tempDate;
        const customCategoryInput = document.getElementById("customCategory");
        customCategoryInput.style.display = "none";
        customCategoryInput.required = false;
        customCategoryInput.value = "";
      } else {
        statusMessage.textContent = "Error adding purchase.";
      }
    } catch (error) {
      console.error("Error:", error);
      statusMessage.textContent = "An unexpected error occurred.";
    }
  });

  // Populate the purchases table if it exists
  if (purchasesTable) {
    fetch("/month-data")
      .then((response) => response.json())
      .then((purchases) => {
        const tbody = purchasesTable.querySelector("tbody");
        purchases.forEach((purchase) => {
          const row = document.createElement("tr");
          row.innerHTML = `
                        <td>${purchase.date}</td>
                        <td>${purchase.business}</td>
                        <td>${purchase.amount.toFixed(2)}</td>
                        <td>${purchase.category}</td>
                        <td>${purchase.description}</td>
                        <td>
                            ${
                              purchase.photo
                                ? `<img src="data:image/jpeg;base64,${purchase.photo}" alt="Purchase Photo" style="max-width: 100px; max-height: 100px;">`
                                : "No Photo"
                            }
                        </td>
                    `;
          tbody.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Error fetching purchases:", error);
      });
  }

  // Populate the monthly overview if on overview page
  if (monthlyOverview) {
    fetch("/overview-data")
      .then((response) => response.json())
      .then((months) => {
        months.forEach((item) => {
          const div = document.createElement("div");
          div.className = "overview-item";

          const monthSpan = document.createElement("span");
          monthSpan.className = "month-name";
          monthSpan.textContent = getMonthName(item.month);

          const totalSpan = document.createElement("span");
          totalSpan.className = "total-amount";
          totalSpan.textContent = `Total: $${item.total.toFixed(2)}`;

          // Container for the pie chart
          const chartContainer = document.createElement("div");
          chartContainer.className = "pie-chart-container";

          const canvas = document.createElement("canvas");
          canvas.className = "pie-chart";
          chartContainer.appendChild(canvas);

          div.appendChild(monthSpan);
          div.appendChild(totalSpan);
          div.appendChild(chartContainer);

          monthlyOverview.appendChild(div);

          fetch(`/monthly-category-data?month=${item.month}`)
            .then((response) => response.json())
            .then((categorical_data) => {
              if (!Array.isArray(categorical_data)) {
                throw new Error("Expected an array but got something else");
              }

              const categories = categorical_data.map((data) => data.category);
              const totals = categorical_data.map(
                (data) => data.category_amount
              );

              const categoryColors = {
                Restaurants: "#FF5733", // Red
                "Furniture/Home": "#33FF57", // Green
                "Gas/Car": "#3357FF", // Blue
                Clothes: "#FF33A1", // Pink
                "School/Office Supplies": "#FF8C33", // Orange
                Misc: "#33FFF5", // Cyan
                Groceries: "#8C33FF", // Purple
              };

              const defaultColor = "grey"; // Default color for categories not in the mapping

              const backgroundColors = categories.map((category) => {
                const color = categoryColors[category] || defaultColor;
                return color;
              });

              // Create the pie chart of categories
              new Chart(canvas, {
                type: "pie",
                data: {
                  labels: categories,
                  datasets: [
                    {
                      data: totals,
                      backgroundColor: backgroundColors,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                },
              });
            })
            .catch((error) => {
              console.error("Error fetching monthly category data:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching monthly overview data:", error);
      });
  }
  if (monthlySpendingChart) {
    fetch("/overview-data?sort=ASC")
      .then((response) => response.json())
      .then((data) => {
        const ctx = document
          .getElementById("monthlySpendingChart")
          .getContext("2d");
        new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map((item) => getMonthYear(item.month)),
            datasets: [
              {
                label: "Total Spent",
                data: data.map((item) => item.total),
                borderColor: "#36A2EB",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Month",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Total Spent",
                },
              },
            },
          },
        });
      })
      .catch((error) =>
        console.error("Error fetching monthly total data:", error)
      );

    fetch(`/monthly-category-data`)
      .then((response) => response.json())
      .then((categorical_data) => {
        if (!Array.isArray(categorical_data)) {
          throw new Error("Expected an array but got something else");
        }

        const categories = categorical_data.map((data) => data.category);
        const totals = categorical_data.map((data) => data.category_amount);

        const categoryColors = {
          Restaurants: "#FF5733", // Red
          "Furniture/Home": "#33FF57", // Green
          "Gas/Car": "#3357FF", // Blue
          Clothes: "#FF33A1", // Pink
          "School/Office Supplies": "#FF8C33", // Orange
          Misc: "#33FFF5", // Cyan
          Groceries: "#8C33FF", // Purple
        };

        const defaultColor = "grey"; // Default color for categories not in the mapping

        const backgroundColors = categories.map((category) => {
          const color = categoryColors[category] || defaultColor;
          return color;
        });

        // Create the pie chart of categories
        new Chart(allTimeCategoriesChart, {
          type: "pie",
          data: {
            labels: categories,
            datasets: [
              {
                data: totals,
                backgroundColor: backgroundColors,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching monthly category data:", error);
      });
  }
});

const getMonthName = (dateString) => {
  const [year, month] = dateString.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleString("default", { month: "long" });
};

const getMonthYear = (dateString) => {
  const [year, month] = dateString.split("-");
  return `${getMonthName(dateString)} ${year}`;
};

function toggleCustomCategory(select) {
  const customCategoryInput = document.getElementById("customCategory");
  if (select.value === "Other") {
    customCategoryInput.style.display = "block";
    customCategoryInput.required = true;
  } else {
    customCategoryInput.style.display = "none";
    customCategoryInput.required = false;
    customCategoryInput.value = "";
  }
}
