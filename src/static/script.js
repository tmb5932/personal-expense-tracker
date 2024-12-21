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
    fetch("/month-data") // Adjust endpoint to fetch data
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

  // Populate the monthly overview if it exists
  if (monthlyOverview) {
    fetch("/overview-data") // Adjust endpoint to fetch monthly overview data
      .then((response) => response.json())
      .then((months) => {
        months.forEach((item) => {
          const div = document.createElement("div");
          div.className = "overview-item";

          // Create a span for the month name
          const monthSpan = document.createElement("span");
          monthSpan.className = "month-name";
          monthSpan.textContent = getMonthName(item.month);

          // Create a span for the total amount
          const totalSpan = document.createElement("span");
          totalSpan.className = "total-amount";
          totalSpan.textContent = `$${item.total.toFixed(2)}`;

          // Create a container for the pie chart
          const chartContainer = document.createElement("div");
          chartContainer.className = "pie-chart-container";

          // Create a canvas for the pie chart
          const canvas = document.createElement("canvas");
          canvas.className = "pie-chart";

          // Append the canvas to the chart container
          chartContainer.appendChild(canvas);

          // Append the spans and chart container to the div
          div.appendChild(monthSpan);
          div.appendChild(totalSpan);
          div.appendChild(chartContainer);

          monthlyOverview.appendChild(div);

          // Create the pie chart
          new Chart(canvas, {
            type: "pie",
            data: {
              labels: ["Spent", "Remaining", "Extra"],
              datasets: [
                {
                  data: [70, 30, 0],
                  backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
            },
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching monthly overview data:", error);
      });
  }
});

const getMonthName = (dateString) => {
  const [year, month] = dateString.split("-"); // Split the date string
  const date = new Date(year, month - 1); // Create a Date object (month is 0-based)
  return date.toLocaleString("default", { month: "long" }); // Get the full month name
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
